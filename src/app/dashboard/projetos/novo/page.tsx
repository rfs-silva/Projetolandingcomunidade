import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { requireDashboardSession } from '@/server/lib/dashboard-session'
import { tagsService } from '@/server/services/tags.service'
import { ProjectForm } from '../ProjectForm'

export const metadata = {
  title: 'Novo projeto · Comunidade Roraima',
}

export const dynamic = 'force-dynamic'

export default async function NewProjectPage() {
  await requireDashboardSession('/dashboard/projetos/novo')
  const allTags = await tagsService.list({ category: 'STACK' })

  return (
    <section className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/dashboard/projetos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Voltar para meus projetos
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
          <Plus size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Novo projeto
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Compartilhe o que você está construindo com a comunidade.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <ProjectForm allTags={allTags} />
      </div>
    </section>
  )
}
