import { NextRequest } from 'next/server'
import { challengesService } from '@/server/services/challenges.service'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ number: string }> },
) {
  try {
    const { number } = await params
    const challenge = await challengesService.getByNumber(number)
    return ok(challenge)
  } catch (error) {
    return handleError(error)
  }
}
