import { NextRequest } from 'next/server'
import { progressService } from '@/server/services/progress.service'
import { requireUserId } from '@/server/http/session'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'
import { checkRateLimit } from '@/server/http/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> },
) {
  try {
    const limited = checkRateLimit(request, 'meSensitive')
    if (limited) return limited

    const userId = await requireUserId()
    const { number } = await params
    const body = await request.json().catch(() => ({}))
    const participation = await progressService.submitChallenge(
      userId,
      number,
      body,
    )
    return ok(participation)
  } catch (error) {
    return handleError(error)
  }
}
