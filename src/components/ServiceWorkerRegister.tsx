'use client'

import { useEffect } from 'react'

/**
 * Registra o service worker em /sw.js depois do mount. Só roda em
 * produção (em dev, Next.js HMR cuida do reload e o SW só atrapalha).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const onLoad = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch(() => {
          // Falha silenciosa — PWA é progressivo, app funciona sem ele.
        })
    }

    if (document.readyState === 'complete') {
      onLoad()
    } else {
      window.addEventListener('load', onLoad, { once: true })
      return () => window.removeEventListener('load', onLoad)
    }
  }, [])

  return null
}
