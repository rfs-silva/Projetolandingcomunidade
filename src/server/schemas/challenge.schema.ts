import { z } from 'zod'

export const challengeTagSchema = z.object({
  iconName: z.string(),
  label: z.string(),
})

export const challengeVisibilitySchema = z.enum(['PUBLIC', 'MEMBERS'])

export const challengeSchema = z.object({
  number: z.string(),
  title: z.string(),
  description: z.string(),
  tags: z.array(challengeTagSchema),
  visibility: challengeVisibilitySchema,
  imageIndex: z.number().int(),
})

export type ChallengeTagDto = z.infer<typeof challengeTagSchema>
export type ChallengeDto = z.infer<typeof challengeSchema>
