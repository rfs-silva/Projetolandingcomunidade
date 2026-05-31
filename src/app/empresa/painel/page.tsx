import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Target,
  XCircle,
} from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { requireDashboardSession } from '@/server/lib/dashboard-session'
import { companyDashboardService } from '@/server/services/company-dashboard.service'

export const metadata = {
  title: 'Painel da empresa',
}

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: 'Publicado',
  PENDING_APPROVAL: 'Em revisão',
  REJECTED: 'Devolvido',
}

const STATUS_CLASS: Record<string, string> = {
  PUBLISHED: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  PENDING_APPROVAL: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  REJECTED: 'bg-red-500/10 text-red-300 border-red-500/30',
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  PUBLISHED: <CheckCircle2 size={10} />,
  PENDING_APPROVAL: <Clock size={10} />,
  REJECTED: <XCircle size={10} />,
}

type RecentItem = {
  kind: 'event' | 'challenge'
  id: string
  number: string
  title: string
  status: 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED'
  metric: string
  reviewerNote: string | null
  updatedAt: Date
}

export default async function CompanyDashboardPage() {
  const session = await requireDashboardSession('/empresa/painel')
  const stats = await companyDashboardService.load(session.userId)

  const pendingTotal =
    stats.events.pendingApproval + stats.challenges.pendingApproval
  const publishedTotal = stats.events.published + stats.challenges.published
  const participationsTotal =
    stats.events.totalRegistrations + stats.challenges.totalParticipations

  // Mescla eventos e desafios recentes em uma única lista ordenada.
  const recent: RecentItem[] = [
    ...stats.recent.events.map((e) => ({
      kind: 'event' as const,
      id: e.id,
      number: e.number,
      title: e.title,
      status: e.status,
      metric: `${e.registrations} inscritos · ${e.attended} presentes`,
      reviewerNote: e.reviewerNote,
      updatedAt: e.updatedAt,
    })),
    ...stats.recent.challenges.map((c) => ({
      kind: 'challenge' as const,
      id: c.id,
      number: c.number,
      title: c.title,
      status: c.status,
      metric: `${c.participations} participações · ${c.approved} aprovadas`,
      reviewerNote: c.reviewerNote,
      updatedAt: c.updatedAt,
    })),
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 8)

  return (
    <main>
      <section className="mx-auto max-w-5xl px-6 py-10">
        {/* Hero compacto */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-7">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <UserAvatar
                size="lg"
                src={session.image}
                name={session.profile.displayName}
                seed={session.githubUsername}
              />
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary-destaque bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-full">
                  <Building2 size={11} /> Empresa parceira
                </div>
                <h1 className="mt-1 text-xl md:text-2xl font-semibold text-foreground truncate">
                  {session.profile.displayName}
                </h1>
              </div>
            </div>

            <div className="flex items-end gap-6 md:gap-8 flex-wrap">
              <Metric
                label="Em revisão"
                value={pendingTotal}
                tone={pendingTotal > 0 ? 'warn' : 'default'}
              />
              <Metric label="Publicados" value={publishedTotal} />
              <Metric label="Participações" value={participationsTotal} />
            </div>
          </div>
        </div>

        {/* Acoes principais */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ActionLink
            href="/admin/eventos/novo"
            icon={<Calendar size={18} />}
            label="Propor evento"
          />
          <ActionLink
            href="/admin/desafios/novo"
            icon={<Target size={18} />}
            label="Propor desafio"
          />
        </div>

        {/* Lista de propostas recentes (unica) */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
            Suas propostas recentes
          </h2>
          {recent.length > 0 ? (
            <Link
              href="/admin/eventos"
              className="text-xs text-primary-destaque hover:underline inline-flex items-center gap-1"
            >
              Ver tudo <ArrowRight size={11} />
            </Link>
          ) : null}
        </div>

        {recent.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Você ainda não propôs nada para a comunidade. Use os botões acima
            para começar.
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-border bg-card overflow-hidden">
            {recent.map((item) => (
              <RecentRow key={`${item.kind}-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function Metric({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: number
  tone?: 'default' | 'warn'
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={
          'mt-1 text-3xl md:text-4xl font-bold leading-none ' +
          (tone === 'warn' ? 'text-amber-300' : 'text-foreground')
        }
      >
        {value}
      </span>
    </div>
  )
}

function ActionLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-subtle bg-card px-5 py-4 flex items-center justify-between gap-3 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 text-primary-destaque flex items-center justify-center">
          {icon}
        </span>
        <span className="text-sm font-medium text-foreground group-hover:text-primary-destaque transition-colors">
          {label}
        </span>
      </div>
      <Plus size={16} className="text-muted-foreground shrink-0" />
    </Link>
  )
}

function RecentRow({ item }: { item: RecentItem }) {
  const href =
    item.kind === 'event'
      ? `/admin/eventos/${item.id}/editar`
      : `/admin/desafios/${item.id}/editar`
  const kindLabel = item.kind === 'event' ? 'Evento' : 'Desafio'
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 px-5 py-4 border-b border-border/60 last:border-b-0 hover:bg-background-secondary/40 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {kindLabel}
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            {item.number}
          </span>
          <span className="text-sm font-medium text-foreground truncate">
            {item.title}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{item.metric}</p>
        {item.reviewerNote ? (
          <p className="mt-1 text-[11px] text-red-400">
            Revisor: {item.reviewerNote}
          </p>
        ) : null}
      </div>
      <span
        className={
          'inline-flex items-center gap-1 text-[10px] uppercase tracking-wider border px-1.5 py-0.5 rounded shrink-0 ' +
          STATUS_CLASS[item.status]
        }
      >
        {STATUS_ICON[item.status]}
        {STATUS_LABEL[item.status]}
      </span>
    </Link>
  )
}
