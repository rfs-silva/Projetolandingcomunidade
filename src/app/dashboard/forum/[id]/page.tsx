import Link from 'next/link'
import { ArrowLeft, Lock, MessageSquare, Pencil, Pin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { requireDashboardSession } from '@/server/lib/dashboard-session'
import { isAdminType } from '@/server/lib/admin-session'
import { forumService } from '@/server/services/forum.service'
import {
  FORUM_CATEGORY_LABELS,
  type ForumCategory,
} from '@/server/schemas/forum.schema'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Tópico · Fórum',
}

export const dynamic = 'force-dynamic'

const CATEGORY_TONE: Record<ForumCategory, string> = {
  GERAL: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30',
  ANUNCIOS: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  AJUDA: 'bg-primary/10 text-primary-destaque border-primary/30',
  CARREIRA: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  OFF_TOPIC: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId, profile } = await requireDashboardSession('/dashboard/forum')
  const { id } = await params
  const { thread, replies } = await forumService.getById(id)

  const canEdit = thread.author.id === userId || isAdminType(profile.type)

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/dashboard/forum"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Voltar para o fórum
      </Link>

      <article className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'text-[10px] uppercase tracking-wider border px-1.5 py-0.5 rounded',
                CATEGORY_TONE[thread.category],
              )}
            >
              {FORUM_CATEGORY_LABELS[thread.category]}
            </span>
            {thread.isPinned ? (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
                <Pin size={10} /> Fixado
              </span>
            ) : null}
            {thread.isLocked ? (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground bg-background-secondary border border-subtle px-1.5 py-0.5 rounded">
                <Lock size={10} /> Fechado
              </span>
            ) : null}
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            {thread.title}
          </h1>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <UserAvatar
                src={thread.author.avatarUrl}
                name={thread.author.displayName}
                seed={thread.author.githubUsername}
              />
              <div>
                <div className="text-sm font-medium text-foreground">
                  {thread.author.displayName}
                </div>
                <div className="text-xs text-muted-foreground">
                  @{thread.author.githubUsername} ·{' '}
                  {new Date(thread.createdAt).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
            {canEdit ? (
              <Link href={`/dashboard/forum/${thread.id}/editar`}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={<Pencil size={14} />}
                  iconPosition="left"
                >
                  Editar
                </Button>
              </Link>
            ) : null}
          </div>
        </header>

        <div className="rounded-xl border border-subtle bg-card p-6">
          <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/90 leading-relaxed">
            {thread.body}
          </pre>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t border-subtle">
          <MessageSquare size={16} />
          <span>
            {replies.length} {replies.length === 1 ? 'resposta' : 'respostas'}
          </span>
        </div>

        {replies.length > 0 ? (
          <div className="flex flex-col gap-4">
            {replies.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-subtle bg-card p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <UserAvatar
                    src={r.author.avatarUrl}
                    name={r.author.displayName}
                    seed={r.author.githubUsername}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {r.author.displayName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/90 leading-relaxed">
                  {r.body}
                </pre>
              </div>
            ))}
          </div>
        ) : null}

        {thread.isLocked ? (
          <div className="rounded-xl border border-subtle bg-card/40 p-5 text-center text-sm text-muted-foreground">
            <Lock size={16} className="inline mr-2 align-middle" />
            Este tópico está fechado para novas respostas.
          </div>
        ) : (
          <div className="rounded-xl border border-subtle bg-card/40 p-5 text-center text-sm text-muted-foreground">
            Formulário de resposta chega no próximo passo (F4).
          </div>
        )}
      </article>
    </section>
  )
}
