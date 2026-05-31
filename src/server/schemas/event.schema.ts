import '@/server/openapi/zod-ext'
import { z } from 'zod'

export const eventTypeSchema = z
  .enum(['Remoto', 'Presencial'])
  .openapi('EventType', { description: 'Modalidade do evento' })

export const visibilitySchema = z
  .enum(['PUBLIC', 'MEMBERS'])
  .openapi('Visibility', {
    description:
      'PUBLIC = visível na landing aberta; MEMBERS = só dentro do dashboard',
  })

export const contentStatusSchema = z
  .enum(['PENDING_APPROVAL', 'PUBLISHED', 'REJECTED'])
  .openapi('ContentStatus')

export const eventSchema = z
  .object({
    number: z.string().openapi({ example: '#01' }),
    title: z.string().openapi({ example: 'Workshop de Go' }),
    description: z
      .string()
      .openapi({ example: 'Sessão prática sobre HTTP servers em Go.' }),
    dateFull: z.string().openapi({ example: 'Sábado, 30 de Fevereiro às 8h' }),
    dateShort: z.string().openapi({ example: '30 Fev' }),
    type: eventTypeSchema,
    visibility: visibilitySchema,
    imageIndex: z.number().int().openapi({ example: 201 }),
    points: z.number().int().openapi({ example: 10 }),
  })
  .openapi('Event')

export const eventQuerySchema = z.object({
  type: eventTypeSchema.optional(),
})

export const eventInputSchema = z
  .object({
    number: z
      .string()
      .trim()
      .min(1, 'Informe o número (ex: #07)')
      .max(10)
      .openapi({ example: '#07' }),
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
    points: z.coerce.number().int().min(1).max(100).default(10),
  })
  .openapi('EventInput')

export type EventType = z.infer<typeof eventTypeSchema>
export type EventDto = z.infer<typeof eventSchema>
export type EventQuery = z.infer<typeof eventQuerySchema>
export type EventInput = z.infer<typeof eventInputSchema>
export type Visibility = z.infer<typeof visibilitySchema>
