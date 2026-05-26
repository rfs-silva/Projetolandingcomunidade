import Link from 'next/link'
import { Lock, MessageSquare, Pin } from 'lucide-react'
import { requireAdminSession } from '@/server/lib/admin-session'
import { forumService } from '@/server/services/forum.service'
import {
  FORUM_CATEGORY_LABELS,
  type ForumCategory,
} from '@/server/schemas/forum.schema'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { cn } from '@/lib/utils'
import { ThreadAdminActions } from './ThreadAdminActions'

export const metadata = {
  title: 'Admin · Fórum',
}

export const dynamic = 'force-dynamic'

const CATEGORY_TONE: Record<ForumCategory, string> = {
  GERAL: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30',
  ANUNCIOS: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  AJUDA: 'bg-primary/10 text-primary-destaque border-primary/30',
  CARREIRA: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  OFF_TOPIC: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
}

export default async function AdminForumPage() {
  await requireAdminSession()
  const threads = await forumService.listForAdmin(100)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
          <MessageSquare size={20} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Fórum
          </h1>
          <p className="text-sm text-muted-foreground">
            Fixe, feche ou exclua tópicos. Mostra os 100 mais recentes.
          </p>
        </div>
      </header>

      {threads.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border border-dashed">
          <p className="text-sm text-muted-foreground">
            Nenhum tópico no fórum ainda.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-subtle">
                <th className="px-4 py-3">Tópico</th>
                <th className="px-4 py-3 hidden md:table-cell">Autor</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Replies</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {threads.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-subtle last:border-b-0 hover:bg-card/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/forum/${t.id}`}
                      className="font-medium text-foreground hover:text-primary-destaque"
                    >
                      {t.title}
                    </Link>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          'text-[10px] uppercase tracking-wider border px-1.5 py-0.5 rounded',
                          CATEGORY_TONE[t.category],
                        )}
                      >
                        {FORUM_CATEGORY_LABELS[t.category]}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        src={t.author.avatarUrl}
                        name={t.author.displayName}
                        seed={t.author.githubUsername}
                        size="sm"
                      />
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {t.author.displayName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {t.isPinned ? (
                        <Pin size={12} className="text-amber-400" />
                      ) : null}
                      {t.isLocked ? (
                        <Lock size={12} className="text-muted-foreground" />
                      ) : null}
                      {!t.isPinned && !t.isLocked ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {t.repliesCount}
                  </td>
                  <td className="px-4 py-3">
                    <ThreadAdminActions
                      threadId={t.id}
                      isPinned={t.isPinned}
                      isLocked={t.isLocked}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
