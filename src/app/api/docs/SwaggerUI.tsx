'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

const SWAGGER_VERSION = '5.17.14'
const SWAGGER_BUNDLE = `https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_VERSION}/swagger-ui-bundle.js`
const SWAGGER_CSS = `https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_VERSION}/swagger-ui.css`

/**
 * Renderiza Swagger UI usando o bundle oficial via CDN. A página chama
 * `/api/openapi.json` que devolve a spec gerada a partir dos schemas Zod.
 */
export function SwaggerUI() {
  const ready = useRef(false)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = SWAGGER_CSS
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  function onScriptReady() {
    if (ready.current) return
    ready.current = true
    const SwaggerUIBundle = (window as unknown as {
      SwaggerUIBundle?: (config: Record<string, unknown>) => unknown
    }).SwaggerUIBundle
    if (!SwaggerUIBundle) return
    SwaggerUIBundle({
      url: '/api/openapi.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      persistAuthorization: true,
      tryItOutEnabled: true,
      withCredentials: true,
    })
  }

  return (
    <>
      <Script
        src={SWAGGER_BUNDLE}
        strategy="afterInteractive"
        onLoad={onScriptReady}
      />
      <div
        id="swagger-ui"
        className="bg-white text-black min-h-[60vh] rounded-xl"
      />
    </>
  )
}
