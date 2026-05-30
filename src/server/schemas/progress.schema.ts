import '@/server/openapi/zod-ext'
import { z } from 'zod'
import { safeHttpUrl } from '@/server/schemas/url'

export const challengeParticipationStatusSchema = z
  .enum(['IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED'])
  .openapi('ChallengeParticipationStatus')

export const eventRegistrationStatusSchema = z
  .enum(['REGISTERED', 'ATTENDED', 'CANCELLED'])
  .openapi('EventRegistrationStatus')

export const challengeParticipationSchema = z
  .object({
    id: z.string().uuid(),
    challengeId: z.string().uuid(),
    challengeNumber: z.string().openapi({ example: '#01' }),
    challengeTitle: z.string(),
    status: challengeParticipationStatusSchema,
    submissionUrl: z.string().nullable(),
    submissionNote: z.string().nullable(),
    reviewerNote: z.string().nullable(),
    startedAt: z.date(),
    submittedAt: z.date().nullable(),
    reviewedAt: z.date().nullable(),
    points: z.number().int().openapi({
      description: 'Pontos que o desafio vale (só conta se APPROVED)',
    }),
  })
  .openapi('ChallengeParticipation')

export const submitChallengeSchema = z.object({
  submissionUrl: safeHttpUrl.openapi({
    example: 'https://github.com/usuario/projeto',
    description: 'Link público do repositório ou demo',
  }),
  submissionNote: z
    .string()
    .trim()
    .max(500, 'Nota muito longa')
    .optional()
    .or(z.literal('').transform(() => undefined)),
})

export const eventRegistrationSchema = z
  .object({
    id: z.string().uuid(),
    eventId: z.string().uuid(),
    eventNumber: z.string().openapi({ example: '#01' }),
    eventTitle: z.string(),
    status: eventRegistrationStatusSchema,
    registeredAt: z.date(),
    attendedAt: z.date().nullable(),
    cancelledAt: z.date().nullable(),
    points: z.number().int().openapi({
      description: 'Pontos que o evento vale (conta se ATTENDED)',
    }),
  })
  .openapi('EventRegistration')

export type ChallengeParticipationStatus = z.infer<
  typeof challengeParticipationStatusSchema
>
export type EventRegistrationStatus = z.infer<
  typeof eventRegistrationStatusSchema
>
export type ChallengeParticipationDto = z.infer<
  typeof challengeParticipationSchema
>
export type EventRegistrationDto = z.infer<typeof eventRegistrationSchema>
export type SubmitChallengeInput = z.infer<typeof submitChallengeSchema>
