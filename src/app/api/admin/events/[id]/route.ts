import { NextRequest, NextResponse } from 'next/server'
import { adminEventsService } from '@/server/services/admin-events.service'
import { requireContentCreatorActor } from '@/server/http/admin'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireContentCreatorActor()
    const { id } = await params
    const body = await request.json()
    const updated = await adminEventsService.update(id, body, actor)
    return ok(updated)
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireContentCreatorActor()
    const { id } = await params
    await adminEventsService.remove(id, actor)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleError(error)
  }
}
