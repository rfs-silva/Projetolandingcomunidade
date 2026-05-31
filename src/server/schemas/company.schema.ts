import '@/server/openapi/zod-ext'
import { z } from 'zod'
import { safeHttpUrl } from '@/server/schemas/url'

export const companyApplicationStatusSchema = z
  .enum(['PENDING', 'APPROVED', 'REJECTED'])
  .openapi('CompanyApplicationStatus')

export const companyApplyInputSchema = z
  .object({
    companyName: z.string().trim().min(2).max(120),
    contactName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(200),
    website: safeHttpUrl.nullable().optional(),
    linkedinUrl: safeHttpUrl.nullable().optional(),
    description: z.string().trim().min(30).max(1000),
  })
  .openapi('CompanyApplyInput')

export const companyApplicationSchema = z
  .object({
    id: z.string(),
    companyName: z.string(),
    contactName: z.string(),
    email: z.string(),
    website: z.string().nullable(),
    linkedinUrl: z.string().nullable(),
    description: z.string(),
    status: companyApplicationStatusSchema,
    reviewerNote: z.string().nullable(),
    reviewedAt: z.date().nullable(),
    approvedUserId: z.string().nullable(),
    createdAt: z.date(),
  })
  .openapi('CompanyApplication')

export type CompanyApplyInput = z.infer<typeof companyApplyInputSchema>
export type CompanyApplicationDto = z.infer<typeof companyApplicationSchema>
export type CompanyApplicationStatus = z.infer<
  typeof companyApplicationStatusSchema
>
