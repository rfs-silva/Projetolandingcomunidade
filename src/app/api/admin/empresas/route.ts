import { NextRequest } from 'next/server'
import { companiesService } from '@/server/services/companies.service'
import { companyApplicationStatusSchema } from '@/server/schemas/company.schema'
import { requireAdminUserId } from '@/server/http/admin'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireAdminUserId()
    const statusParam = request.nextUrl.searchParams.get('status')
    const parsed = statusParam
      ? companyApplicationStatusSchema.safeParse(statusParam)
      : null
    const status = parsed?.success ? parsed.data : undefined
    const rows = await companiesService.listAdmin({ status })
    return ok(rows, { total: rows.length })
  } catch (error) {
    return handleError(error)
  }
}
