import Link from 'next/link'
import { ArrowLeft, FileJson } from 'lucide-react'
import { SwaggerUI } from './SwaggerUI'

export const metadata = {
  title: 'API',
  description: 'Documentação interativa da API REST.',
}

export const dynamic = 'force-static'

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-subtle">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Voltar para o site
            </Link>
            <span className="text-zinc-700">·</span>
            <h1 className="text-base font-semibold text-foreground">
              API REST · Comunidade Roraima Fullstack Developers
            </h1>
          </div>
          <Link
            href="/api/openapi.json"
            target="_blank"
            className="inline-flex items-center gap-2 text-xs text-primary-destaque hover:underline"
          >
            <FileJson size={14} /> openapi.json
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-start gap-3 text-sm text-muted-foreground">
          <ArrowLeft size={16} className="opacity-0" />
          <p>
            Endpoints públicos não exigem autenticação. Rotas <code>/api/me/*</code>{' '}
            e <code>/api/admin/*</code> usam o cookie de sessão emitido pelo
            login com GitHub — se você estiver logado neste navegador, o
            &quot;Try it out&quot; já vai funcionar para essas rotas.
          </p>
        </div>

        <SwaggerUI />
      </section>
    </main>
  )
}
