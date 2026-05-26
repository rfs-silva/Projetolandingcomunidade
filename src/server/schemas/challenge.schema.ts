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

export const challengeInputSchema = z.object({
  number: z
    .string()
    .trim()
    .min(1, 'Informe o número (ex: #06)')
    .max(10),
  title: z
    .string()
    .trim()
    .min(3, 'Título muito curto')
    .max(80, 'Título muito longo'),
  description: z
    .string()
    .trim()
    .min(10, 'Descrição muito curta')
    .max(500, 'Descrição muito longa'),
  imageIndex: z.coerce.number().int().min(0).max(1000),
  visibility: challengeVisibilitySchema,
  tags: z
    .array(challengeTagSchema)
    .max(6, 'Máximo de 6 tags por desafio')
    .default([]),
})

export type ChallengeTagDto = z.infer<typeof challengeTagSchema>
export type ChallengeDto = z.infer<typeof challengeSchema>
export type ChallengeInput = z.infer<typeof challengeInputSchema>
