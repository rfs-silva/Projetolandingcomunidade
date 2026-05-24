import { z } from 'zod'

export const eventTypeSchema = z.enum(['Remoto', 'Presencial'])
export const visibilitySchema = z.enum(['PUBLIC', 'MEMBERS'])

export const eventSchema = z.object({
  number: z.string(),
  title: z.string(),
  description: z.string(),
  dateFull: z.string(),
  dateShort: z.string(),
  type: eventTypeSchema,
  visibility: visibilitySchema,
  imageIndex: z.number().int(),
})

export const eventQuerySchema = z.object({
  type: eventTypeSchema.optional(),
})

export type EventType = z.infer<typeof eventTypeSchema>
export type EventDto = z.infer<typeof eventSchema>
export type EventQuery = z.infer<typeof eventQuerySchema>
