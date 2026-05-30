import Link from 'next/link'
import {
  ArrowRight,
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
import { adminStatsService } from '@/server/services/admin-stats.service'
import { adminProgressService } from '@/server/services/admin-progress.service'
import { requireAdminSession } from '@/server/lib/admin-session'

export const metadata = {
  title: 'Admin · Comunidade Roraima',
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
  const session = await requireAdminSession()
  const [stats, pendingSubmissions] = await Promise.all([
    adminStatsService.load(),
    adminProgressService.countPendingSubmissions(),
  ])

  const pendingTotal = pendingSubmissions + stats.mentorship.pending
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

      {/* Mentoria detalhada */}
      <section>
        <SectionTitle title="Funil de mentoria" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <FunnelCard
            icon={<Send size={16} />}
            label="Pendentes"
            value={stats.mentorship.pending}
            tone={stats.mentorship.pending > 0 ? 'warn' : 'default'}
            href="/admin/mentoria?status=SUBMITTED"
          />
          <FunnelCard
            icon={<Clock size={16} />}
            label="Em análise"
            value={stats.mentorship.inReview}
            href="/admin/mentoria?status=IN_REVIEW"
          />
          <FunnelCard
            icon={<CheckCircle2 size={16} />}
            label="Aceitas"
            value={stats.mentorship.accepted}
            tone="success"
            href="/admin/mentoria?status=ACCEPTED"
          />
          <FunnelCard
            icon={<Handshake size={16} />}
            label="Recusadas"
            value={stats.mentorship.rejected}
            href="/admin/mentoria?status=REJECTED"
          />
        </div>
      </section>

      {/* Conteudo da comunidade */}
      <section>
        <SectionTitle title="Conteúdo da comunidade" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ContentCard
            icon={<Calendar size={18} />}
            label="Eventos"
            total={stats.events.total}
            members={stats.events.members}
            href="/admin/eventos"
          />
          <ContentCard
            icon={<Target size={18} />}
            label="Desafios"
            total={stats.challenges.total}
            members={stats.challenges.members}
            href="/admin/desafios"
          />
          <ContentCard
            icon={<FolderGit2 size={18} />}
            label="Projetos"
            total={stats.projects.total}
            members={stats.projects.members}
          />
        </div>
      </section>

      {/* Plataforma */}
      <section>
        <SectionTitle title="Plataforma" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetaCard icon={<Tag size={16} />} label="Tags" value={stats.tags} />
          <MetaCard
            icon={<ShieldCheck size={16} />}
            label="Status"
            value="OK"
            tone="success"
          />
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

function FunnelCard({
  icon,
  label,
  value,
  tone = 'default',
  href,
}: {
  icon: React.ReactNode
  label: string
  value: number
  tone?: 'default' | 'warn' | 'success'
  href?: string
}) {
  const klass =
    tone === 'success'
      ? 'border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-500/60'
      : tone === 'warn'
        ? 'border-amber-500/40 bg-amber-500/10 hover:border-amber-500/60'
        : 'border-subtle bg-card hover:border-muted'
  const inner = (
    <div
      className={
        'rounded-xl border p-4 transition-colors ' + klass + ' h-full'
      }
    >
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

function ContentCard({
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
    <div className="rounded-xl border border-subtle bg-card p-5 hover:border-muted transition-colors h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-primary-destaque bg-primary/5 border border-primary/20 px-2 py-0.5 rounded">
          {pct}% exclusivos
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="text-3xl font-semibold text-foreground">{total}</span>
        <span className="text-xs text-muted-foreground">total</span>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-background-secondary border border-border overflow-hidden">
        <div
          className="h-full bg-primary/60"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        <span className="text-primary-destaque font-medium">{members}</span>{' '}
        exclusivos · {total - members} públicos
      </div>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

function MetaCard({
  icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  tone?: 'default' | 'success'
}) {
  const klass =
    tone === 'success'
      ? 'border-emerald-500/40 bg-emerald-500/10'
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
