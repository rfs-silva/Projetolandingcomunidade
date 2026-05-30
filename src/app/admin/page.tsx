import Link from 'next/link'
import {
  Calendar,
  FolderGit2,
  Handshake,
  Send,
  ShieldCheck,
  Tag,
  Target,
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

export default async function AdminHomePage() {
  await requireAdminSession()
  const [stats, pendingSubmissions] = await Promise.all([
    adminStatsService.load(),
    adminProgressService.countPendingSubmissions(),
  ])

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
          Visão geral
        </h1>
        <p className="mt-1 text-muted-foreground">
          Resumo da comunidade e atalhos para gestão.
        </p>
      </header>

      <section>
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Membros
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard
            icon={<Users size={18} />}
            label="Total"
            value={stats.members}
            href="/admin/usuarios"
          />
          {Object.entries(stats.membersByType).map(([type, count]) => (
            <StatCard
              key={type}
              icon={<Users size={18} />}
              label={TYPE_LABEL[type] ?? type}
              value={count}
              href={`/admin/usuarios?type=${type}`}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Pendências de revisão
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<Send size={18} />}
            label="Submissões aguardando"
            value={pendingSubmissions}
            href="/admin/submissoes"
            tone={pendingSubmissions > 0 ? 'attention' : 'default'}
          />
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Candidaturas de mentoria
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard
            icon={<Handshake size={18} />}
            label="Total"
            value={stats.mentorship.total}
            href="/admin/mentoria"
          />
          <StatCard
            icon={<Handshake size={18} />}
            label="Pendentes"
            value={stats.mentorship.pending}
            href="/admin/mentoria?status=SUBMITTED"
            tone={stats.mentorship.pending > 0 ? 'attention' : 'default'}
          />
          <StatCard
            icon={<Handshake size={18} />}
            label="Em análise"
            value={stats.mentorship.inReview}
            href="/admin/mentoria?status=IN_REVIEW"
          />
          <StatCard
            icon={<Handshake size={18} />}
            label="Aceitas"
            value={stats.mentorship.accepted}
            href="/admin/mentoria?status=ACCEPTED"
          />
          <StatCard
            icon={<Handshake size={18} />}
            label="Recusadas"
            value={stats.mentorship.rejected}
            href="/admin/mentoria?status=REJECTED"
          />
        </div>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Conteúdo
        </h2>
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

      <section>
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Plataforma
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<Tag size={18} />}
            label="Tags"
            value={stats.tags}
          />
          <StatCard
            icon={<ShieldCheck size={18} />}
            label="Status"
            value="OK"
          />
        </div>
      </section>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  href,
  tone = 'default',
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  href?: string
  tone?: 'default' | 'attention'
}) {
  const inner = (
    <div
      className={
        tone === 'attention'
          ? 'rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 hover:border-amber-500/60 transition-colors'
          : 'rounded-xl border border-subtle bg-card p-4 hover:border-muted transition-colors'
      }
    >
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-foreground">
        {value}
      </div>
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
  const inner = (
    <div className="rounded-xl border border-subtle bg-card p-5 hover:border-muted transition-colors">
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="text-3xl font-semibold text-foreground">{total}</span>
        <span className="text-xs text-muted-foreground">total</span>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        <span className="text-primary-destaque font-medium">{members}</span>{' '}
        exclusivos · {total - members} públicos
      </div>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}
