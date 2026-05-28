import '@/server/openapi/zod-ext'
import { z } from 'zod'
import { profileTypeSchema } from '@/server/schemas/profile.schema'

export const memberSchema = z
  .object({
    id: z.string().uuid(),
    displayName: z.string(),
    type: profileTypeSchema,
    bio: z.string().nullable(),
    linkedinUrl: z.string().nullable(),
    location: z.string().nullable(),
    avatarUrl: z.string().nullable(),
    githubUsername: z.string(),
    tags: z.array(
      z.object({
        id: z.string().uuid(),
        slug: z.string(),
        label: z.string(),
      }),
    ),
  })
  .openapi('Member')

const pageSchema = z.coerce.number().int().min(1).default(1)
const pageSizeSchema = z.coerce.number().int().min(1).max(50).default(12)

export const memberQuerySchema = z.object({
  type: profileTypeSchema.optional(),
  tags: z
    .string()
    .transform((v) =>
      v
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    )
    .optional(),
  q: z.string().trim().min(1).optional(),
  page: pageSchema,
  pageSize: pageSizeSchema,
})

export type MemberDto = z.infer<typeof memberSchema>
export type MemberQuery = z.infer<typeof memberQuerySchema>
