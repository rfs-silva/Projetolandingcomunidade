import { NextRequest } from 'next/server'
import { profileService } from '@/server/services/profile.service'
import { requireUserId } from '@/server/http/session'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const userId = await requireUserId()
    const profile = await profileService.getDtoByUserId(userId)
    return ok(profile)
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await requireUserId()
    const body = await request.json()
    const updated = await profileService.update(userId, body)
    return ok(updated)
  } catch (error) {
    return handleError(error)
  }
}
