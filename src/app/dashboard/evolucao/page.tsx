import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Send,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from 'lucide-react'
import { requireDashboardSession } from '@/server/lib/dashboard-session'
import { progressService } from '@/server/services/progress.service'
import { UserAvatar } from '@/components/ui/UserAvatar'

type Level = {
  name: string
  min: number
  max: number | null
}

const LEVELS: Level[] = [
  { name: 'Iniciante', min: 0, max: 50 },
  { name: 'Praticante', min: 50, max: 200 },
  { name: 'Contribuidor', min: 200, max: 500 },
  { name: 'Veterano', min: 500, max: 1000 },
  { name: 'Lenda', min: 1000, max: null },
]

function getLevel(points: number) {
  const idx = LEVELS.findIndex(
    (l) => points >= l.min && (l.max === null || points < l.max),
  )
  const safeIdx = idx === -1 ? LEVELS.length - 1 : idx
  const current = LEVELS[safeIdx]
  const next = LEVELS[safeIdx + 1] ?? null
  const toNext = next ? Math.max(next.min - points, 0) : 0
  const progress = next
    ? Math.min(
        100,
        Math.round(((points - current.min) / (next.min - current.min)) * 100),
      )
    : 100
  return { current, next, toNext, progress }
}

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
  const level = getLevel(stats.points)
  const challengePoints = challenges
    .filter((c) => c.status === 'APPROVED')
    .reduce((sum, c) => sum + c.points, 0)
  const eventPoints = events
    .filter((e) => e.status === 'ATTENDED')
    .reduce((sum, e) => sum + e.points, 0)

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Voltar para o painel
      </Link>

      {/* Hero: identidade + pontos + nivel + progresso */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-8">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 bottom-0 w-40 h-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <UserAvatar
              size="lg"
              src={image}
              name={profile.displayName}
              seed={githubUsername}
            />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Minha evolução
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground truncate">
                {profile.displayName}
              </h1>
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-primary-destaque bg-primary/10 border border-primary/30 px-2 py-1 rounded-full">
                <Sparkles size={12} /> {level.current.name}
              </div>
            </div>
          </div>

          <div className="flex items-end gap-6 md:gap-8 flex-wrap">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Pontos
              </span>
              <span className="text-4xl md:text-5xl font-bold text-foreground leading-none">
                {stats.points}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Ranking
              </span>
              <span className="text-4xl md:text-5xl font-bold text-primary-destaque leading-none">
                {myRank ? `#${myRank}` : '—'}
              </span>
            </div>
          </div>
        </div>

        {level.next ? (
          <div className="relative mt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>
                Nível {level.current.name} ·{' '}
                <span className="text-foreground font-medium">
                  {level.progress}%
                </span>
              </span>
              <span>
                Faltam{' '}
                <span className="text-foreground font-medium">
                  {level.toNext} pts
                </span>{' '}
                para {level.next.name}
              </span>
            </div>
            <div className="h-2 rounded-full bg-background-secondary border border-border overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-destaque transition-all"
                style={{ width: `${level.progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="relative mt-6 inline-flex items-center gap-2 text-sm text-primary-destaque">
            <Flame size={14} /> Nível máximo atingido — você é{' '}
            <strong>{level.current.name}</strong> 🎉
          </div>
        )}
      </div>

      {/* Cards de atividade: desafios, eventos, pendencias */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActivityCard
          icon={<Target size={18} />}
          title="Desafios"
          big={stats.challengesApproved}
          bigLabel="aprovados"
          points={challengePoints}
          rows={[
            { label: 'Em análise', value: stats.challengesSubmitted },
            { label: 'Em andamento', value: stats.challengesInProgress },
          ]}
        />
        <ActivityCard
          icon={<Calendar size={18} />}
          title="Eventos"
          big={stats.eventsAttended}
          bigLabel="com presença"
          points={eventPoints}
          rows={[
            { label: 'Inscrito', value: stats.eventsRegistered },
            { label: 'Total inscrições', value: events.length },
          ]}
        />
        <ActivityCard
          icon={<Trophy size={18} />}
          title="Resumo"
          big={
            stats.challengesApproved +
            stats.challengesInProgress +
            stats.challengesSubmitted +
            stats.eventsAttended +
            stats.eventsRegistered
          }
          bigLabel="participações"
          rows={[
            { label: 'Pontos por desafios', value: challengePoints },
            { label: 'Pontos por eventos', value: eventPoints },
          ]}
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

function ActivityCard({
  icon,
  title,
  big,
  bigLabel,
  points,
  rows,
}: {
  icon: React.ReactNode
  title: string
  big: number
  bigLabel: string
  points?: number
  rows: { label: string; value: number }[]
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground">
          <span className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 text-primary-destaque flex items-center justify-center">
            {icon}
          </span>
          <span className="text-sm font-medium">{title}</span>
        </div>
        {typeof points === 'number' ? (
          <span className="text-[10px] uppercase tracking-wider text-primary-destaque bg-primary/5 border border-primary/20 px-2 py-0.5 rounded">
            +{points} pts
          </span>
        ) : null}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-foreground leading-none">
          {big}
        </span>
        <span className="text-xs text-muted-foreground">{bigLabel}</span>
      </div>

      <div className="border-t border-border/60 pt-3 flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{row.label}</span>
            <span className="text-sm font-medium text-foreground">
              {row.value}
            </span>
          </div>
        ))}
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
