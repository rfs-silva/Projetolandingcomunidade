import { progressService } from '@/server/services/progress.service'
import { requireUserId } from '@/server/http/session'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const userId = await requireUserId()
    const stats = await progressService.myStats(userId)
    return ok(stats)
  } catch (error) {
    return handleError(error)
  }
}
