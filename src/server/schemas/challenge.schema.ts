import '@/server/openapi/zod-ext'
import { z } from 'zod'

export const challengeTagSchema = z
  .object({
    iconName: z.string().openapi({ example: 'Monitor' }),
    label: z.string().openapi({ example: 'Iniciante' }),
  })
  .openapi('ChallengeTag')

export const challengeVisibilitySchema = z.enum(['PUBLIC', 'MEMBERS'])

export const challengeSchema = z
  .object({
    number: z.string().openapi({ example: '#01' }),
    title: z.string().openapi({ example: 'Desafio de Desenvolvimento Web' }),
    description: z.string(),
    tags: z.array(challengeTagSchema),
    visibility: challengeVisibilitySchema,
    imageIndex: z.number().int().openapi({ example: 1 }),
  })
  .openapi('Challenge')

export const challengeInputSchema = z
  .object({
    number: z.string().trim().min(1).max(10).openapi({ example: '#06' }),
    title: z.string().trim().min(3).max(80),
    description: z.string().trim().min(10).max(500),
    imageIndex: z.coerce.number().int().min(0).max(1000),
    visibility: challengeVisibilitySchema,
    tags: z
      .array(challengeTagSchema)
      .max(6, 'Máximo de 6 tags por desafio')
      .default([]),
  })
  .openapi('ChallengeInput')

export type ChallengeTagDto = z.infer<typeof challengeTagSchema>
export type ChallengeDto = z.infer<typeof challengeSchema>
export type ChallengeInput = z.infer<typeof challengeInputSchema>
