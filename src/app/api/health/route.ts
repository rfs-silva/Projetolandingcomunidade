import { prisma } from '@/server/lib/prisma'
import { ok } from '@/server/http/response'
import { handleError, AppError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return ok({
      status: 'ok',
      database: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  } catch (error) {
    return handleError(
      new AppError('SERVICE_UNAVAILABLE', 'Banco de dados indisponível', 503, {
        cause: error instanceof Error ? error.message : String(error),
      }),
    )
  }
}
