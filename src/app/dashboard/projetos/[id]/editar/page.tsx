import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { requireDashboardSession } from '@/server/lib/dashboard-session'
import { projectsService } from '@/server/services/projects.service'
import { tagsService } from '@/server/services/tags.service'
import type {
  EditableCategoryDto,
  ProjectVisibilityDto,
} from '@/server/schemas/project.schema'
import { ProjectForm } from '../../ProjectForm'

export const metadata = {
  title: 'Editar projeto · Comunidade Roraima',
}

export const dynamic = 'force-dynamic'

const VALID_CATEGORIES: EditableCategoryDto[] = [
  'Front-end',
  'Back-end',
  'Mobile',
  'Fullstack',
]

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await requireDashboardSession('/dashboard/projetos')
  const { id } = await params
  const [project, allTags] = await Promise.all([
    projectsService.getOwnById(userId, id),
    tagsService.list({ category: 'STACK' }),
  ])

  async function deleteAction() {
    'use server'
    const { userId } = await requireDashboardSession('/dashboard/projetos')
    await projectsService.remove(userId, id)
    revalidatePath('/dashboard/projetos')
    redirect('/dashboard/projetos')
  }

  const category: EditableCategoryDto =
    VALID_CATEGORIES.includes(project.category as EditableCategoryDto)
      ? (project.category as EditableCategoryDto)
      : 'Fullstack'

  const initial = {
    id: project.id,
    title: project.title,
    description: project.description,
    category,
    visibility: project.visibility as ProjectVisibilityDto,
    image: project.image && project.image !== '#' ? project.image : undefined,
    demoUrl:
      project.demoUrl && project.demoUrl !== '#' ? project.demoUrl : undefined,
    repoUrl:
      project.repoUrl && project.repoUrl !== '#' ? project.repoUrl : undefined,
    tagIds: project.tagIds,
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/dashboard/projetos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Voltar para meus projetos
      </Link>

      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
            <Pencil size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              Editar projeto
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {project.title}
            </p>
          </div>
        </div>

        <form action={deleteAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            icon={<Trash2 size={16} />}
            iconPosition="left"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Excluir
          </Button>
        </form>
      </div>

      <div className="mt-10">
        <ProjectForm initial={initial} allTags={allTags} />
      </div>
    </section>
  )
}
