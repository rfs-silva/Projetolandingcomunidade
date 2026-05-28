import '@/server/openapi/zod-ext'
import { z } from 'zod'

export const applicationStatusSchema = z
  .enum(['SUBMITTED', 'IN_REVIEW', 'ACCEPTED', 'REJECTED'])
  .openapi('ApplicationStatus')

export const mentorshipKindSchema = z
  .enum(['MENTOR', 'MENTEE'])
  .openapi('MentorshipKind', {
    description: 'MENTOR oferece mentoria; MENTEE busca mentoria',
  })

export const mentorshipApplicationSchema = z
  .object({
    id: z.string().uuid(),
    kind: mentorshipKindSchema,
    goal: z.string(),
    availability: z.string(),
    stack: z.string(),
    status: applicationStatusSchema,
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .openapi('MentorshipApplication')

export const mentorshipApplyInputSchema = z
  .object({
    kind: mentorshipKindSchema,
    goal: z
      .string()
      .trim()
      .min(20, 'Conte pelo menos 20 caracteres')
      .max(500, 'Texto muito longo (máx. 500 caracteres)'),
    availability: z
      .string()
      .trim()
      .min(5, 'Informe sua disponibilidade')
      .max(200, 'Texto muito longo'),
    stack: z
      .string()
      .trim()
      .min(2, 'Liste pelo menos uma tecnologia ou área')
      .max(200, 'Texto muito longo'),
  })
  .openapi('MentorshipApplyInput')

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>
export type MentorshipKind = z.infer<typeof mentorshipKindSchema>
export type MentorshipApplicationDto = z.infer<typeof mentorshipApplicationSchema>
export type MentorshipApplyInput = z.infer<typeof mentorshipApplyInputSchema>
