import { NextResponse } from 'next/server'
import { meDataService } from '@/server/services/me-data.service'
import { requireUserId } from '@/server/http/session'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const userId = await requireUserId()
    const payload = await meDataService.export(userId)

    const json = JSON.stringify(payload, null, 2)
    const filename = `comunidade-roraima-${payload.account.githubUsername}-${
      new Date().toISOString().slice(0, 10)
    }.json`

    return new NextResponse(json, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'content-disposition': `attachment; filename="${filename}"`,
        'cache-control': 'no-store',
      },
    })
  } catch (error) {
    return handleError(error)
  }
}
