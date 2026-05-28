import { NextResponse } from 'next/server'
import { generateOpenApiDocument } from '@/server/openapi/registry'

export const dynamic = 'force-dynamic'

/**
 * Especificação OpenAPI 3.1 gerada a partir dos schemas Zod.
 * Consumida pelo Swagger UI em `/api/docs`.
 */
export async function GET() {
  const doc = generateOpenApiDocument()
  return NextResponse.json(doc, {
    headers: {
      'cache-control': 'public, max-age=60',
    },
  })
}
