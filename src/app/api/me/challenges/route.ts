import { challengesService } from '@/server/services/challenges.service'
import { requireUserId } from '@/server/http/session'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireUserId()
    const challenges = await challengesService.list({ includeMembers: true })
    return ok(challenges, { total: challenges.length })
  } catch (error) {
    return handleError(error)
  }
}
