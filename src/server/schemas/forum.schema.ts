import { z } from 'zod'

export const forumCategorySchema = z.enum([
  'GERAL',
  'ANUNCIOS',
  'AJUDA',
  'CARREIRA',
  'OFF_TOPIC',
])

export const FORUM_CATEGORY_LABELS: Record<
  z.infer<typeof forumCategorySchema>,
  string
> = {
  GERAL: 'Geral',
  ANUNCIOS: 'Anúncios',
  AJUDA: 'Ajuda',
  CARREIRA: 'Carreira',
  OFF_TOPIC: 'Off-topic',
}

export const threadAuthorSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string(),
  githubUsername: z.string(),
  avatarUrl: z.string().nullable(),
})

export const threadSummarySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  category: forumCategorySchema,
  isPinned: z.boolean(),
  isLocked: z.boolean(),
  repliesCount: z.number().int(),
  lastReplyAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  author: threadAuthorSchema,
})

export const threadDetailSchema = threadSummarySchema.extend({
  body: z.string(),
})

export const replySchema = z.object({
  id: z.string().uuid(),
  body: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  author: threadAuthorSchema,
})

export const threadInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Título precisa ter pelo menos 5 caracteres')
    .max(120, 'Título muito longo'),
  body: z
    .string()
    .trim()
    .min(10, 'Conte um pouco mais (mínimo 10 caracteres)')
    .max(10000, 'Texto muito longo'),
  category: forumCategorySchema,
})

export const replyInputSchema = z.object({
  body: z
    .string()
    .trim()
    .min(2, 'Resposta muito curta')
    .max(5000, 'Resposta muito longa'),
})

export const threadAdminPatchSchema = z.object({
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
})

const pageSchema = z.coerce.number().int().min(1).default(1)
const pageSizeSchema = z.coerce.number().int().min(1).max(50).default(20)

export const threadQuerySchema = z.object({
  category: forumCategorySchema.optional(),
  q: z.string().trim().min(1).optional(),
  page: pageSchema,
  pageSize: pageSizeSchema,
})

export type ForumCategory = z.infer<typeof forumCategorySchema>
export type ThreadAuthorDto = z.infer<typeof threadAuthorSchema>
export type ThreadSummaryDto = z.infer<typeof threadSummarySchema>
export type ThreadDetailDto = z.infer<typeof threadDetailSchema>
export type ReplyDto = z.infer<typeof replySchema>
export type ThreadInput = z.infer<typeof threadInputSchema>
export type ReplyInput = z.infer<typeof replyInputSchema>
export type ThreadAdminPatch = z.infer<typeof threadAdminPatchSchema>
export type ThreadQuery = z.infer<typeof threadQuerySchema>
