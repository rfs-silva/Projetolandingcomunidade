import { NextRequest } from 'next/server'
import { tagsService } from '@/server/services/tags.service'
import { tagQuerySchema } from '@/server/schemas/tag.schema'
import { ok } from '@/server/http/response'
import { handleError } from '@/server/http/errors'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams)
    const query = tagQuerySchema.parse(params)
    const tags = await tagsService.list(query)
    return ok(tags, { total: tags.length })
  } catch (error) {
    return handleError(error)
  }
}
