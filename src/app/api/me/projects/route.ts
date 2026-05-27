import { NextRequest } from 'next/server'
import { projectsService } from '@/server/services/projects.service'
import { requireUserId } from '@/server/http/session'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'
import { checkRateLimit } from '@/server/http/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const userId = await requireUserId()
    const projects = await projectsService.listOwn(userId)
    return ok(projects, { total: projects.length })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, 'meSensitive')
    if (limited) return limited

    const userId = await requireUserId()
    const body = await request.json()
    const created = await projectsService.create(userId, body)
    return ok(created, undefined, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
