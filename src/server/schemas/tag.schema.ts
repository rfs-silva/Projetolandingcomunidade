import { z } from 'zod'

export const tagCategorySchema = z.enum(['STACK', 'TOPIC'])

export const tagSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  label: z.string(),
  category: tagCategorySchema,
})

export const tagQuerySchema = z.object({
  category: tagCategorySchema.optional(),
  q: z.string().trim().min(1).optional(),
})

export type TagCategoryDto = z.infer<typeof tagCategorySchema>
export type TagDto = z.infer<typeof tagSchema>
export type TagQuery = z.infer<typeof tagQuerySchema>
