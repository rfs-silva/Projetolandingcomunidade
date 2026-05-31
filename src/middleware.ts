import { auth } from '@/auth'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/onboarding', '/admin']

/**
 * Origens autorizadas a fazer requests cross-site para `/api/*`. Em prod,
 * vem de `ALLOWED_ORIGINS` (lista separada por vírgula); inclui o frontend
 * e o próprio subdomínio de API (que serve este Next.js). Em dev,
 * libera localhost.
 */
function getAllowedOrigins(): string[] {
  const fromEnv = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (fromEnv.length > 0) return fromEnv
  if (process.env.NODE_ENV !== 'production') {
    return ['http://localhost:3000']
  }
  return []
}
const ALLOWED_ORIGINS = getAllowedOrigins()

/**
 * Hostnames extras (ex.: `api-rrfullstack.sistemasme.com`) cujas URLs
 * devem aparecer no CSP `connect-src` para que chamadas cross-subdomain
 * do frontend para a API não sejam bloqueadas pelo browser.
 */
function getApiHostnames(): string[] {
  const list = (process.env.NEXT_PUBLIC_API_URL ?? '').trim()
  return list ? [list] : []
}
const API_HOSTNAMES = getApiHostnames()

/**
 * Content-Security-Policy: restringe origens permitidas para reduzir
 * superfície de XSS. Em produção, considerar usar nonce ao invés de
 * 'unsafe-inline' nos scripts.
 */
function buildCsp(): string {
  const isDev = process.env.NODE_ENV !== 'production'
  const connectSrc = ['self', ...API_HOSTNAMES]
    .map((s) => (s === 'self' ? "'self'" : s))
    .join(' ')

  const directives = [
    `default-src 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `object-src 'none'`,
    `worker-src 'self'`,
    `manifest-src 'self'`,
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'unsafe-inline'`,
    `font-src 'self' data:`,
    `img-src 'self' data: blob: https://i.pravatar.cc https://picsum.photos https://avatars.githubusercontent.com https://*.githubusercontent.com`,
    `connect-src ${connectSrc}`,
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

/**
 * Aplica CORS em respostas de `/api/*` quando o pedido vem de origem
 * cross-site. Mantemos `credentials: true` para que o cookie de sessão
 * (com `domain=.sistemasme.com`) seja enviado nas chamadas cross-subdomain.
 */
function applyCors(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get('origin')
  if (!origin) return
  if (!ALLOWED_ORIGINS.includes(origin)) return

  res.headers.set('Access-Control-Allow-Origin', origin)
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  res.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS',
  )
  res.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With',
  )
  res.headers.set('Access-Control-Max-Age', '86400')
  res.headers.append('Vary', 'Origin')
}

/**
 * Quando o request chega no subdomínio de API mas para um path que NÃO
 * é `/api`/`/_next` (ex.: alguém digitou a raiz do api- subdomain),
 * redireciona para o domínio principal — mantém a separação visual sem
 * exigir reverse proxy diferente.
 */
function redirectNonApiOnApiHost(req: NextRequest): NextResponse | null {
  const host = req.headers.get('host') ?? ''
  if (!host.startsWith('api-')) return null

  const { pathname, search } = req.nextUrl
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return null
  }

  const mainHost = host.replace(/^api-/, '')
  const protocol = req.nextUrl.protocol || 'https:'
  return NextResponse.redirect(
    `${protocol}//${mainHost}${pathname}${search}`,
    308,
  )
}

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Subdomínio de API só serve /api/*; demais paths vão pro frontend.
  const apiRedirect = redirectNonApiOnApiHost(req)
  if (apiRedirect) {
    applySecurityHeaders(apiRedirect, pathname)
    return apiRedirect
  }

  // Preflight CORS: responde 204 sem entrar na lógica de auth.
  if (req.method === 'OPTIONS' && pathname.startsWith('/api')) {
    const res = new NextResponse(null, { status: 204 })
    applySecurityHeaders(res, pathname)
    applyCors(req, res)
    return res
  }

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
  if (pathname.startsWith('/api')) {
    applyCors(req, res)
  }
  return res
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
