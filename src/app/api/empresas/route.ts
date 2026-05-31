import { NextRequest } from 'next/server'
import { companiesService } from '@/server/services/companies.service'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'
import { checkRateLimit } from '@/server/http/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, 'meSensitive')
    if (limited) return limited

    const body = await request.json().catch(() => ({}))
    const created = await companiesService.apply(body)
    return ok(
      {
        id: created.id,
        status: created.status,
        companyName: created.companyName,
      },
      undefined,
      { status: 201 },
    )
  } catch (error) {
    return handleError(error)
  }
}
