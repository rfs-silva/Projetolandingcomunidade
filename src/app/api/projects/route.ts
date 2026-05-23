import { NextRequest } from 'next/server'
import { projectsService } from '@/server/services/projects.service'
import { projectQuerySchema } from '@/server/schemas/project.schema'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams)
    const query = projectQuerySchema.parse(params)
    const projects = await projectsService.list(query)
    return ok(projects, { total: projects.length })
  } catch (error) {
    return handleError(error)
  }
}
