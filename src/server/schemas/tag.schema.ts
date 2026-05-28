import '@/server/openapi/zod-ext'
import { z } from 'zod'

export const tagCategorySchema = z
  .enum(['STACK', 'TOPIC'])
  .openapi('TagCategory')

export const tagSchema = z
  .object({
    id: z.string().uuid(),
    slug: z.string().openapi({ example: 'react' }),
    label: z.string().openapi({ example: 'React' }),
    category: tagCategorySchema,
  })
  .openapi('Tag')

export const tagQuerySchema = z.object({
  category: tagCategorySchema.optional(),
  q: z.string().trim().min(1).optional(),
})

export type TagCategoryDto = z.infer<typeof tagCategorySchema>
export type TagDto = z.infer<typeof tagSchema>
export type TagQuery = z.infer<typeof tagQuerySchema>
