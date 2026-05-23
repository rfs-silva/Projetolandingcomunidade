import { NextRequest } from 'next/server'
import { z } from 'zod'
import { profileService } from '@/server/services/profile.service'
import { requireUserId } from '@/server/http/session'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

const idSchema = z.string().uuid()

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ tagId: string }> },
) {
  try {
    const userId = await requireUserId()
    const { tagId } = await params
    const validated = idSchema.parse(tagId)
    const profile = await profileService.removeTag(userId, validated)
    return ok(profile)
  } catch (error) {
    return handleError(error)
  }
}
