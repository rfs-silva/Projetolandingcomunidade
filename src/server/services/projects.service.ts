import 'server-only'
import { ProjectCategoryDb } from '@prisma/client'
import { prisma } from '@/server/lib/prisma'
import { projectsRepository } from '@/server/repositories/projects.repository'
import {
  projectSchema,
  projectCategorySchema,
  projectInputSchema,
  type ProjectCategoryDto,
  type ProjectDto,
  type ProjectQuery,
} from '@/server/schemas/project.schema'
import { AppError, NotFoundError, ValidationError } from '@/server/http/errors'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const DTO_TO_DB_EDITABLE: Record<
  'Front-end' | 'Back-end' | 'Mobile' | 'Fullstack',
  ProjectCategoryDb
> = {
  'Front-end': ProjectCategoryDb.FRONTEND,
  'Back-end': ProjectCategoryDb.BACKEND,
  Mobile: ProjectCategoryDb.MOBILE,
  Fullstack: ProjectCategoryDb.FULLSTACK,
}

export const projectsService = {
  async list(query: ProjectQuery): Promise<ProjectDto[]> {
    const rows = await projectsRepository.list({ category: query.category })
    return rows.map((p) => projectSchema.parse(p))
  },

  async getById(id: string): Promise<ProjectDto> {
    if (!UUID_RE.test(id)) {
      throw new ValidationError({ id: 'ID inválido (esperado UUID)' })
    }
    const project = await projectsRepository.findById(id)
    if (!project) throw new NotFoundError('Projeto')
    return projectSchema.parse(project)
  },

  listCategories(): ProjectCategoryDto[] {
    return projectsRepository
      .listCategories()
      .map((c) => projectCategorySchema.parse(c))
  },

  async listOwn(userId: string): Promise<ProjectDto[]> {
    const rows = await prisma.userProject.findMany({
      where: { userId },
      include: {
        user: { include: { profile: true } },
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) =>
      projectSchema.parse({
        id: row.id,
        title: row.title,
        author: row.user.profile?.displayName ?? 'Você',
        authorAvatar: row.authorAvatar ?? '',
        image: row.image ?? '',
        description: row.description,
        tags: row.tags.map((t) => t.tag.label),
        category: dbCategoryToDto(row.category),
        visibility: row.visibility,
        demoUrl: row.demoUrl ?? '#',
        repoUrl: row.repoUrl ?? '#',
      }),
    )
  },

  async create(userId: string, raw: unknown): Promise<ProjectDto> {
    const data = projectInputSchema.parse(raw)
    const profile = await prisma.profile.findUnique({ where: { userId } })
    if (!profile) throw new NotFoundError('Perfil')

    const created = await prisma.$transaction(async (tx) => {
      const project = await tx.userProject.create({
        data: {
          userId,
          title: data.title,
          description: data.description,
          category: DTO_TO_DB_EDITABLE[data.category],
          visibility: data.visibility,
          image: data.image,
          demoUrl: data.demoUrl,
          repoUrl: data.repoUrl,
          authorAvatar: null,
        },
      })
      if (data.tagIds.length > 0) {
        await tx.userProjectTag.createMany({
          data: data.tagIds.map((tagId) => ({ projectId: project.id, tagId })),
        })
      }
      return project
    })

    return this.getById(created.id)
  },

  async update(
    userId: string,
    projectId: string,
    raw: unknown,
  ): Promise<ProjectDto> {
    if (!UUID_RE.test(projectId)) {
      throw new ValidationError({ id: 'ID inválido (esperado UUID)' })
    }
    const data = projectInputSchema.parse(raw)

    const existing = await prisma.userProject.findUnique({
      where: { id: projectId },
    })
    if (!existing) throw new NotFoundError('Projeto')
    if (existing.userId !== userId) {
      throw new AppError('FORBIDDEN', 'Você não é dono deste projeto', 403)
    }

    await prisma.$transaction(async (tx) => {
      await tx.userProject.update({
        where: { id: projectId },
        data: {
          title: data.title,
          description: data.description,
          category: DTO_TO_DB_EDITABLE[data.category],
          visibility: data.visibility,
          image: data.image,
          demoUrl: data.demoUrl,
          repoUrl: data.repoUrl,
        },
      })
      await tx.userProjectTag.deleteMany({ where: { projectId } })
      if (data.tagIds.length > 0) {
        await tx.userProjectTag.createMany({
          data: data.tagIds.map((tagId) => ({ projectId, tagId })),
        })
      }
    })

    return this.getById(projectId)
  },

  async remove(userId: string, projectId: string): Promise<void> {
    if (!UUID_RE.test(projectId)) {
      throw new ValidationError({ id: 'ID inválido' })
    }
    const existing = await prisma.userProject.findUnique({
      where: { id: projectId },
    })
    if (!existing) throw new NotFoundError('Projeto')
    if (existing.userId !== userId) {
      throw new AppError('FORBIDDEN', 'Você não é dono deste projeto', 403)
    }
    await prisma.userProject.delete({ where: { id: projectId } })
  },

  async getOwnById(userId: string, projectId: string): Promise<ProjectDto & { tagIds: string[] }> {
    if (!UUID_RE.test(projectId)) {
      throw new ValidationError({ id: 'ID inválido' })
    }
    const row = await prisma.userProject.findUnique({
      where: { id: projectId },
      include: {
        user: { include: { profile: true } },
        tags: { include: { tag: true } },
      },
    })
    if (!row) throw new NotFoundError('Projeto')
    if (row.userId !== userId) {
      throw new AppError('FORBIDDEN', 'Você não é dono deste projeto', 403)
    }
    const dto = projectSchema.parse({
      id: row.id,
      title: row.title,
      author: row.user.profile?.displayName ?? 'Você',
      authorAvatar: row.authorAvatar ?? '',
      image: row.image ?? '',
      description: row.description,
      tags: row.tags.map((t) => t.tag.label),
      category: dbCategoryToDto(row.category),
      visibility: row.visibility,
      demoUrl: row.demoUrl ?? '#',
      repoUrl: row.repoUrl ?? '#',
    })
    return { ...dto, tagIds: row.tags.map((t) => t.tag.id) }
  },
}

function dbCategoryToDto(c: ProjectCategoryDb): ProjectCategoryDto {
  switch (c) {
    case ProjectCategoryDb.FRONTEND:
      return 'Front-end'
    case ProjectCategoryDb.BACKEND:
      return 'Back-end'
    case ProjectCategoryDb.MOBILE:
      return 'Mobile'
    case ProjectCategoryDb.FULLSTACK:
      return 'Fullstack'
  }
}
