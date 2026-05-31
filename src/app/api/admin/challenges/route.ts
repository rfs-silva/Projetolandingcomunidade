import { NextRequest } from 'next/server'
import { adminChallengesService } from '@/server/services/admin-challenges.service'
import { requireContentCreatorUserId } from '@/server/http/admin'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireContentCreatorUserId()
    const challenges = await adminChallengesService.list()
    return ok(challenges, { total: challenges.length })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireContentCreatorUserId()
    const body = await request.json()
    const created = await adminChallengesService.create(body)
    return ok(created, undefined, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
