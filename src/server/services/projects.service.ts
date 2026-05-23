import 'server-only'
import { projectsRepository } from '@/server/repositories/projects.repository'
import {
  projectSchema,
  projectCategorySchema,
  type ProjectCategoryDto,
  type ProjectDto,
  type ProjectQuery,
} from '@/server/schemas/project.schema'
import { NotFoundError, ValidationError } from '@/server/http/errors'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
}
