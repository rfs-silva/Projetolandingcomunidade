import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, Lock, MessageSquare, Pin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { requireDashboardSession } from '@/server/lib/dashboard-session'
import { forumService } from '@/server/services/forum.service'
import {
  forumCategorySchema,
  threadQuerySchema,
  FORUM_CATEGORY_LABELS,
  type ForumCategory,
} from '@/server/schemas/forum.schema'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Fórum',
}

export const dynamic = 'force-dynamic'

const CATEGORY_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Todas' },
  ...Object.entries(FORUM_CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
]

const CATEGORY_TONE: Record<ForumCategory, string> = {
  GERAL: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30',
  ANUNCIOS: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  AJUDA: 'bg-primary/10 text-primary-destaque border-primary/30',
  CARREIRA: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  OFF_TOPIC: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
}

function formatRelative(date: Date | null) {
  if (!date) return '—'
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d`
  return new Date(date).toLocaleDateString('pt-BR')
}

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  await requireDashboardSession('/dashboard/forum')
  const params = await searchParams
  const query = threadQuerySchema.parse(params)
  const result = await forumService.list(query)

  const activeCategory = query.category ?? ''

  function buildHref(overrides: Record<string, string | null>) {
    const next = new URLSearchParams()
    if (query.category) next.set('category', query.category)
    if (query.q) next.set('q', query.q)
    for (const [k, v] of Object.entries(overrides)) {
      if (v === null) next.delete(k)
      else next.set(k, v)
    }
    const qs = next.toString()
    return qs ? `/dashboard/forum?${qs}` : '/dashboard/forum'
  }

  function categoryHref(value: string) {
    const next = new URLSearchParams()
    if (value) next.set('category', value)
    if (query.q) next.set('q', query.q)
    const qs = next.toString()
    return qs ? `/dashboard/forum?${qs}` : '/dashboard/forum'
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Voltar para o painel
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
            <MessageSquare size={22} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
              Fórum
            </h1>
            <p className="text-sm text-muted-foreground">
              Discussões da comunidade. Markdown suportado nos posts.
            </p>
          </div>
        </div>
        <Link href="/dashboard/forum/novo">
          <Button
            type="button"
            variant="default"
            icon={<Plus size={16} />}
            iconPosition="left"
            className="h-10"
          >
            Novo tópico
          </Button>
        </Link>
      </div>

      <form
        method="get"
        className="flex flex-col gap-4 border-b border-subtle pb-4 mb-6"
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-subtle bg-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
          <input
            type="search"
            name="q"
            defaultValue={query.q ?? ''}
            placeholder="Buscar por título ou conteúdo..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query.category ? (
            <input type="hidden" name="category" value={query.category} />
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((c) => {
            const isActive = activeCategory === c.value
            return (
              <Link
                key={c.value || 'all'}
                href={categoryHref(c.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary-destaque border-primary/30'
                    : 'bg-background-secondary text-muted-foreground border-subtle hover:text-foreground',
                )}
              >
                {c.label}
              </Link>
            )
          })}
        </div>
      </form>

      <p className="text-xs text-muted-foreground mb-4">
        {result.total} {result.total === 1 ? 'tópico' : 'tópicos'}
      </p>

      {result.threads.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border border-dashed">
          <p className="text-sm text-muted-foreground">
            Nenhum tópico ainda nessa categoria.
          </p>
          <Link
            href="/dashboard/forum/novo"
            className="inline-block mt-4 text-sm text-primary-destaque hover:underline"
          >
            Crie o primeiro →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col">
          {result.threads.map((t) => (
            <Link
              key={t.id}
              href={`/dashboard/forum/${t.id}`}
              className="group flex items-center gap-4 py-4 border-b border-subtle hover:bg-card/40 transition-colors -mx-2 px-2 rounded"
            >
              <UserAvatar
                src={t.author.avatarUrl}
                name={t.author.displayName}
                seed={t.author.githubUsername}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {t.isPinned ? (
                    <Pin size={12} className="text-amber-400 shrink-0" />
                  ) : null}
                  {t.isLocked ? (
                    <Lock size={12} className="text-muted-foreground shrink-0" />
                  ) : null}
                  <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary-destaque transition-colors">
                    {t.title}
                  </h3>
                  <span
                    className={cn(
                      'text-[10px] uppercase tracking-wider border px-1.5 py-0.5 rounded shrink-0',
                      CATEGORY_TONE[t.category],
                    )}
                  >
                    {FORUM_CATEGORY_LABELS[t.category]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  por <span className="text-zinc-300">{t.author.displayName}</span>{' '}
                  · {formatRelative(t.lastReplyAt ?? t.createdAt)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageSquare size={14} />
                  <span>{t.repliesCount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {result.totalPages > 1 ? (
        <nav
          aria-label="Paginação"
          className="mt-8 flex items-center justify-between"
        >
          <PageLink
            href={query.page > 1 ? buildHref({ page: String(query.page - 1) }) : null}
            label="Anterior"
            icon={<ChevronLeft size={16} />}
          />
          <span className="text-xs text-muted-foreground">
            Página {result.page} de {result.totalPages}
          </span>
          <PageLink
            href={
              query.page < result.totalPages
                ? buildHref({ page: String(query.page + 1) })
                : null
            }
            label="Próxima"
            icon={<ChevronRight size={16} />}
            iconRight
          />
        </nav>
      ) : null}
    </section>
  )
}

function PageLink({
  href,
  label,
  icon,
  iconRight,
}: {
  href: string | null
  label: string
  icon: React.ReactNode
  iconRight?: boolean
}) {
  const cls =
    'inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border transition-colors'
  if (!href) {
    return (
      <span className={cn(cls, 'border-subtle text-muted-foreground/40 cursor-not-allowed')}>
        {!iconRight && icon}
        {label}
        {iconRight && icon}
      </span>
    )
  }
  return (
    <Link
      href={href}
      className={cn(cls, 'border-subtle text-muted-foreground hover:text-foreground hover:border-primary/40')}
    >
      {!iconRight && icon}
      {label}
      {iconRight && icon}
    </Link>
  )
}

// schema enum reference (evitar tree-shaking)
void forumCategorySchema
