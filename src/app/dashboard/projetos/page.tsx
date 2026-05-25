import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, ExternalLink, Github, LogOut, Pencil, Plus, Lock, Globe2 } from 'lucide-react'
import { auth, signOut } from '@/auth'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { profileService } from '@/server/services/profile.service'
import { projectsService } from '@/server/services/projects.service'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Meus projetos · Comunidade Roraima',
}

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/dashboard/projetos')
  const onboarded = await profileService.hasCompletedOnboarding(session.user.id)
  if (!onboarded) redirect('/onboarding')

  const [me, projects] = await Promise.all([
    profileService.getDtoByUserId(session.user.id),
    projectsService.listOwn(session.user.id),
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

      <section className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Voltar para o painel
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
              Meus projetos
            </h1>
            <p className="mt-1 text-muted-foreground">
              Publique no mural da comunidade. Marque como público para aparecer
              na landing.
            </p>
          </div>
          <Link href="/dashboard/projetos/novo">
            <Button
              type="button"
              variant="default"
              icon={<Plus size={16} />}
              iconPosition="left"
              className="h-11 px-5"
            >
              Novo projeto
            </Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
            <p className="text-muted-foreground">
              Você ainda não publicou nenhum projeto. Comece criando o primeiro!
            </p>
            <Link
              href="/dashboard/projetos/novo"
              className="inline-block mt-4 text-sm text-primary-destaque hover:underline"
            >
              Criar primeiro projeto →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <article
                key={project.id}
                className="bg-card border border-border rounded-xl overflow-hidden flex flex-col hover:border-muted transition-colors"
              >
                {project.image ? (
                  <div className="relative h-40 bg-background-secondary">
                    <Image
                      src={project.image}
                      alt={project.title}
                      width={400}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border backdrop-blur-md',
                          project.visibility === 'PUBLIC'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-primary/20 text-primary-destaque border-primary/40',
                        )}
                      >
                        {project.visibility === 'PUBLIC' ? (
                          <>
                            <Globe2 size={10} /> Público
                          </>
                        ) : (
                          <>
                            <Lock size={10} /> Membros
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="px-5 pt-5 flex justify-end">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border',
                        project.visibility === 'PUBLIC'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-primary/10 text-primary-destaque border-primary/30',
                      )}
                    >
                      {project.visibility === 'PUBLIC' ? 'Público' : 'Membros'}
                    </span>
                  </div>
                )}

                <div className="p-5 flex flex-col gap-3 grow">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                      {project.title}
                    </h3>
                    <span className="text-[10px] uppercase text-muted-foreground tracking-wider shrink-0">
                      {project.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 grow">
                    {project.description}
                  </p>
                  {project.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded bg-background-secondary text-muted-foreground border border-zinc-700/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2 mt-auto pt-3 border-t border-subtle">
                    <Link
                      href={`/dashboard/projetos/${project.id}/editar`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-background-secondary text-zinc-300 text-xs font-medium hover:bg-primary hover:text-foreground transition-colors"
                    >
                      <Pencil size={14} /> Editar
                    </Link>
                    {project.demoUrl && project.demoUrl !== '#' ? (
                      <Link
                        target="_blank"
                        href={project.demoUrl}
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-background-secondary text-zinc-300 text-xs font-medium hover:bg-zinc-700 hover:text-foreground transition-colors"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    ) : null}
                    {project.repoUrl && project.repoUrl !== '#' ? (
                      <Link
                        target="_blank"
                        href={project.repoUrl}
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-background-secondary text-zinc-300 text-xs font-medium hover:bg-zinc-700 hover:text-foreground transition-colors"
                      >
                        <Github size={14} />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
