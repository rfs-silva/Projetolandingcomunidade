import { NextRequest, NextResponse } from 'next/server'
import { forumService } from '@/server/services/forum.service'
import { requireUserId } from '@/server/http/session'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireUserId()
    const { id } = await params
    const result = await forumService.getById(id)
    return ok(result)
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId()
    const { id } = await params
    const body = await request.json()
    const thread = await forumService.updateThread(userId, id, body)
    return ok(thread)
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
    await forumService.deleteThread(userId, id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleError(error)
  }
}
