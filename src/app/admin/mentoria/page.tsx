import Link from 'next/link'
import { Handshake, Sparkles } from 'lucide-react'
import { requireAdminSession } from '@/server/lib/admin-session'
import { mentorshipService } from '@/server/services/mentorship.service'
import {
  applicationStatusSchema,
  mentorshipKindSchema,
  type ApplicationStatus,
  type MentorshipKind,
} from '@/server/schemas/mentorship.schema'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { cn } from '@/lib/utils'
import { StatusActions } from './StatusActions'

export const metadata = {
  title: 'Admin · Mentoria',
}

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  SUBMITTED: 'Pendente',
  IN_REVIEW: 'Em análise',
  ACCEPTED: 'Aceita',
  REJECTED: 'Recusada',
}

const STATUS_TONE: Record<ApplicationStatus, string> = {
  SUBMITTED: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  IN_REVIEW: 'bg-primary/10 text-primary-destaque border-primary/30',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  REJECTED: 'bg-destructive/10 text-destructive border-destructive/30',
}

const KIND_LABEL: Record<MentorshipKind, string> = {
  MENTOR: 'Mentor',
  MENTEE: 'Mentorado',
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'SUBMITTED', label: 'Pendente' },
  { value: 'IN_REVIEW', label: 'Em análise' },
  { value: 'ACCEPTED', label: 'Aceitas' },
  { value: 'REJECTED', label: 'Recusadas' },
]

const KIND_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'MENTEE', label: 'Mentorado' },
  { value: 'MENTOR', label: 'Mentor' },
]

export default async function AdminMentorshipPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; kind?: string }>
}) {
  await requireAdminSession()
  const params = await searchParams

  const statusParsed = applicationStatusSchema.safeParse(params.status)
  const kindParsed = mentorshipKindSchema.safeParse(params.kind)
  const activeStatus = statusParsed.success ? statusParsed.data : undefined
  const activeKind = kindParsed.success ? kindParsed.data : undefined

  const applications = await mentorshipService.listAdmin({
    status: activeStatus,
    kind: activeKind,
  })

  function filterHref(key: 'status' | 'kind', value: string) {
    const next = new URLSearchParams()
    if (key === 'status') {
      if (value) next.set('status', value)
      if (activeKind) next.set('kind', activeKind)
    } else {
      if (activeStatus) next.set('status', activeStatus)
      if (value) next.set('kind', value)
    }
    const qs = next.toString()
    return qs ? `/admin/mentoria?${qs}` : '/admin/mentoria'
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
            <Handshake size={20} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
              Candidaturas de mentoria
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie o ciclo: enviada → em análise → aceita/recusada.
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-3 border-b border-subtle pb-4">
        <FilterRow
          label="Status"
          options={STATUS_FILTERS}
          activeValue={activeStatus ?? ''}
          buildHref={(v) => filterHref('status', v)}
        />
        <FilterRow
          label="Tipo"
          options={KIND_FILTERS}
          activeValue={activeKind ?? ''}
          buildHref={(v) => filterHref('kind', v)}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {applications.length}{' '}
        {applications.length === 1 ? 'candidatura' : 'candidaturas'}
      </p>

      {applications.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border border-dashed">
          <p className="text-sm text-muted-foreground">
            Nenhuma candidatura nos filtros atuais.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <article
              key={app.id}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                  <UserAvatar
                    src={app.user.avatarUrl}
                    name={app.user.displayName}
                    seed={app.user.githubUsername}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-foreground truncate">
                        {app.user.displayName}
                      </h3>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-[10px] uppercase tracking-wider border px-1.5 py-0.5 rounded',
                          STATUS_TONE[app.status],
                        )}
                      >
                        {STATUS_LABEL[app.status]}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary-destaque bg-primary/5 border border-primary/20 px-1.5 py-0.5 rounded">
                        <Sparkles size={10} /> {KIND_LABEL[app.kind]}
                      </span>
                    </div>
                    <Link
                      target="_blank"
                      href={`https://github.com/${app.user.githubUsername}`}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      @{app.user.githubUsername}
                    </Link>
                  </div>
                </div>
                <StatusActions
                  applicationId={app.id}
                  current={app.status}
                />
              </div>

              <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <Detail
                  label={app.kind === 'MENTOR' ? 'Stack que ensina' : 'Stack desejada'}
                  value={app.stack}
                />
                <Detail label="Disponibilidade" value={app.availability} />
                <Detail
                  label={app.kind === 'MENTOR' ? 'O que oferece' : 'Objetivo'}
                  value={app.goal}
                  multiline
                />
                <Detail
                  label="Enviada em"
                  value={new Date(app.createdAt).toLocaleString('pt-BR')}
                />
              </dl>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterRow({
  label,
  options,
  activeValue,
  buildHref,
}: {
  label: string
  options: { value: string; label: string }[]
  activeValue: string
  buildHref: (value: string) => string
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-12">
        {label}
      </span>
      {options.map((opt) => {
        const isActive = activeValue === opt.value
        return (
          <Link
            key={opt.value || 'all'}
            href={buildHref(opt.value)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
              isActive
                ? 'bg-primary/10 text-primary-destaque border-primary/30'
                : 'bg-background-secondary text-muted-foreground border-subtle hover:text-foreground',
            )}
          >
            {opt.label}
          </Link>
        )
      })}
    </div>
  )
}

function Detail({
  label,
  value,
  multiline,
}: {
  label: string
  value: string
  multiline?: boolean
}) {
  return (
    <div className={multiline ? 'col-span-full' : ''}>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          'mt-0.5 text-foreground',
          multiline ? 'whitespace-pre-wrap text-sm' : 'text-sm',
        )}
      >
        {value}
      </dd>
    </div>
  )
}
