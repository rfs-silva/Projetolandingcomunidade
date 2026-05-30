import { Award, Medal, Trophy } from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'

type RankingItem = {
  rank: number
  userId: string
  displayName: string
  githubUsername: string
  avatarUrl: string | null
  points: number
  challengesApproved: number
  eventsAttended: number
}

const PODIUM_ORDER = [2, 1, 3] as const

const PODIUM_ICON: Record<number, React.ReactNode> = {
  1: <Trophy size={20} className="text-amber-300" />,
  2: <Medal size={18} className="text-zinc-300" />,
  3: <Medal size={18} className="text-amber-700" />,
}

const PODIUM_HEIGHT: Record<number, string> = {
  1: 'h-52 md:h-60',
  2: 'h-44 md:h-52',
  3: 'h-40 md:h-48',
}

const PODIUM_BORDER: Record<number, string> = {
  1: 'border-amber-400/40 bg-amber-400/5',
  2: 'border-zinc-400/30 bg-zinc-400/5',
  3: 'border-amber-700/30 bg-amber-700/5',
}

type Props = {
  ranking: RankingItem[]
}

export default function Ranking({ ranking }: Props) {
  const top3 = ranking.slice(0, 3)

  return (
    <section id="ranking" className="py-20 bg-background-secondary">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-left">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-primary-destaque bg-primary/10 border border-primary/30 px-3 py-1 rounded-full mb-4">
            <Award size={12} /> Comunidade ativa
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ranking de pontos
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            Ganhe pontos completando desafios e participando de eventos.
            Quem mais contribui ganha visibilidade na comunidade.
          </p>
        </div>

        {top3.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border border-dashed">
            <p className="text-muted-foreground">
              O ranking começa quando o primeiro desafio for aprovado.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 md:gap-6 items-end">
            {PODIUM_ORDER.map((position) => {
              const item = top3.find((t) => t.rank === position)
              if (!item) {
                return (
                  <div
                    key={position}
                    className={
                      'rounded-xl border border-dashed border-border bg-card/50 flex flex-col items-center justify-end p-4 ' +
                      PODIUM_HEIGHT[position]
                    }
                  >
                    <span className="text-xs text-muted-foreground">
                      #{position}
                    </span>
                  </div>
                )
              }
              return (
                <article
                  key={item.userId}
                  className={
                    'rounded-xl border p-4 md:p-5 flex flex-col items-center justify-end gap-3 ' +
                    PODIUM_HEIGHT[position] +
                    ' ' +
                    PODIUM_BORDER[position]
                  }
                >
                  <div className="flex items-center gap-2">
                    {PODIUM_ICON[position]}
                    <span className="text-sm font-bold text-foreground">
                      #{position}
                    </span>
                  </div>
                  <UserAvatar
                    size="lg"
                    src={item.avatarUrl}
                    name={item.displayName}
                    seed={item.githubUsername}
                  />
                  <div className="text-center min-w-0 w-full">
                    <div className="font-semibold text-foreground text-sm md:text-base line-clamp-1">
                      {item.displayName}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      @{item.githubUsername}
                    </div>
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-primary-destaque">
                    {item.points} pts
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
