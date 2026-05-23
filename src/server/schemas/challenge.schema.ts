import { z } from 'zod'

export const challengeTagSchema = z.object({
  iconName: z.string(),
  label: z.string(),
})

export const challengeSchema = z.object({
  number: z.string(),
  title: z.string(),
  description: z.string(),
  tags: z.array(challengeTagSchema),
  imageIndex: z.number().int(),
})

export type ChallengeTagDto = z.infer<typeof challengeTagSchema>
export type ChallengeDto = z.infer<typeof challengeSchema>
