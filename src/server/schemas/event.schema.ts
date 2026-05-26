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

export const eventInputSchema = z.object({
  number: z
    .string()
    .trim()
    .min(1, 'Informe o número (ex: #07)')
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
  dateFull: z
    .string()
    .trim()
    .min(3, 'Informe a data por extenso'),
  dateShort: z
    .string()
    .trim()
    .min(3, 'Informe um rótulo curto da data')
    .max(50),
  type: eventTypeSchema,
  visibility: visibilitySchema,
  imageIndex: z.coerce.number().int().min(0).max(1000),
})

export type EventType = z.infer<typeof eventTypeSchema>
export type EventDto = z.infer<typeof eventSchema>
export type EventQuery = z.infer<typeof eventQuerySchema>
export type EventInput = z.infer<typeof eventInputSchema>
export type Visibility = z.infer<typeof visibilitySchema>
