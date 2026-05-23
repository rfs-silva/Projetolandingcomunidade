import { challengesService } from '@/server/services/challenges.service'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const challenges = await challengesService.list()
    return ok(challenges, { total: challenges.length })
  } catch (error) {
    return handleError(error)
  }
}
