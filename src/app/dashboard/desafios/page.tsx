import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, ArrowRight, Layers, Lock, LogOut, Monitor } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { auth, signOut } from '@/auth'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { profileService } from '@/server/services/profile.service'
import { challengesService } from '@/server/services/challenges.service'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Desafios · Comunidade Roraima',
}

export const dynamic = 'force-dynamic'

const ICONS: Record<string, LucideIcon> = { Monitor, Layers }

export default async function ChallengesDashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/dashboard/desafios')
  const onboarded = await profileService.hasCompletedOnboarding(session.user.id)
  if (!onboarded) redirect('/onboarding')

  const [me, all] = await Promise.all([
    profileService.getDtoByUserId(session.user.id),
    challengesService.list({ includeMembers: true }),
  ])

  const sorted = [...all].sort((a, b) => {
    const av = a.visibility === 'MEMBERS' ? 0 : 1
    const bv = b.visibility === 'MEMBERS' ? 0 : 1
    if (av !== bv) return av - bv
    return a.number.localeCompare(b.number)
  })

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-subtle">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Comunidade" width={32} height={32} />
            <span className="text-sm font-medium text-foreground">
              Comunidade Roraima
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <UserAvatar
              src={session.user.image}
              name={me.displayName}
              seed={session.user.githubUsername ?? session.user.id}
            />
            <span className="hidden sm:inline text-sm text-muted-foreground">
              {me.displayName}
            </span>
            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/' })
              }}
            >
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                icon={<LogOut size={16} />}
                iconPosition="left"
              >
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

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

                  <Button
                    type="button"
                    variant="outline-primary"
                    size="sm"
                    icon={<ArrowRight size={14} />}
                    iconPosition="right"
                    className="mt-auto w-full"
                  >
                    Ver desafio
                  </Button>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
