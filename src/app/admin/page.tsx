import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FolderGit2,
  Handshake,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
  Tag,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { adminStatsService } from '@/server/services/admin-stats.service'
import { adminProgressService } from '@/server/services/admin-progress.service'
import { companiesService } from '@/server/services/companies.service'
import {
  isAdminType,
  requireContentCreatorSession,
} from '@/server/lib/admin-session'

export const metadata = {
  title: 'Admin',
}

export const dynamic = 'force-dynamic'

const TYPE_LABEL: Record<string, string> = {
  MEMBER: 'Membros',
  COMPANY: 'Empresas',
  LEADER: 'Lideranças',
  FOUNDER: 'Fundadores',
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  MEMBER: <Users size={14} />,
  COMPANY: <FolderGit2 size={14} />,
  LEADER: <Sparkles size={14} />,
  FOUNDER: <ShieldCheck size={14} />,
}

export default async function AdminHomePage() {
  const session = await requireContentCreatorSession()
  if (!isAdminType(session.profile.type)) {
    redirect('/admin/eventos')
  }
  const [stats, pendingSubmissions, pendingCompanies] = await Promise.all([
    adminStatsService.load(),
    adminProgressService.countPendingSubmissions(),
    companiesService.countPending(),
  ])

  const pendingTotal =
    pendingSubmissions + stats.mentorship.pending + pendingCompanies
  const firstName = session.profile.displayName.split(' ')[0]

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-8">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Painel administrativo
            </p>
            <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-foreground">
              Olá, {firstName} 👋
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Resumo da comunidade, pendências aguardando ação e atalhos para
              cada área de gestão.
            </p>
          </div>
          <div className="flex items-end gap-6 md:gap-8 flex-wrap">
            <HeroNumber
              label="Membros"
              value={stats.members}
              icon={<Users size={14} />}
            />
            <HeroNumber
              label="Conteúdo"
              value={
                stats.events.total +
                stats.challenges.total +
                stats.projects.total
              }
              icon={<TrendingUp size={14} />}
            />
            <HeroNumber
              label="Pendências"
              value={pendingTotal}
              icon={<Clock size={14} />}
              tone={pendingTotal > 0 ? 'attention' : 'default'}
            />
          </div>
        </div>
      </section>

      {/* Pendencias de acao */}
      <section>
        <SectionTitle title="Aguardando ação" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ActionCard
            href="/admin/submissoes"
            icon={<Send size={20} />}
            title="Submissões de desafios"
            count={pendingSubmissions}
            description="Avaliar e aprovar trabalhos enviados pelos membros."
          />
          <ActionCard
            href="/admin/mentoria?status=SUBMITTED"
            icon={<Handshake size={20} />}
            title="Candidaturas de mentoria"
            count={stats.mentorship.pending}
            description="Triar mentores e mentorados aguardando análise."
          />
          <ActionCard
            href="/admin/empresas?status=PENDING"
            icon={<Building2 size={20} />}
            title="Candidaturas de empresa"
            count={pendingCompanies}
            description="Avaliar empresas que querem participar da comunidade."
          />
        </div>
      </section>

      {/* Atalhos de gestao */}
      <section>
        <SectionTitle title="Áreas de gestão" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <ShortcutCard
            href="/admin/usuarios"
            icon={<Users size={18} />}
            label="Usuários"
          />
          <ShortcutCard
            href="/admin/eventos"
            icon={<Calendar size={18} />}
            label="Eventos"
          />
          <ShortcutCard
            href="/admin/desafios"
            icon={<Target size={18} />}
            label="Desafios"
          />
          <ShortcutCard
            href="/admin/mentoria"
            icon={<Handshake size={18} />}
            label="Mentoria"
          />
          <ShortcutCard
            href="/admin/submissoes"
            icon={<Send size={18} />}
            label="Submissões"
          />
          <ShortcutCard
            href="/admin/empresas"
            icon={<Building2 size={18} />}
            label="Empresas"
          />
          <ShortcutCard
            href="/admin/forum"
            icon={<MessageSquare size={18} />}
            label="Fórum"
          />
        </div>
      </section>

      {/* Distribuicao de membros */}
      <section>
        <SectionTitle title="Distribuição de membros" />
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-semibold text-foreground">
              {stats.members}
            </span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              membros no total
            </span>
          </div>
          <TypeBar membersByType={stats.membersByType} total={stats.members} />
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            {['MEMBER', 'COMPANY', 'LEADER', 'FOUNDER'].map((type) => (
              <Link
                key={type}
                href={`/admin/usuarios?type=${type}`}
                className="group flex items-center justify-between rounded-lg border border-subtle bg-background-secondary/40 px-3 py-2 hover:border-primary/40 transition-colors"
              >
                <span className="inline-flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground">
                  {TYPE_ICON[type]} {TYPE_LABEL[type]}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {stats.membersByType[type] ?? 0}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Funil de mentoria - barra horizontal segmentada */}
      <section>
        <SectionTitle title="Funil de mentoria" />
        <MentorshipFunnel
          pending={stats.mentorship.pending}
          inReview={stats.mentorship.inReview}
          accepted={stats.mentorship.accepted}
          rejected={stats.mentorship.rejected}
        />
      </section>

      {/* Conteudo da comunidade - lista compacta */}
      <section>
        <SectionTitle title="Conteúdo da comunidade" />
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <ContentRow
            icon={<Calendar size={16} />}
            label="Eventos"
            total={stats.events.total}
            members={stats.events.members}
            href="/admin/eventos"
          />
          <ContentRow
            icon={<Target size={16} />}
            label="Desafios"
            total={stats.challenges.total}
            members={stats.challenges.members}
            href="/admin/desafios"
          />
          <ContentRow
            icon={<FolderGit2 size={16} />}
            label="Projetos"
            total={stats.projects.total}
            members={stats.projects.members}
          />
        </div>
      </section>

      {/* Plataforma - tira horizontal compacta */}
      <section className="border-t border-subtle pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <InlineMeta
              icon={<Tag size={14} />}
              label="Tags"
              value={stats.tags}
            />
            <InlineMeta
              icon={<ShieldCheck size={14} className="text-emerald-300" />}
              label="Status"
              value="OK"
              valueClassName="text-emerald-300"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            Comunidade Roraima Fullstack Developers
          </span>
        </div>
      </section>
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
      {title}
    </h2>
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

function ActionCard({
  href,
  icon,
  title,
  description,
  count,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  count: number
}) {
  const attention = count > 0
  return (
    <Link
      href={href}
      className={
        'group relative overflow-hidden rounded-xl border p-5 transition-colors ' +
        (attention
          ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60'
          : 'border-subtle bg-card hover:border-muted')
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={
            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ' +
            (attention
              ? 'bg-amber-500/10 border border-amber-500/40 text-amber-300'
              : 'bg-primary/10 border border-primary/30 text-primary-destaque')
          }
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <span
              className={
                'text-2xl font-bold leading-none ' +
                (attention ? 'text-amber-300' : 'text-foreground/40')
              }
            >
              {count}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs text-primary-destaque opacity-60 group-hover:opacity-100 transition-opacity">
            {attention ? 'Revisar agora' : 'Ver detalhes'}{' '}
            <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  )
}

function ShortcutCard({
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
      className="group rounded-xl border border-subtle bg-card p-4 flex flex-col items-center justify-center gap-2 hover:border-primary/40 transition-colors text-center"
    >
      <span className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 text-primary-destaque flex items-center justify-center">
        {icon}
      </span>
      <span className="text-xs font-medium text-foreground group-hover:text-primary-destaque transition-colors">
        {label}
      </span>
    </Link>
  )
}

function TypeBar({
  membersByType,
  total,
}: {
  membersByType: Record<string, number>
  total: number
}) {
  if (total === 0) {
    return (
      <div className="h-2 rounded-full bg-background-secondary border border-border" />
    )
  }
  const segments = [
    {
      type: 'MEMBER',
      color: 'bg-primary',
      pct: ((membersByType.MEMBER ?? 0) / total) * 100,
    },
    {
      type: 'COMPANY',
      color: 'bg-cyan-500',
      pct: ((membersByType.COMPANY ?? 0) / total) * 100,
    },
    {
      type: 'LEADER',
      color: 'bg-amber-400',
      pct: ((membersByType.LEADER ?? 0) / total) * 100,
    },
    {
      type: 'FOUNDER',
      color: 'bg-emerald-400',
      pct: ((membersByType.FOUNDER ?? 0) / total) * 100,
    },
  ]
  return (
    <div className="h-2 rounded-full bg-background-secondary border border-border overflow-hidden flex">
      {segments.map((s) =>
        s.pct > 0 ? (
          <div
            key={s.type}
            className={s.color}
            style={{ width: `${s.pct}%` }}
            title={`${TYPE_LABEL[s.type]}: ${Math.round(s.pct)}%`}
          />
        ) : null,
      )}
    </div>
  )
}

function MentorshipFunnel({
  pending,
  inReview,
  accepted,
  rejected,
}: {
  pending: number
  inReview: number
  accepted: number
  rejected: number
}) {
  const total = pending + inReview + accepted + rejected
  const segments = [
    {
      key: 'SUBMITTED',
      label: 'Pendentes',
      value: pending,
      color: 'bg-amber-400',
      text: 'text-amber-300',
      dot: 'bg-amber-400',
    },
    {
      key: 'IN_REVIEW',
      label: 'Em análise',
      value: inReview,
      color: 'bg-primary',
      text: 'text-primary-destaque',
      dot: 'bg-primary',
    },
    {
      key: 'ACCEPTED',
      label: 'Aceitas',
      value: accepted,
      color: 'bg-emerald-400',
      text: 'text-emerald-300',
      dot: 'bg-emerald-400',
    },
    {
      key: 'REJECTED',
      label: 'Recusadas',
      value: rejected,
      color: 'bg-zinc-500',
      text: 'text-muted-foreground',
      dot: 'bg-zinc-500',
    },
  ]

  if (total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card py-8 text-center text-sm text-muted-foreground">
        Nenhuma candidatura registrada ainda.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-foreground leading-none">
            {total}
          </span>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            candidaturas
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-emerald-300 inline-flex items-center gap-1">
          <CheckCircle2 size={10} /> {total === 0 ? 0 : Math.round((accepted / total) * 100)}% aceitas
        </span>
      </div>

      <div className="h-3 rounded-full bg-background-secondary border border-border overflow-hidden flex">
        {segments.map((s) =>
          s.value > 0 ? (
            <div
              key={s.key}
              className={s.color}
              style={{ width: `${(s.value / total) * 100}%` }}
              title={`${s.label}: ${s.value}`}
            />
          ) : null,
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        {segments.map((s) => {
          const href =
            s.key === 'SUBMITTED'
              ? '/admin/mentoria?status=SUBMITTED'
              : s.key === 'IN_REVIEW'
                ? '/admin/mentoria?status=IN_REVIEW'
                : s.key === 'ACCEPTED'
                  ? '/admin/mentoria?status=ACCEPTED'
                  : '/admin/mentoria?status=REJECTED'
          return (
            <Link
              key={s.key}
              href={href}
              className="group inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className={'w-2 h-2 rounded-full ' + s.dot} />
              <span className="uppercase tracking-wider">{s.label}</span>
              <span className={'font-semibold ' + s.text}>{s.value}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function ContentRow({
  icon,
  label,
  total,
  members,
  href,
}: {
  icon: React.ReactNode
  label: string
  total: number
  members: number
  href?: string
}) {
  const pct = total === 0 ? 0 : Math.round((members / total) * 100)
  const inner = (
    <div className="group flex items-center gap-4 px-5 py-4 border-b border-border/60 last:border-b-0 hover:bg-background-secondary/40 transition-colors">
      <span className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 text-primary-destaque flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">
            <span className="text-foreground font-semibold">{total}</span> total
            ·{' '}
            <span className="text-primary-destaque font-medium">{members}</span>{' '}
            exclusivos
          </span>
        </div>
        <div className="mt-2 h-1 rounded-full bg-background-secondary border border-border overflow-hidden">
          <div
            className="h-full bg-primary/60"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      {href ? (
        <ArrowRight
          size={14}
          className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        />
      ) : null}
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

function InlineMeta({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  valueClassName?: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      {icon}
      <span className="uppercase tracking-wider">{label}</span>
      <span
        className={
          'font-semibold ' + (valueClassName ?? 'text-foreground')
        }
      >
        {value}
      </span>
    </span>
  )
}
