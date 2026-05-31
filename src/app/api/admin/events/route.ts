import { NextRequest } from 'next/server'
import { adminEventsService } from '@/server/services/admin-events.service'
import { requireContentCreatorActor } from '@/server/http/admin'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const actor = await requireContentCreatorActor()
    const events = await adminEventsService.list(actor)
    return ok(events, { total: events.length })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireContentCreatorActor()
    const body = await request.json()
    const created = await adminEventsService.create(body, actor)
    return ok(created, undefined, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
