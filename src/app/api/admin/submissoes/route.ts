import { adminProgressService } from '@/server/services/admin-progress.service'
import { requireAdminUserId } from '@/server/http/admin'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdminUserId()
    const items = await adminProgressService.listPendingSubmissions()
    return ok(items, { total: items.length })
  } catch (error) {
    return handleError(error)
  }
}
