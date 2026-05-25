import { NextRequest } from 'next/server'
import { z } from 'zod'
import { mentorshipService } from '@/server/services/mentorship.service'
import { applicationStatusSchema } from '@/server/schemas/mentorship.schema'
import { requireAdminUserId } from '@/server/http/admin'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

const idSchema = z.string().uuid()
const patchBodySchema = z.object({ status: applicationStatusSchema })

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUserId()
    const { id } = await params
    const validId = idSchema.parse(id)
    const body = patchBodySchema.parse(await request.json())
    const updated = await mentorshipService.updateStatus(validId, body.status)
    return ok(updated)
  } catch (error) {
    return handleError(error)
  }
}
