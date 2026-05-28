import '@/server/openapi/zod-ext'
import { z } from 'zod'
import { optionalSafeHttpUrl } from '@/server/schemas/url'

export const projectCategorySchema = z
  .enum(['Todos', 'Front-end', 'Back-end', 'Mobile', 'Fullstack'])
  .openapi('ProjectCategory')

export const editableCategorySchema = z.enum([
  'Front-end',
  'Back-end',
  'Mobile',
  'Fullstack',
])

export const projectVisibilitySchema = z.enum(['PUBLIC', 'MEMBERS'])

export const projectSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().openapi({ example: 'E-commerce Dashboard' }),
    author: z.string().openapi({ example: 'Ana Silva' }),
    authorAvatar: z.string(),
    image: z.string(),
    description: z.string(),
    tags: z
      .array(z.string())
      .openapi({ example: ['React', 'TypeScript', 'Tailwind'] }),
    category: projectCategorySchema,
    visibility: projectVisibilitySchema,
    demoUrl: z.string(),
    repoUrl: z.string(),
  })
  .openapi('Project')

export const projectQuerySchema = z.object({
  category: projectCategorySchema.optional(),
})

// URL opcional restrita a http/https para evitar XSS via javascript:/data:.
const optionalUrl = optionalSafeHttpUrl

export const projectInputSchema = z
  .object({
    title: z.string().trim().min(2).max(80),
    description: z.string().trim().min(10).max(500),
    category: editableCategorySchema,
    visibility: projectVisibilitySchema.default('MEMBERS'),
    image: optionalUrl,
    demoUrl: optionalUrl,
    repoUrl: optionalUrl,
    tagIds: z
      .array(z.string().uuid())
      .max(8, 'Máximo de 8 tags por projeto')
      .default([]),
  })
  .openapi('ProjectInput')

export type ProjectCategoryDto = z.infer<typeof projectCategorySchema>
export type EditableCategoryDto = z.infer<typeof editableCategorySchema>
export type ProjectVisibilityDto = z.infer<typeof projectVisibilitySchema>
export type ProjectDto = z.infer<typeof projectSchema>
export type ProjectQuery = z.infer<typeof projectQuerySchema>
export type ProjectInput = z.infer<typeof projectInputSchema>
