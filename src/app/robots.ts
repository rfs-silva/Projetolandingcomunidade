import type { MetadataRoute } from 'next'

/**
 * robots.txt — gerado dinamicamente. Permite indexar conteúdo público
 * e bloqueia explicitamente áreas autenticadas e API. O middleware já
 * envia `X-Robots-Tag: noindex` nas mesmas rotas por reforço.
 */
function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.AUTH_URL ??
    'http://localhost:3000'
  )
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/onboarding/',
          '/empresa/painel/',
          '/empresa/login',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
