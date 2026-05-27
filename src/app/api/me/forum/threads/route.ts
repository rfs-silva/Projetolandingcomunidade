import { NextRequest } from 'next/server'
import { forumService } from '@/server/services/forum.service'
import { threadQuerySchema } from '@/server/schemas/forum.schema'
import { requireUserId } from '@/server/http/session'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'
import { checkRateLimit } from '@/server/http/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireUserId()
    const params = Object.fromEntries(request.nextUrl.searchParams)
    const query = threadQuerySchema.parse(params)
    const result = await forumService.list(query)
    return ok(result.threads, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    })
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
    const thread = await forumService.createThread(userId, body)
    return ok(thread, undefined, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
