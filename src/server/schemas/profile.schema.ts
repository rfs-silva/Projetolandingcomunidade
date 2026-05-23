import { z } from 'zod'

export const profileTypeSchema = z.enum(['MEMBER', 'COMPANY', 'LEADER', 'FOUNDER'])

// No onboarding self-service permitimos apenas MEMBER ou COMPANY.
// LEADER/FOUNDER exigem promoção manual (admin).
export const selfServiceProfileTypeSchema = z.enum(['MEMBER', 'COMPANY'])

export const profileSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string(),
  bio: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  type: profileTypeSchema,
  location: z.string().nullable(),
  tags: z.array(
    z.object({
      id: z.string().uuid(),
      slug: z.string(),
      label: z.string(),
    }),
  ),
})

const linkedinUrl = z
  .string()
  .trim()
  .url('Informe uma URL válida do LinkedIn')
  .refine((u) => u.includes('linkedin.com'), 'URL precisa ser do LinkedIn')
  .optional()
  .or(z.literal('').transform(() => undefined))

export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Informe um nome com pelo menos 2 caracteres')
    .max(80, 'Nome muito longo'),
  bio: z
    .string()
    .trim()
    .max(280, 'Bio muito longa')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  linkedinUrl,
  location: z
    .string()
    .trim()
    .max(80, 'Localização muito longa')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  type: selfServiceProfileTypeSchema,
})

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
export type ProfileDto = z.infer<typeof profileSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type OnboardingInput = z.infer<typeof onboardingSchema>
