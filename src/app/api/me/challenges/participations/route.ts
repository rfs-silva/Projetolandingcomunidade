import { progressService } from '@/server/services/progress.service'
import { requireUserId } from '@/server/http/session'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const userId = await requireUserId()
    const list = await progressService.listMyChallenges(userId)
    return ok(list, { total: list.length })
  } catch (error) {
    return handleError(error)
  }
}
