import Link from 'next/link'
import { ArrowLeft, Award, Clock, Send, Target } from 'lucide-react'
import { requireAdminSession } from '@/server/lib/admin-session'
import { adminChallengesService } from '@/server/services/admin-challenges.service'
import { adminProgressService } from '@/server/services/admin-progress.service'
import { ParticipationsList } from './ParticipationsList'

export const metadata = {
  title: 'Participações · Admin',
}

export const dynamic = 'force-dynamic'

const ALLOWED_STATUSES = ['IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED'] as const
type Status = (typeof ALLOWED_STATUSES)[number]

export default async function AdminChallengeParticipationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string }>
}) {
  await requireAdminSession()
  const { id } = await params
  const { status: rawStatus } = await searchParams
  const activeStatus = ALLOWED_STATUSES.find((s) => s === rawStatus)

  const challenge = await adminChallengesService.getById(id)
  const all = await adminProgressService.listChallengeParticipations(
    challenge.number,
  )

  const counts: Record<Status, number> = {
    IN_PROGRESS: 0,
    SUBMITTED: 0,
    APPROVED: 0,
    REJECTED: 0,
  }
  for (const p of all) counts[p.status] += 1

  const items = activeStatus
    ? all.filter((p) => p.status === activeStatus)
    : all

  function filterHref(s?: string) {
    return s
      ? `/admin/desafios/${id}/participacoes?status=${s}`
      : `/admin/desafios/${id}/participacoes`
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/desafios"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} /> Voltar para desafios
        </Link>
      </div>

      <header className="flex items-start gap-3 flex-wrap">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
          <Target size={20} />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            {challenge.number} · {challenge.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {challenge.points} pts por aprovação · {all.length}{' '}
            {all.length === 1 ? 'participação' : 'participações'}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          label="Em andamento"
          value={counts.IN_PROGRESS}
          icon={<Send size={16} />}
        />
        <Stat
          label="Em análise"
          value={counts.SUBMITTED}
          icon={<Clock size={16} />}
          tone="warn"
        />
        <Stat
          label="Aprovadas"
          value={counts.APPROVED}
          icon={<Award size={16} />}
          tone="success"
        />
        <Stat
          label="Devolvidas"
          value={counts.REJECTED}
          icon={<Send size={16} />}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-subtle pb-3">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-12">
          Status
        </span>
        <FilterChip href={filterHref()} active={!activeStatus} label="Todas" />
        <FilterChip
          href={filterHref('IN_PROGRESS')}
          active={activeStatus === 'IN_PROGRESS'}
          label="Em andamento"
        />
        <FilterChip
          href={filterHref('SUBMITTED')}
          active={activeStatus === 'SUBMITTED'}
          label="Em análise"
        />
        <FilterChip
          href={filterHref('APPROVED')}
          active={activeStatus === 'APPROVED'}
          label="Aprovadas"
        />
        <FilterChip
          href={filterHref('REJECTED')}
          active={activeStatus === 'REJECTED'}
          label="Devolvidas"
        />
      </div>

      <ParticipationsList
        points={challenge.points}
        items={items.map((p) => ({
          id: p.id,
          status: p.status,
          submissionUrl: p.submissionUrl,
          submissionNote: p.submissionNote,
          reviewerNote: p.reviewerNote,
          startedAt: p.startedAt.toISOString(),
          submittedAt: p.submittedAt ? p.submittedAt.toISOString() : null,
          reviewedAt: p.reviewedAt ? p.reviewedAt.toISOString() : null,
          user: p.user,
        }))}
      />
    </div>
  )
}

function Stat({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: number
  icon: React.ReactNode
  tone?: 'warn' | 'success'
}) {
  const klass =
    tone === 'success'
      ? 'border-emerald-500/40 bg-emerald-500/10'
      : tone === 'warn'
        ? 'border-amber-500/40 bg-amber-500/10'
        : 'border-subtle bg-card'
  return (
    <div className={'rounded-xl border p-4 ' + klass}>
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
    </div>
  )
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string
  active: boolean
  label: string
}) {
  return (
    <Link
      href={href}
      className={
        'px-3 py-1 rounded-full text-xs font-medium border transition-colors ' +
        (active
          ? 'bg-primary/10 text-primary-destaque border-primary/30'
          : 'bg-background-secondary text-muted-foreground border-subtle hover:text-foreground')
      }
    >
      {label}
    </Link>
  )
}
