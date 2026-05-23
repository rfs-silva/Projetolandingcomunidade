import { NextRequest } from 'next/server'
import { z } from 'zod'
import { profileService } from '@/server/services/profile.service'
import { requireUserId } from '@/server/http/session'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

const addTagSchema = z.object({
  tagId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId()
    const body = addTagSchema.parse(await request.json())
    const profile = await profileService.addTag(userId, body.tagId)
    return ok(profile)
  } catch (error) {
    return handleError(error)
  }
}
