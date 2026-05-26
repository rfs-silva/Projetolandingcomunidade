import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { requireDashboardSession } from '@/server/lib/dashboard-session'
import { isAdminType } from '@/server/lib/admin-session'
import { ThreadForm } from '../ThreadForm'

export const metadata = {
  title: 'Novo tópico · Fórum',
}

export const dynamic = 'force-dynamic'

export default async function NewThreadPage() {
  const { profile } = await requireDashboardSession('/dashboard/forum/novo')

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/dashboard/forum"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Voltar para o fórum
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
          <Plus size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Novo tópico
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Compartilhe uma dúvida, anúncio ou discussão com a comunidade.
          </p>
        </div>
      </div>

      <ThreadForm canPostAnnouncements={isAdminType(profile.type)} />
    </section>
  )
}
