import 'server-only'
import { ProjectCategoryDb } from '@prisma/client'
import { prisma } from '@/server/lib/prisma'
import type {
  ProjectCategoryDto,
  ProjectDto,
} from '@/server/schemas/project.schema'

const ALL_CATEGORIES: ProjectCategoryDto[] = [
  'Todos',
  'Front-end',
  'Back-end',
  'Mobile',
  'Fullstack',
]

const DTO_TO_DB: Record<Exclude<ProjectCategoryDto, 'Todos'>, ProjectCategoryDb> = {
  'Front-end': ProjectCategoryDb.FRONTEND,
  'Back-end': ProjectCategoryDb.BACKEND,
  Mobile: ProjectCategoryDb.MOBILE,
  Fullstack: ProjectCategoryDb.FULLSTACK,
}

const DB_TO_DTO: Record<ProjectCategoryDb, Exclude<ProjectCategoryDto, 'Todos'>> = {
  [ProjectCategoryDb.FRONTEND]: 'Front-end',
  [ProjectCategoryDb.BACKEND]: 'Back-end',
  [ProjectCategoryDb.MOBILE]: 'Mobile',
  [ProjectCategoryDb.FULLSTACK]: 'Fullstack',
}

type ProjectRow = {
  id: string
  title: string
  description: string
  authorAvatar: string | null
  image: string | null
  category: ProjectCategoryDb
  demoUrl: string | null
  repoUrl: string | null
  user: { profile: { displayName: string } | null } | null
  tags: { tag: { label: string } }[]
}

function toDto(row: ProjectRow): ProjectDto {
  return {
    id: row.id,
    title: row.title,
    author: row.user?.profile?.displayName ?? 'Anônimo',
    authorAvatar: row.authorAvatar ?? '',
    image: row.image ?? '',
    description: row.description,
    tags: row.tags.map((t) => t.tag.label),
    category: DB_TO_DTO[row.category],
    demoUrl: row.demoUrl ?? '#',
    repoUrl: row.repoUrl ?? '#',
  }
}

export const projectsRepository = {
  async list({ category }: { category?: ProjectCategoryDto } = {}): Promise<ProjectDto[]> {
    const where =
      category && category !== 'Todos' ? { category: DTO_TO_DB[category] } : {}

    const rows = await prisma.userProject.findMany({
      where: { ...where, visibility: 'PUBLIC' },
      include: {
        user: { include: { profile: true } },
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map(toDto)
  },

  async findById(id: string): Promise<ProjectDto | null> {
    const row = await prisma.userProject.findUnique({
      where: { id },
      include: {
        user: { include: { profile: true } },
        tags: { include: { tag: true } },
      },
    })
    return row ? toDto(row) : null
  },

  listCategories(): ProjectCategoryDto[] {
    return ALL_CATEGORIES
  },
}
