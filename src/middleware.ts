import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/onboarding', '/admin']

/**
 * Aplica cabeçalhos de segurança em toda resposta.
 * - Bloqueia fingerprinting de stack (X-Powered-By, Server)
 * - Mitiga clickjacking (X-Frame-Options), MIME-sniffing, leak de referer
 * - Restringe permissões de browser APIs não usadas
 * - Marca áreas autenticadas como noindex e sem cache
 */
/**
 * Content-Security-Policy: restringe origens permitidas para reduzir
 * superfície de XSS. Permite o mínimo necessário para o app funcionar:
 * - `'self'`: todos os assets do mesmo domínio
 * - `'unsafe-inline'` em styles: Tailwind/CSS-in-JS injeta inline
 * - `'unsafe-inline' 'unsafe-eval'` em scripts: Next.js precisa em dev
 *   e (infelizmente) usa eval em alguns chunks de runtime
 * - imagens externas confiáveis usadas pelo app (avatars, placeholders)
 *
 * Em produção, considerar usar nonce ao invés de 'unsafe-inline' nos
 * scripts. Por ora, fica restritivo o suficiente para bloquear injeção
 * de scripts de domínios não permitidos.
 */
function buildCsp(): string {
  const isDev = process.env.NODE_ENV !== 'production'
  const directives = [
    `default-src 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `object-src 'none'`,
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'unsafe-inline'`,
    `font-src 'self' data:`,
    `img-src 'self' data: blob: https://i.pravatar.cc https://picsum.photos https://avatars.githubusercontent.com https://*.githubusercontent.com`,
    `connect-src 'self'`,
    `upgrade-insecure-requests`,
  ]
  return directives.join('; ')
}

const CSP = buildCsp()

function applySecurityHeaders(res: NextResponse, pathname: string) {
  res.headers.delete('x-powered-by')
  res.headers.delete('server')

  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  )
  res.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  )

  // CSP só em respostas HTML (não em assets/API). Para APIs e arquivos
  // estáticos, faria mais ruído do que benefício.
  const isApi = pathname.startsWith('/api')
  if (!isApi) {
    res.headers.set('Content-Security-Policy', CSP)
  }

  const isAuthedArea =
    pathname.startsWith('/api/me') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin')

  if (isAuthedArea) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  }

  if (isApi) {
    res.headers.set('Cache-Control', 'no-store, max-age=0')
  }
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))

  if (isProtected && !req.auth) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    const res = NextResponse.redirect(loginUrl)
    applySecurityHeaders(res, pathname)
    return res
  }

  const res = NextResponse.next()
  applySecurityHeaders(res, pathname)
  return res
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
