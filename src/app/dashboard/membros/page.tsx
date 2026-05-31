import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '@/components/icons/brand'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { requireDashboardSession } from '@/server/lib/dashboard-session'
import { membersService } from '@/server/services/members.service'
import { tagsService } from '@/server/services/tags.service'
import { memberQuerySchema } from '@/server/schemas/member.schema'
import { MembersFilters } from './MembersFilters'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Mural de membros',
}

export const dynamic = 'force-dynamic'

const PROFILE_TYPE_LABEL: Record<string, string> = {
  MEMBER: 'Membro',
  COMPANY: 'Empresa',
  LEADER: 'Liderança',
  FOUNDER: 'Fundador',
}

const PROFILE_TYPE_TONE: Record<string, string> = {
  MEMBER: 'bg-primary/10 text-primary-destaque border-primary/30',
  COMPANY: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  LEADER: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  FOUNDER: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  await requireDashboardSession('/dashboard/membros')

  const params = await searchParams
  const query = memberQuerySchema.parse(params)
  const [result, allTags] = await Promise.all([
    membersService.list(query),
    tagsService.list({}),
  ])

  const activeTagSlugs = query.tags ?? []
  const activeTags = allTags.filter((t) => activeTagSlugs.includes(t.slug))

  const baseParams = new URLSearchParams()
  if (query.type) baseParams.set('type', query.type)
  if (query.q) baseParams.set('q', query.q)
  if (activeTagSlugs.length > 0) baseParams.set('tags', activeTagSlugs.join(','))

  function buildHref(overrides: Record<string, string | null>) {
    const next = new URLSearchParams(baseParams.toString())
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null) next.delete(key)
      else next.set(key, value)
    }
    const qs = next.toString()
    return qs ? `/dashboard/membros?${qs}` : '/dashboard/membros'
  }

  function tagHref(slug: string) {
    if (activeTagSlugs.includes(slug)) return buildHref({})
    const next = [...activeTagSlugs, slug].join(',')
    return buildHref({ tags: next })
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Voltar para o painel
      </Link>

      <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
        Mural de membros
      </h1>
      <p className="mt-2 text-muted-foreground">
        Descubra desenvolvedores, empresas e lideranças da comunidade.
      </p>

      <div className="mt-8">
        <MembersFilters total={result.total} activeTags={activeTags} />
      </div>

      {result.members.length === 0 ? (
        <div className="mt-10 text-center py-20 bg-card rounded-xl border border-border border-dashed">
          <p className="text-muted-foreground">
            Nenhum membro encontrado com esses filtros.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.members.map((member) => (
            <article
              key={member.id}
              className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:border-muted transition-colors"
            >
              <div className="flex items-start gap-4">
                <UserAvatar
                  size="lg"
                  src={member.avatarUrl}
                  name={member.displayName}
                  seed={member.githubUsername}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-foreground truncate">
                      {member.displayName}
                    </h3>
                    <span
                      className={cn(
                        'text-[10px] uppercase tracking-wider border px-1.5 py-0.5 rounded',
                        PROFILE_TYPE_TONE[member.type],
                      )}
                    >
                      {PROFILE_TYPE_LABEL[member.type]}
                    </span>
                  </div>
                  {member.location ? (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {member.location}
                    </p>
                  ) : null}
                </div>
              </div>

              {member.bio ? (
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {member.bio}
                </p>
              ) : null}

              {member.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {member.tags.slice(0, 6).map((tag) => {
                    const isActive = activeTagSlugs.includes(tag.slug)
                    return (
                      <Link
                        key={tag.id}
                        href={tagHref(tag.slug)}
                        className={cn(
                          'text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border transition-colors',
                          isActive
                            ? 'bg-primary text-foreground border-primary'
                            : 'bg-background-secondary text-muted-foreground border-zinc-700/50 hover:text-foreground hover:border-primary/40',
                        )}
                      >
                        {tag.label}
                      </Link>
                    )
                  })}
                  {member.tags.length > 6 ? (
                    <span className="text-[10px] text-muted-foreground self-center">
                      +{member.tags.length - 6}
                    </span>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-auto pt-2 flex gap-2 border-t border-subtle">
                {member.linkedinUrl ? (
                  <Link
                    target="_blank"
                    href={member.linkedinUrl}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-background-secondary text-zinc-300 text-xs font-medium hover:bg-primary hover:text-foreground transition-colors"
                  >
                    <LinkedinIcon size={14} /> LinkedIn
                  </Link>
                ) : null}
                <Link
                  target="_blank"
                  href={`https://github.com/${member.githubUsername}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-background-secondary text-zinc-300 text-xs font-medium hover:bg-zinc-700 hover:text-foreground transition-colors"
                >
                  <GithubIcon size={14} /> GitHub
                </Link>
              </div>
            </article>
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
      <span
        className={cn(
          cls,
          'border-subtle text-muted-foreground/40 cursor-not-allowed',
        )}
      >
        {!iconRight && icon}
        {label}
        {iconRight && icon}
      </span>
    )
  }
  return (
    <Link
      href={href}
      className={cn(
        cls,
        'border-subtle text-muted-foreground hover:text-foreground hover:border-primary/40',
      )}
    >
      {!iconRight && icon}
      {label}
      {iconRight && icon}
    </Link>
  )
}
