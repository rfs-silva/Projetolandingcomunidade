import { NextRequest } from 'next/server'
import { mentorshipService } from '@/server/services/mentorship.service'
import { requireUserId } from '@/server/http/session'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const userId = await requireUserId()
    const application = await mentorshipService.getLatest(userId)
    return ok(application)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId()
    const body = await request.json()
    const application = await mentorshipService.apply(userId, body)
    return ok(application, undefined, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
