import Link from 'next/link'
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Target,
  Trophy,
  XCircle,
} from 'lucide-react'
import { requireDashboardSession } from '@/server/lib/dashboard-session'
import { progressService } from '@/server/services/progress.service'
import { UserAvatar } from '@/components/ui/UserAvatar'

export const metadata = {
  title: 'Minha evolução · Comunidade Roraima',
}

export const dynamic = 'force-dynamic'

const CHALLENGE_STATUS_LABEL: Record<string, string> = {
  IN_PROGRESS: 'Em andamento',
  SUBMITTED: 'Em análise',
  APPROVED: 'Aprovado',
  REJECTED: 'Devolvido',
}

const EVENT_STATUS_LABEL: Record<string, string> = {
  REGISTERED: 'Inscrito',
  ATTENDED: 'Presença confirmada',
  CANCELLED: 'Cancelado',
}

function formatDate(value: string | Date | null): string {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  return d.toLocaleDateString('pt-BR')
}

export default async function EvolucaoPage() {
  const { userId, image, githubUsername, profile } =
    await requireDashboardSession('/dashboard/evolucao')

  const [stats, challenges, events, ranking] = await Promise.all([
    progressService.myStats(userId),
    progressService.listMyChallenges(userId),
    progressService.listMyEvents(userId),
    progressService.ranking(10),
  ])

  const myRank = ranking.find((r) => r.userId === userId)?.rank ?? null

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Voltar para o painel
      </Link>

      <div className="flex items-center gap-4">
        <UserAvatar
          size="lg"
          src={image}
          name={profile.displayName}
          seed={githubUsername}
        />
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Minha evolução
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Acompanhe seus desafios, eventos e pontos na comunidade.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Award size={18} />}
          label="Pontos"
          value={stats.points}
          accent
        />
        <StatCard
          icon={<Trophy size={18} />}
          label="Ranking"
          value={myRank ? `#${myRank}` : '—'}
        />
        <StatCard
          icon={<Target size={18} />}
          label="Desafios aprovados"
          value={stats.challengesApproved}
        />
        <StatCard
          icon={<Calendar size={18} />}
          label="Eventos com presença"
          value={stats.eventsAttended}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat
          icon={<Clock size={14} />}
          label="Desafios em andamento"
          value={stats.challengesInProgress}
        />
        <MiniStat
          icon={<Send size={14} />}
          label="Submissões em análise"
          value={stats.challengesSubmitted}
        />
        <MiniStat
          icon={<Calendar size={14} />}
          label="Eventos inscritos"
          value={stats.eventsRegistered}
        />
        <MiniStat
          icon={<CheckCircle2 size={14} />}
          label="Total participações"
          value={
            stats.challengesApproved +
            stats.challengesInProgress +
            stats.challengesSubmitted +
            stats.eventsAttended +
            stats.eventsRegistered
          }
        />
      </div>

      <h2 className="mt-12 mb-4 text-sm uppercase tracking-wider text-muted-foreground">
        Meus desafios
      </h2>
      {challenges.length === 0 ? (
        <EmptyBox text="Nenhum desafio iniciado ainda." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="min-w-full text-sm">
            <thead className="bg-background-secondary text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nº</th>
                <th className="px-4 py-3 text-left font-medium">Desafio</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Pontos</th>
                <th className="px-4 py-3 text-left font-medium">Início</th>
                <th className="px-4 py-3 text-left font-medium">Submissão</th>
              </tr>
            </thead>
            <tbody>
              {challenges.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-border/60 hover:bg-background-secondary/40"
                >
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.challengeNumber}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {c.challengeTitle}
                  </td>
                  <td className="px-4 py-3">
                    <ChallengeStatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {c.status === 'APPROVED' ? `+${c.points}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(c.startedAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(c.submittedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-12 mb-4 text-sm uppercase tracking-wider text-muted-foreground">
        Meus eventos
      </h2>
      {events.length === 0 ? (
        <EmptyBox text="Você ainda não se inscreveu em eventos." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="min-w-full text-sm">
            <thead className="bg-background-secondary text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nº</th>
                <th className="px-4 py-3 text-left font-medium">Evento</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Pontos</th>
                <th className="px-4 py-3 text-left font-medium">Inscrição</th>
                <th className="px-4 py-3 text-left font-medium">Presença</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr
                  key={e.id}
                  className="border-t border-border/60 hover:bg-background-secondary/40"
                >
                  <td className="px-4 py-3 text-muted-foreground">
                    {e.eventNumber}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {e.eventTitle}
                  </td>
                  <td className="px-4 py-3">
                    <EventStatusBadge status={e.status} />
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {e.status === 'ATTENDED' ? `+${e.points}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(e.registeredAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(e.attendedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-12 mb-4 text-sm uppercase tracking-wider text-muted-foreground">
        Top 10 da comunidade
      </h2>
      {ranking.length === 0 ? (
        <EmptyBox text="Ainda não há ninguém pontuado." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="min-w-full text-sm">
            <thead className="bg-background-secondary text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left font-medium">#</th>
                <th className="px-4 py-3 text-left font-medium">Membro</th>
                <th className="px-4 py-3 text-left font-medium">Pontos</th>
                <th className="px-4 py-3 text-left font-medium">Desafios</th>
                <th className="px-4 py-3 text-left font-medium">Eventos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((r) => {
                const isMe = r.userId === userId
                return (
                  <tr
                    key={r.userId}
                    className={
                      'border-t border-border/60 ' +
                      (isMe
                        ? 'bg-primary/10'
                        : 'hover:bg-background-secondary/40')
                    }
                  >
                    <td className="px-4 py-3 text-foreground font-semibold">
                      #{r.rank}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          size="sm"
                          src={r.avatarUrl}
                          name={r.displayName}
                          seed={r.githubUsername}
                        />
                        <span className="font-medium text-foreground">
                          {r.displayName}
                          {isMe ? (
                            <span className="ml-2 text-[10px] uppercase tracking-wider text-primary-destaque">
                              você
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground font-semibold">
                      {r.points}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.challengesApproved}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.eventsAttended}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div
      className={
        'rounded-xl border p-4 flex items-center gap-4 ' +
        (accent
          ? 'border-primary/30 bg-primary/5'
          : 'border-border bg-card')
      }
    >
      <div
        className={
          'w-10 h-10 rounded-lg flex items-center justify-center ' +
          (accent
            ? 'bg-primary/10 border border-primary/30 text-primary-destaque'
            : 'bg-background-secondary text-muted-foreground border border-zinc-700/50')
        }
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-semibold text-foreground leading-none">
          {value}
        </div>
        <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground truncate">
          {label}
        </div>
      </div>
    </div>
  )
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
      <span className="text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <div className="text-base font-semibold text-foreground leading-none">
          {value}
        </div>
        <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground truncate">
          {label}
        </div>
      </div>
    </div>
  )
}

function ChallengeStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    IN_PROGRESS:
      'bg-background-secondary text-muted-foreground border border-zinc-700/50',
    SUBMITTED:
      'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    APPROVED:
      'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
    REJECTED: 'bg-red-500/10 text-red-300 border border-red-500/30',
  }
  const icon =
    status === 'APPROVED' ? (
      <CheckCircle2 size={12} />
    ) : status === 'REJECTED' ? (
      <XCircle size={12} />
    ) : status === 'SUBMITTED' ? (
      <Clock size={12} />
    ) : (
      <Send size={12} />
    )
  return (
    <span
      className={
        'inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ' +
        (styles[status] ?? styles.IN_PROGRESS)
      }
    >
      {icon}
      {CHALLENGE_STATUS_LABEL[status] ?? status}
    </span>
  )
}

function EventStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    REGISTERED:
      'bg-background-secondary text-muted-foreground border border-zinc-700/50',
    ATTENDED:
      'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
    CANCELLED: 'bg-red-500/10 text-red-300 border border-red-500/30',
  }
  return (
    <span
      className={
        'inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ' +
        (styles[status] ?? styles.REGISTERED)
      }
    >
      {EVENT_STATUS_LABEL[status] ?? status}
    </span>
  )
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card py-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  )
}
