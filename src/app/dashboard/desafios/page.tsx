import Link from 'next/link'
import { ArrowLeft, Layers, Lock, Monitor } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { requireDashboardSession } from '@/server/lib/dashboard-session'
import { challengesService } from '@/server/services/challenges.service'
import { progressService } from '@/server/services/progress.service'
import { cn } from '@/lib/utils'
import { ChallengeActionButton } from '@/components/dashboard/ChallengeActionButton'

export const metadata = {
  title: 'Desafios',
}

export const dynamic = 'force-dynamic'

const ICONS: Record<string, LucideIcon> = { Monitor, Layers }

export default async function ChallengesDashboardPage() {
  const { userId } = await requireDashboardSession('/dashboard/desafios')

  const [all, myParts] = await Promise.all([
    challengesService.list({ includeMembers: true }),
    progressService.listMyChallenges(userId),
  ])

  const partByNumber = new Map(
    myParts.map((p) => [
      p.challengeNumber,
      { status: p.status, reviewerNote: p.reviewerNote },
    ]),
  )

  const sorted = [...all].sort((a, b) => {
    const av = a.visibility === 'MEMBERS' ? 0 : 1
    const bv = b.visibility === 'MEMBERS' ? 0 : 1
    if (av !== bv) return av - bv
    return a.number.localeCompare(b.number)
  })

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Voltar para o painel
      </Link>

      <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
        Desafios
      </h1>
      <p className="mt-2 text-muted-foreground">
        Pratique e aprenda com desafios criados pela comunidade — incluindo os
        exclusivos para membros.
      </p>

      {sorted.length === 0 ? (
        <div className="mt-10 text-center py-20 bg-card rounded-xl border border-border border-dashed">
          <p className="text-muted-foreground">Nenhum desafio por enquanto.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sorted.map((c) => {
            const isMembers = c.visibility === 'MEMBERS'
            return (
              <article
                key={c.number}
                className={cn(
                  'bg-card border rounded-xl p-5 flex flex-col gap-3 transition-colors',
                  isMembers
                    ? 'border-primary/30 bg-primary/5 hover:border-primary/60'
                    : 'border-border hover:border-muted',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">
                    {c.number}
                  </span>
                  {isMembers ? (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary-destaque bg-primary/10 border border-primary/30 px-2 py-0.5 rounded">
                      <Lock size={10} /> Exclusivo
                    </span>
                  ) : null}
                </div>

                <h3 className="text-base font-semibold text-foreground line-clamp-2">
                  {c.title}
                </h3>

                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map((tag, i) => {
                    const Icon = ICONS[tag.iconName]
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-background-secondary text-muted-foreground border border-zinc-700/50"
                      >
                        {Icon ? <Icon size={10} /> : null}
                        {tag.label}
                      </span>
                    )
                  })}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {c.description}
                </p>

                <div className="mt-auto">
                  <ChallengeActionButton
                    challengeNumber={c.number}
                    initialStatus={partByNumber.get(c.number)?.status ?? 'NONE'}
                    initialReviewerNote={
                      partByNumber.get(c.number)?.reviewerNote ?? null
                    }
                  />
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
