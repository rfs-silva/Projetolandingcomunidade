import { NextRequest, NextResponse } from 'next/server'
import { forumService } from '@/server/services/forum.service'
import { requireUserId } from '@/server/http/session'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId()
    const { id } = await params
    const body = await request.json()
    const reply = await forumService.updateReply(userId, id, body)
    return ok(reply)
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId()
    const { id } = await params
    await forumService.deleteReply(userId, id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleError(error)
  }
}
