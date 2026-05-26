import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'
import { requireDashboardSession } from '@/server/lib/dashboard-session'
import { isAdminType } from '@/server/lib/admin-session'
import { forumService } from '@/server/services/forum.service'
import { AppError } from '@/server/http/errors'
import { redirect } from 'next/navigation'
import { ThreadForm } from '../../ThreadForm'
import { DeleteThreadButton } from '../../DeleteThreadButton'

export const metadata = {
  title: 'Editar tópico · Fórum',
}

export const dynamic = 'force-dynamic'

export default async function EditThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId, profile } = await requireDashboardSession('/dashboard/forum')
  const { id } = await params
  const { thread } = await forumService.getById(id)

  const isOwner = thread.author.id === userId
  const isAdmin = isAdminType(profile.type)
  if (!isOwner && !isAdmin) {
    throw new AppError('FORBIDDEN', 'Você não pode editar esse tópico', 403)
  }
  // garante que redirect funciona caso o link seja seguido fora de contexto
  void redirect

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/dashboard/forum/${thread.id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Voltar para o tópico
      </Link>

      <div className="flex items-start justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
            <Pencil size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              Editar tópico
            </h1>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
              {thread.title}
            </p>
          </div>
        </div>
        <DeleteThreadButton threadId={thread.id} />
      </div>

      <ThreadForm
        canPostAnnouncements={isAdmin}
        initial={{
          id: thread.id,
          title: thread.title,
          body: thread.body,
          category: thread.category,
        }}
      />
    </section>
  )
}
