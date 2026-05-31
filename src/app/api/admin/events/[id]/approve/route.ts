import { NextRequest } from 'next/server'
import { adminEventsService } from '@/server/services/admin-events.service'
import { requireContentCreatorActor } from '@/server/http/admin'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'
import { checkRateLimit } from '@/server/http/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = checkRateLimit(request, 'adminWrite')
    if (limited) return limited

    const actor = await requireContentCreatorActor()
    const { id } = await params
    const body = (await request.json().catch(() => ({}))) as {
      reviewerNote?: string
    }
    const updated = await adminEventsService.approve(
      id,
      actor,
      body?.reviewerNote,
    )
    return ok({ id: updated.id, status: updated.status })
  } catch (error) {
    return handleError(error)
  }
}
