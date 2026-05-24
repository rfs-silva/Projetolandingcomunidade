import { NextRequest } from 'next/server'
import { eventsService } from '@/server/services/events.service'
import { eventQuerySchema } from '@/server/schemas/event.schema'
import { requireUserId } from '@/server/http/session'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireUserId()
    const params = Object.fromEntries(request.nextUrl.searchParams)
    const query = eventQuerySchema.parse(params)
    const events = await eventsService.list(query, { includeMembers: true })
    return ok(events, { total: events.length })
  } catch (error) {
    return handleError(error)
  }
}
