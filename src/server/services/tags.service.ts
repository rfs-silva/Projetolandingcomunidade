import 'server-only'
import { TagCategory } from '@prisma/client'
import { prisma } from '@/server/lib/prisma'
import {
  tagSchema,
  type TagDto,
  type TagQuery,
} from '@/server/schemas/tag.schema'

export const tagsService = {
  async list(query: TagQuery): Promise<TagDto[]> {
    const rows = await prisma.tag.findMany({
      where: {
        ...(query.category
          ? { category: TagCategory[query.category] }
          : {}),
        ...(query.q
          ? {
              OR: [
                { slug: { contains: query.q, mode: 'insensitive' } },
                { label: { contains: query.q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ category: 'asc' }, { label: 'asc' }],
    })
    return rows.map((t) => tagSchema.parse(t))
  },
}
