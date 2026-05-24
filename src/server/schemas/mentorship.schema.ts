import { z } from 'zod'

export const applicationStatusSchema = z.enum([
  'SUBMITTED',
  'IN_REVIEW',
  'ACCEPTED',
  'REJECTED',
])

export const mentorshipApplicationSchema = z.object({
  id: z.string().uuid(),
  goal: z.string(),
  availability: z.string(),
  stack: z.string(),
  status: applicationStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const mentorshipApplyInputSchema = z.object({
  goal: z
    .string()
    .trim()
    .min(20, 'Conte pelo menos 20 caracteres sobre seu objetivo')
    .max(500, 'Objetivo muito longo (máx. 500 caracteres)'),
  availability: z
    .string()
    .trim()
    .min(5, 'Informe sua disponibilidade')
    .max(200, 'Texto muito longo'),
  stack: z
    .string()
    .trim()
    .min(2, 'Liste pelo menos uma tecnologia')
    .max(200, 'Texto muito longo'),
})

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>
export type MentorshipApplicationDto = z.infer<typeof mentorshipApplicationSchema>
export type MentorshipApplyInput = z.infer<typeof mentorshipApplyInputSchema>
