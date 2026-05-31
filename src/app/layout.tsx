import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Comunidade Roraima Fullstack Developers',
    template: '%s · Comunidade Roraima Fullstack Developers',
  },
  description:
    'Comunidade de desenvolvedores de Roraima. Mentoria, desafios, eventos e projetos.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Permite zoom até 5x (não trava em 1x — boa prática de acessibilidade)
  maximumScale: 5,
  // Cobre notch / safe areas em iOS quando rodar como PWA standalone
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
