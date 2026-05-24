import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Calendar, LogOut, Lock, Monitor, Users } from 'lucide-react'
import { auth, signOut } from '@/auth'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { profileService } from '@/server/services/profile.service'
import { eventsService } from '@/server/services/events.service'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Eventos · Comunidade Roraima',
}

export const dynamic = 'force-dynamic'

export default async function EventsDashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/dashboard/eventos')
  const onboarded = await profileService.hasCompletedOnboarding(session.user.id)
  if (!onboarded) redirect('/onboarding')

  const [me, eventsAll] = await Promise.all([
    profileService.getDtoByUserId(session.user.id),
    eventsService.list({}, { includeMembers: true }),
  ])

  // MEMBERS primeiro (são as novidades do logado)
  const sorted = [...eventsAll].sort((a, b) => {
    const av = a.visibility === 'MEMBERS' ? 0 : 1
    const bv = b.visibility === 'MEMBERS' ? 0 : 1
    if (av !== bv) return av - bv
    return a.number.localeCompare(b.number)
  })

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader
        user={session.user}
        displayName={me.displayName}
        githubUsername={session.user.githubUsername ?? session.user.id}
      />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Voltar para o painel
        </Link>

        <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
          Eventos
        </h1>
        <p className="mt-2 text-muted-foreground">
          Todos os eventos da comunidade — incluindo os exclusivos para membros.
        </p>

        {sorted.length === 0 ? (
          <div className="mt-10 text-center py-20 bg-card rounded-xl border border-border border-dashed">
            <p className="text-muted-foreground">
              Nenhum evento por enquanto.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((event) => {
              const isMembers = event.visibility === 'MEMBERS'
              return (
                <article
                  key={event.number}
                  className={cn(
                    'bg-card border rounded-xl p-5 flex flex-col gap-3 transition-colors',
                    isMembers
                      ? 'border-primary/30 bg-primary/5 hover:border-primary/60'
                      : 'border-border hover:border-muted',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground">
                      {event.number}
                    </span>
                    {isMembers ? (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary-destaque bg-primary/10 border border-primary/30 px-2 py-0.5 rounded">
                        <Lock size={10} /> Exclusivo
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {event.description}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-300 bg-background-secondary border border-zinc-700/50 px-2.5 py-1 rounded">
                      <Calendar size={12} /> {event.dateShort}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-300 bg-background-secondary border border-zinc-700/50 px-2.5 py-1 rounded">
                      {event.type === 'Remoto' ? (
                        <Monitor size={12} />
                      ) : (
                        <Users size={12} />
                      )}{' '}
                      {event.type}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline-primary"
                    size="sm"
                    className="mt-auto w-full"
                  >
                    Inscrever-se
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

function DashboardHeader({
  user,
  displayName,
  githubUsername,
}: {
  user: { image?: string | null }
  displayName: string
  githubUsername: string
}) {
  return (
    <header className="border-b border-subtle">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Comunidade" width={32} height={32} />
          <span className="text-sm font-medium text-foreground">
            Comunidade Roraima
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <UserAvatar src={user.image} name={displayName} seed={githubUsername} />
          <span className="hidden sm:inline text-sm text-muted-foreground">
            {displayName}
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
  )
}
