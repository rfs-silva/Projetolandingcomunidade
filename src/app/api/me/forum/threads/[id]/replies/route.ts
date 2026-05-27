import { NextRequest } from 'next/server'
import { forumService } from '@/server/services/forum.service'
import { requireUserId } from '@/server/http/session'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'
import { checkRateLimit } from '@/server/http/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = checkRateLimit(request, 'meWrite')
    if (limited) return limited

    const userId = await requireUserId()
    const { id } = await params
    const body = await request.json()
    const reply = await forumService.createReply(userId, id, body)
    return ok(reply, undefined, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
