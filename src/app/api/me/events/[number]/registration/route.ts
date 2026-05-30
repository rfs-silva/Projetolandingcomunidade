import { NextRequest } from 'next/server'
import { progressService } from '@/server/services/progress.service'
import { requireUserId } from '@/server/http/session'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'
import { checkRateLimit } from '@/server/http/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ number: string }> },
) {
  try {
    const userId = await requireUserId()
    const { number } = await params
    const registration = await progressService.myEventRegistration(userId, number)
    return ok(registration)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> },
) {
  try {
    const limited = checkRateLimit(request, 'meWrite')
    if (limited) return limited

    const userId = await requireUserId()
    const { number } = await params
    const registration = await progressService.registerEvent(userId, number)
    return ok(registration, undefined, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> },
) {
  try {
    const limited = checkRateLimit(request, 'meWrite')
    if (limited) return limited

    const userId = await requireUserId()
    const { number } = await params
    const registration = await progressService.cancelEventRegistration(
      userId,
      number,
    )
    return ok(registration)
  } catch (error) {
    return handleError(error)
  }
}
