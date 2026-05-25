import { NextRequest } from 'next/server'
import { mentorshipService } from '@/server/services/mentorship.service'
import { mentorshipKindSchema } from '@/server/schemas/mentorship.schema'
import { requireUserId } from '@/server/http/session'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId()
    const kindParam = request.nextUrl.searchParams.get('kind')

    if (kindParam) {
      const kind = mentorshipKindSchema.parse(kindParam)
      const application = await mentorshipService.getLatest(userId, kind)
      return ok(application)
    }

    const applications = await mentorshipService.getLatestAll(userId)
    return ok(applications)
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
