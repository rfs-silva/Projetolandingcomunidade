import { NextRequest } from 'next/server'
import { adminEventsService } from '@/server/services/admin-events.service'
import { requireContentCreatorUserId } from '@/server/http/admin'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireContentCreatorUserId()
    const events = await adminEventsService.list()
    return ok(events, { total: events.length })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireContentCreatorUserId()
    const body = await request.json()
    const created = await adminEventsService.create(body)
    return ok(created, undefined, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
