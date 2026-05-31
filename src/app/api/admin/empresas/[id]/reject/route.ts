import { NextRequest } from 'next/server'
import { companiesService } from '@/server/services/companies.service'
import { requireAdminUserId } from '@/server/http/admin'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'
import { checkRateLimit } from '@/server/http/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const limited = checkRateLimit(request, 'adminWrite')
    if (limited) return limited

    const adminId = await requireAdminUserId()
    const { id } = await params
    const body = (await request.json().catch(() => ({}))) as {
      reviewerNote?: string
    }
    const updated = await companiesService.reject(
      id,
      { userId: adminId },
      body?.reviewerNote ?? '',
    )
    return ok({ id: updated.id, status: updated.status })
  } catch (error) {
    return handleError(error)
  }
}
