import { projectsService } from '@/server/services/projects.service'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export async function GET() {
  try {
    const categories = projectsService.listCategories()
    return ok(categories, { total: categories.length })
  } catch (error) {
    return handleError(error)
  }
}
