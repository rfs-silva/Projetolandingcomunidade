import { NextRequest } from 'next/server'
import { adminProgressService } from '@/server/services/admin-progress.service'
import { requireAdminUserId } from '@/server/http/admin'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'
import { checkRateLimit } from '@/server/http/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ regId: string }> },
) {
  try {
    const limited = checkRateLimit(request, 'adminWrite')
    if (limited) return limited

    await requireAdminUserId()
    const { regId } = await params
    const body = (await request.json().catch(() => ({}))) as {
      attended?: boolean
    }
    const updated = await adminProgressService.setAttendance(
      regId,
      body?.attended === true,
    )
    return ok({ id: updated.id, status: updated.status })
  } catch (error) {
    return handleError(error)
  }
}
