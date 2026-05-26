import { NextRequest, NextResponse } from 'next/server'
import { adminChallengesService } from '@/server/services/admin-challenges.service'
import { requireAdminUserId } from '@/server/http/admin'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUserId()
    const { id } = await params
    const body = await request.json()
    const updated = await adminChallengesService.update(id, body)
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
    await requireAdminUserId()
    const { id } = await params
    await adminChallengesService.remove(id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleError(error)
  }
}
