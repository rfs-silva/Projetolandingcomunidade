import { NextRequest } from 'next/server'
import { membersService } from '@/server/services/members.service'
import { memberQuerySchema } from '@/server/schemas/member.schema'
import { requireUserId } from '@/server/http/session'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireUserId()
    const params = Object.fromEntries(request.nextUrl.searchParams)
    const query = memberQuerySchema.parse(params)
    const result = await membersService.list(query)
    return ok(result.members, {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    })
  } catch (error) {
    return handleError(error)
  }
}
