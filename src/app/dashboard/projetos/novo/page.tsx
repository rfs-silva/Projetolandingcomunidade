import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, LogOut, Plus } from 'lucide-react'
import { auth, signOut } from '@/auth'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { profileService } from '@/server/services/profile.service'
import { tagsService } from '@/server/services/tags.service'
import { ProjectForm } from '../ProjectForm'

export const metadata = {
  title: 'Novo projeto · Comunidade Roraima',
}

export const dynamic = 'force-dynamic'

export default async function NewProjectPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/dashboard/projetos/novo')
  const onboarded = await profileService.hasCompletedOnboarding(session.user.id)
  if (!onboarded) redirect('/onboarding')

  const [me, allTags] = await Promise.all([
    profileService.getDtoByUserId(session.user.id),
    tagsService.list({ category: 'STACK' }),
  ])

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

      <section className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/dashboard/projetos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Voltar para meus projetos
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
            <Plus size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              Novo projeto
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Compartilhe o que você está construindo com a comunidade.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <ProjectForm allTags={allTags} />
        </div>
      </section>
    </main>
  )
}
