import type { MetadataRoute } from 'next'

/**
 * Web App Manifest (PWA). Next.js serve isso em `/manifest.webmanifest`
 * automaticamente e a tag <link rel="manifest"> é injetada no <head>.
 *
 * Os ícones reusam o logo SVG existente, que escala bem em qualquer
 * tamanho. Quando tivermos arte específica por densidade, basta substituir.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Comunidade Roraima Fullstack Developers',
    short_name: 'CRFD',
    description:
      'Comunidade de desenvolvedores de Roraima. Mentoria, desafios, eventos e projetos.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    lang: 'pt-BR',
    dir: 'ltr',
    categories: ['social', 'education', 'developer'],
    // Ícones SVG escalam em qualquer densidade. Para suporte mais amplo de
    // install em Android (Chrome exige PNG raster), gerar versões 192/512
    // a partir do SVG — está no roadmap do README.
    icons: [
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
