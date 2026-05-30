import { NextRequest } from 'next/server'
import { z } from 'zod'
import { adminUsersService } from '@/server/services/admin-users.service'
import { requireAdminUserId } from '@/server/http/admin'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'
import { checkRateLimit } from '@/server/http/rate-limit'

export const dynamic = 'force-dynamic'

const idSchema = z.string().uuid()
const bodySchema = z.object({
  featured: z.boolean(),
  role: z.string().trim().max(80).nullable().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = checkRateLimit(request, 'adminWrite')
    if (limited) return limited

    await requireAdminUserId()
    const { id } = await params
    const userId = idSchema.parse(id)
    const body = bodySchema.parse(await request.json())

    const updated = await adminUsersService.updateFeaturedLeader(userId, {
      featured: body.featured,
      role: body.role ?? null,
    })
    return ok(updated)
  } catch (error) {
    return handleError(error)
  }
}
