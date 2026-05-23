import { NextRequest } from 'next/server'
import { projectsService } from '@/server/services/projects.service'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const project = await projectsService.getById(id)
    return ok(project)
  } catch (error) {
    return handleError(error)
  }
}
