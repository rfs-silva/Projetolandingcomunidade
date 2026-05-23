import { z } from 'zod'

export const projectCategorySchema = z.enum([
  'Todos',
  'Front-end',
  'Back-end',
  'Mobile',
  'Fullstack',
])

export const projectSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  author: z.string(),
  authorAvatar: z.string(),
  image: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  category: projectCategorySchema,
  demoUrl: z.string(),
  repoUrl: z.string(),
})

export const projectQuerySchema = z.object({
  category: projectCategorySchema.optional(),
})

export type ProjectCategoryDto = z.infer<typeof projectCategorySchema>
export type ProjectDto = z.infer<typeof projectSchema>
export type ProjectQuery = z.infer<typeof projectQuerySchema>
