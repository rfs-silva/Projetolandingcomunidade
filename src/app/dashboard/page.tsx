import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { auth, signOut } from '@/auth'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { profileService } from '@/server/services/profile.service'

export const metadata = {
  title: 'Dashboard · Comunidade Roraima',
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/dashboard')

  const onboarded = await profileService.hasCompletedOnboarding(session.user.id)
  if (!onboarded) redirect('/onboarding')

  const profile = await profileService.getByUserId(session.user.id)
  const user = session.user

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
              src={user?.image}
              name={profile?.displayName ?? user?.name ?? user?.githubUsername}
              seed={user?.githubUsername ?? user?.id ?? user?.name}
            />
            <span className="hidden sm:inline text-sm text-muted-foreground">
              {profile?.displayName ?? user?.name ?? user?.githubUsername}
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

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-semibold text-foreground">
          Olá, {profile?.displayName ?? user?.name ?? user?.githubUsername} 👋
        </h1>
        <p className="mt-2 text-muted-foreground">
          Bem-vindo à área exclusiva da comunidade. As próximas funcionalidades
          (perfil, mural, mentoria, projetos) chegam nos próximos sprints.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Mural de Membros',
              desc: 'Descubra outros devs da comunidade (Sprint 3).',
            },
            {
              title: 'Mentoria',
              desc: 'Candidate-se ao programa de mentoria (Sprint 3).',
            },
            {
              title: 'Mural de Projetos',
              desc: 'Publique e descubra projetos da comunidade (Sprint 3).',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-subtle bg-card p-6"
            >
              <h2 className="text-lg font-medium text-foreground">
                {card.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
