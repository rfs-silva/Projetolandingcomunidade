import { NextRequest } from 'next/server'
import { z } from 'zod'
import { meDataService, DELETE_ACCOUNT_PHRASE } from '@/server/services/me-data.service'
import { requireUserId } from '@/server/http/session'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'
import { checkRateLimit } from '@/server/http/rate-limit'

export const dynamic = 'force-dynamic'

const deleteBodySchema = z.object({
  confirmation: z.string(),
})

export async function DELETE(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, 'meSensitive')
    if (limited) return limited

    const userId = await requireUserId()
    const body = deleteBodySchema.parse(await request.json())
    const result = await meDataService.deleteAccount(userId, body.confirmation)
    return ok({
      ok: true,
      message: 'Conta excluída com sucesso. Você será desconectado.',
      ...result,
      confirmationPhrase: DELETE_ACCOUNT_PHRASE,
    })
  } catch (error) {
    return handleError(error)
  }
}
