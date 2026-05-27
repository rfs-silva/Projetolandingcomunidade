import { prisma } from '@/server/lib/prisma'
import { ok } from '@/server/http/response'
import { handleError, AppError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

/**
 * Healthcheck enxuto. Não expõe:
 * - uptime (signal de quando o processo subiu)
 * - versão/commit (signal pra exploits CVE específicas)
 * - detalhes do erro do DB (passa só "indisponível")
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return ok({ status: 'ok' })
  } catch (error) {
    console.error('[health] db check failed:', error)
    return handleError(
      new AppError('SERVICE_UNAVAILABLE', 'Serviço indisponível', 503),
    )
  }
}
