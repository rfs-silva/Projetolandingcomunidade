import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Inbox,
  Plus,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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

export default async function CompanyDashboardPage() {
  // O layout pai (src/app/empresa/painel/layout.tsx) já garante que só
  // perfis COMPANY chegam aqui.
  const session = await requireDashboardSession('/empresa/painel')
  const stats = await companyDashboardService.load(session.userId)
  const firstName = session.profile.displayName.split(' ')[0]
  const pendingTotal =
    stats.events.pendingApproval + stats.challenges.pendingApproval

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-8">
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4 min-w-0">
              <UserAvatar
                size="lg"
                src={session.image}
                name={session.profile.displayName}
                seed={session.githubUsername}
              />
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary-destaque bg-primary/10 border border-primary/30 px-2 py-1 rounded-full">
                  <Building2 size={12} /> Empresa parceira
                </div>
                <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-foreground truncate">
                  {firstName}, bem-vinda 👋
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Crie eventos e desafios para a comunidade. A liderança revisa
                  antes de publicar.
                </p>
              </div>
            </div>
            <div className="flex items-end gap-6 md:gap-8 flex-wrap">
              <HeroNumber
                label="Pendências"
                value={pendingTotal}
                icon={<Clock size={14} />}
                tone={pendingTotal > 0 ? 'attention' : 'default'}
              />
              <HeroNumber
                label="Publicados"
                value={stats.events.published + stats.challenges.published}
                icon={<CheckCircle2 size={14} />}
              />
              <HeroNumber
                label="Participações"
                value={
                  stats.events.totalRegistrations + stats.challenges.totalParticipations
                }
                icon={<Users size={14} />}
              />
            </div>
          </div>
        </div>

        {/* Acoes rapidas */}
        <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href="/admin/eventos/novo"
            className="group rounded-2xl border border-subtle bg-card p-5 hover:border-primary/40 transition-colors flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 text-primary-destaque flex items-center justify-center">
                <Calendar size={20} />
              </span>
              <div>
                <div className="text-base font-medium text-foreground group-hover:text-primary-destaque transition-colors">
                  Propor novo evento
                </div>
                <p className="text-xs text-muted-foreground">
                  Entra como Em revisão até a liderança aprovar.
                </p>
              </div>
            </div>
            <Plus size={18} className="text-muted-foreground shrink-0" />
          </Link>

          <Link
            href="/admin/desafios/novo"
            className="group rounded-2xl border border-subtle bg-card p-5 hover:border-primary/40 transition-colors flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 text-primary-destaque flex items-center justify-center">
                <Target size={20} />
              </span>
              <div>
                <div className="text-base font-medium text-foreground group-hover:text-primary-destaque transition-colors">
                  Propor novo desafio
                </div>
                <p className="text-xs text-muted-foreground">
                  Defina pontos, tags e descrição. Liderança revisa.
                </p>
              </div>
            </div>
            <Plus size={18} className="text-muted-foreground shrink-0" />
          </Link>
        </section>

        {/* Eventos: stats compactas */}
        <h2 className="mt-12 mb-3 text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-2">
          <Calendar size={12} /> Eventos da sua empresa
        </h2>
        <ContentSummary
          published={stats.events.published}
          pending={stats.events.pendingApproval}
          rejected={stats.events.rejected}
          totalInteractions={stats.events.totalRegistrations}
          attended={stats.events.totalAttended}
          interactionLabel="inscritos"
          attendedLabel="presenças confirmadas"
          manageHref="/admin/eventos"
        />

        {/* Eventos recentes */}
        {stats.recent.events.length > 0 ? (
          <div className="mt-4 rounded-xl border border-border bg-card overflow-hidden">
            {stats.recent.events.map((e) => (
              <RecentRow
                key={e.id}
                href={`/admin/eventos/${e.id}/editar`}
                number={e.number}
                title={e.title}
                status={e.status}
                metric={`${e.registrations} inscritos · ${e.attended} presentes`}
                reviewerNote={e.reviewerNote}
              />
            ))}
          </div>
        ) : null}

        {/* Desafios: stats compactas */}
        <h2 className="mt-12 mb-3 text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-2">
          <Target size={12} /> Desafios da sua empresa
        </h2>
        <ContentSummary
          published={stats.challenges.published}
          pending={stats.challenges.pendingApproval}
          rejected={stats.challenges.rejected}
          totalInteractions={stats.challenges.totalParticipations}
          attended={stats.challenges.totalApproved}
          interactionLabel="participações"
          attendedLabel="submissões aprovadas"
          manageHref="/admin/desafios"
        />

        {stats.recent.challenges.length > 0 ? (
          <div className="mt-4 rounded-xl border border-border bg-card overflow-hidden">
            {stats.recent.challenges.map((c) => (
              <RecentRow
                key={c.id}
                href={`/admin/desafios/${c.id}/editar`}
                number={c.number}
                title={c.title}
                status={c.status}
                metric={`${c.participations} participações · ${c.approved} aprovadas`}
                reviewerNote={c.reviewerNote}
              />
            ))}
          </div>
        ) : null}

        {/* Empty state quando nao tem nada */}
        {stats.recent.events.length === 0 &&
        stats.recent.challenges.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <Inbox
              size={28}
              className="mx-auto text-muted-foreground mb-3"
            />
            <p className="text-sm text-muted-foreground">
              Você ainda não propôs nada para a comunidade. Comece pelo botão{' '}
              <strong>Propor novo evento</strong> ou{' '}
              <strong>Propor novo desafio</strong> acima.
            </p>
          </div>
        ) : null}

        {/* Rodape */}
        <div className="mt-12 rounded-2xl border border-primary/30 bg-primary/5 p-6 flex flex-col md:flex-row md:items-center gap-4">
          <TrendingUp size={20} className="text-primary-destaque shrink-0" />
          <p className="text-sm text-foreground flex-1">
            Eventos com mais inscrições e desafios com mais submissões aumentam
            sua visibilidade na comunidade.
          </p>
          <Link href="/admin/eventos" className="shrink-0">
            <Button
              type="button"
              variant="default"
              size="sm"
              icon={<ArrowRight size={14} />}
              iconPosition="right"
            >
              Gerenciar tudo
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}

function HeroNumber({
  label,
  value,
  icon,
  tone = 'default',
}: {
  label: string
  value: number
  icon: React.ReactNode
  tone?: 'default' | 'attention'
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
        {icon} {label}
      </span>
      <span
        className={
          'mt-1 text-3xl md:text-4xl font-bold leading-none ' +
          (tone === 'attention' ? 'text-amber-300' : 'text-foreground')
        }
      >
        {value}
      </span>
    </div>
  )
}

function ContentSummary({
  published,
  pending,
  rejected,
  totalInteractions,
  attended,
  interactionLabel,
  attendedLabel,
  manageHref,
}: {
  published: number
  pending: number
  rejected: number
  totalInteractions: number
  attended: number
  interactionLabel: string
  attendedLabel: string
  manageHref: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Stat label="Publicados" value={published} />
        <Stat label="Em revisão" value={pending} tone="warn" />
        <Stat label="Devolvidos" value={rejected} />
        <Stat label={interactionLabel} value={totalInteractions} />
        <Stat label={attendedLabel} value={attended} tone="success" />
      </div>
      <div className="mt-4 flex justify-end">
        <Link
          href={manageHref}
          className="inline-flex items-center gap-1 text-xs text-primary-destaque hover:underline"
        >
          Ver lista completa <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: number
  tone?: 'default' | 'warn' | 'success'
}) {
  const color =
    tone === 'warn'
      ? 'text-amber-300'
      : tone === 'success'
        ? 'text-emerald-300'
        : 'text-foreground'
  return (
    <div>
      <div className={'text-2xl font-bold leading-none ' + color}>{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  )
}

function RecentRow({
  href,
  number,
  title,
  status,
  metric,
  reviewerNote,
}: {
  href: string
  number: string
  title: string
  status: 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED'
  metric: string
  reviewerNote: string | null
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 px-5 py-4 border-b border-border/60 last:border-b-0 hover:bg-background-secondary/40 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground">
            {number}
          </span>
          <span className="text-sm font-medium text-foreground truncate">
            {title}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{metric}</p>
        {reviewerNote ? (
          <p className="mt-1 text-[11px] text-red-400">
            Revisor: {reviewerNote}
          </p>
        ) : null}
      </div>
      <span
        className={
          'inline-flex items-center gap-1 text-[10px] uppercase tracking-wider border px-1.5 py-0.5 rounded shrink-0 ' +
          STATUS_CLASS[status]
        }
      >
        {STATUS_ICON[status]}
        {STATUS_LABEL[status]}
      </span>
    </Link>
  )
}
