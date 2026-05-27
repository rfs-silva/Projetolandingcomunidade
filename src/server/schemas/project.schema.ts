import { z } from 'zod'
import { optionalSafeHttpUrl } from '@/server/schemas/url'

export const projectCategorySchema = z.enum([
  'Todos',
  'Front-end',
  'Back-end',
  'Mobile',
  'Fullstack',
])

export const editableCategorySchema = z.enum([
  'Front-end',
  'Back-end',
  'Mobile',
  'Fullstack',
])

export const projectVisibilitySchema = z.enum(['PUBLIC', 'MEMBERS'])

export const projectSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  author: z.string(),
  authorAvatar: z.string(),
  image: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  category: projectCategorySchema,
  visibility: projectVisibilitySchema,
  demoUrl: z.string(),
  repoUrl: z.string(),
})

export const projectQuerySchema = z.object({
  category: projectCategorySchema.optional(),
})

// URL opcional restrita a http/https para evitar XSS via javascript:/data:.
const optionalUrl = optionalSafeHttpUrl

export const projectInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Título muito curto')
    .max(80, 'Título muito longo'),
  description: z
    .string()
    .trim()
    .min(10, 'Conte um pouco mais sobre o projeto')
    .max(500, 'Descrição muito longa'),
  category: editableCategorySchema,
  visibility: projectVisibilitySchema.default('MEMBERS'),
  image: optionalUrl,
  demoUrl: optionalUrl,
  repoUrl: optionalUrl,
  tagIds: z.array(z.string().uuid()).max(8, 'Máximo de 8 tags por projeto').default([]),
})

export type ProjectCategoryDto = z.infer<typeof projectCategorySchema>
export type EditableCategoryDto = z.infer<typeof editableCategorySchema>
export type ProjectVisibilityDto = z.infer<typeof projectVisibilitySchema>
export type ProjectDto = z.infer<typeof projectSchema>
export type ProjectQuery = z.infer<typeof projectQuerySchema>
export type ProjectInput = z.infer<typeof projectInputSchema>
