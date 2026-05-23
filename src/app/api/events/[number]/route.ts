import { NextRequest } from 'next/server'
import { eventsService } from '@/server/services/events.service'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ number: string }> },
) {
  try {
    const { number } = await params
    const event = await eventsService.getByNumber(number)
    return ok(event)
  } catch (error) {
    return handleError(error)
  }
}
