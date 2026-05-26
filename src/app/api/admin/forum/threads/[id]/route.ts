import { NextRequest, NextResponse } from 'next/server'
import { forumService } from '@/server/services/forum.service'
import { requireAdminUserId } from '@/server/http/admin'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUserId()
    const { id } = await params
    const body = await request.json()
    const thread = await forumService.adminPatchThread(id, body)
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
    const adminId = await requireAdminUserId()
    const { id } = await params
    await forumService.deleteThread(adminId, id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleError(error)
  }
}
