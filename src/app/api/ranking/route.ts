import { NextRequest } from 'next/server'
import { progressService } from '@/server/services/progress.service'
import { requireUserId } from '@/server/http/session'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireUserId()
    const limitParam = request.nextUrl.searchParams.get('limit')
    const limit = limitParam ? Number(limitParam) : 10
    const safe = Number.isFinite(limit) ? limit : 10
    const ranking = await progressService.ranking(safe)
    return ok(ranking, { total: ranking.length })
  } catch (error) {
    return handleError(error)
  }
}
