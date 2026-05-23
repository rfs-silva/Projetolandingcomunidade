import { z } from 'zod'

export const leaderSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().min(1),
  githubUsername: z.string().nullable(),
  linkedinUrl: z.string().url().nullable(),
  avatarUrl: z.string().url().nullable(),
})

export const leadersFileSchema = z.object({
  leaders: z.array(leaderSchema),
})

export type LeaderDto = z.infer<typeof leaderSchema>
