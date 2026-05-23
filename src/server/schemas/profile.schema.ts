import { z } from 'zod'

export const profileTypeSchema = z.enum(['MEMBER', 'COMPANY', 'LEADER', 'FOUNDER'])

// No onboarding self-service permitimos apenas MEMBER ou COMPANY.
// LEADER/FOUNDER exigem promoção manual (admin).
export const selfServiceProfileTypeSchema = z.enum(['MEMBER', 'COMPANY'])

export const onboardingSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Informe um nome com pelo menos 2 caracteres')
    .max(80, 'Nome muito longo'),
  type: selfServiceProfileTypeSchema,
  linkedinUrl: z
    .string()
    .trim()
    .url('Informe uma URL válida do LinkedIn')
    .refine((u) => u.includes('linkedin.com'), 'URL precisa ser do LinkedIn')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  bio: z.string().trim().max(280, 'Bio muito longa').optional()
    .or(z.literal('').transform(() => undefined)),
  acceptedTerms: z.literal('on', {
    errorMap: () => ({ message: 'Você precisa aceitar os termos para continuar' }),
  }),
})

export type ProfileType = z.infer<typeof profileTypeSchema>
export type OnboardingInput = z.infer<typeof onboardingSchema>
