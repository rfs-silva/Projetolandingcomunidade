/* Service Worker da Comunidade Roraima Fullstack Developers.
 *
 * Estratégia minimalista pra POC:
 *  - Pre-cache do shell público (logo, manifest, página offline)
 *  - Network-first pra navegação HTML — o usuário sempre vê conteúdo atual
 *    se estiver online; quando offline, mostra uma página de fallback
 *  - NÃO cacheia rotas autenticadas (/api/me, /dashboard, /admin, etc),
 *    nem chamadas de /api/* — privacidade > velocidade
 *
 * Quando precisar de cache mais agressivo (assets versionados, imagens),
 * trocar por Workbox ou estratégia cache-first específica por path.
 */

const VERSION = 'crfd-v1'
const SHELL = ['/offline', '/logo.svg', '/logo-horizontal.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)),
      ),
    ),
  )
  self.clients.claim()
})

function isPrivatePath(pathname) {
  return (
    pathname.startsWith('/api') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/empresa/painel')
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (isPrivatePath(url.pathname)) return

  // Network-first pra HTML; cai pra cache só se offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/offline').then((r) => r ?? Response.error()),
      ),
    )
    return
  }

  // Outros assets públicos (logo, manifest): cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ??
        fetch(request).then((res) => {
          // Só cacheia respostas OK same-origin
          if (res.ok && res.type === 'basic') {
            const copy = res.clone()
            caches.open(VERSION).then((cache) => cache.put(request, copy))
          }
          return res
        })
      )
    }),
  )
})
