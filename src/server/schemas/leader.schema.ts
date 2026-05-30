import { z } from 'zod'
import { safeHttpUrl } from '@/server/schemas/url'

export const leaderSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().min(1),
  githubUsername: z.string().nullable(),
  linkedinUrl: safeHttpUrl.nullable(),
  avatarUrl: safeHttpUrl.nullable(),
})

export type LeaderDto = z.infer<typeof leaderSchema>
