import { NextRequest } from 'next/server'
import { z } from 'zod'
import { adminUsersService } from '@/server/services/admin-users.service'
import { profileTypeSchema } from '@/server/schemas/profile.schema'
import { requireAdminUserId } from '@/server/http/admin'
import { ok } from '@/server/http/response'
import { handleError, AppError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

const idSchema = z.string().uuid()
const patchBodySchema = z.object({ type: profileTypeSchema })

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminId = await requireAdminUserId()
    const { id } = await params
    const userId = idSchema.parse(id)
    const body = patchBodySchema.parse(await request.json())

    if (userId === adminId && body.type !== 'LEADER' && body.type !== 'FOUNDER') {
      throw new AppError(
        'FORBIDDEN',
        'Você não pode rebaixar a si mesmo. Peça a outro admin.',
        403,
      )
    }

    const updated = await adminUsersService.updateType(userId, body.type)
    return ok(updated)
  } catch (error) {
    return handleError(error)
  }
}
