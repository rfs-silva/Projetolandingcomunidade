import 'server-only'
import {
  CompanyApplicationStatus as DbStatus,
  ProfileType as DbProfileType,
} from '@prisma/client'
import { prisma } from '@/server/lib/prisma'
import {
  companyApplicationSchema,
  companyApplyInputSchema,
  type CompanyApplicationDto,
  type CompanyApplicationStatus,
} from '@/server/schemas/company.schema'
import {
  AppError,
  NotFoundError,
  ValidationError,
} from '@/server/http/errors'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function toDto(row: {
  id: string
  companyName: string
  contactName: string
  email: string
  website: string | null
  linkedinUrl: string | null
  description: string
  status: DbStatus
  reviewerNote: string | null
  reviewedAt: Date | null
  approvedUserId: string | null
  createdAt: Date
}): CompanyApplicationDto {
  return companyApplicationSchema.parse(row)
}

export const companiesService = {
  /**
   * Recebe candidatura pública. Bloqueia se já houver candidatura ativa
   * (PENDING ou APPROVED) com o mesmo email — evita spam e duplicação.
   */
  async apply(raw: unknown): Promise<CompanyApplicationDto> {
    const data = companyApplyInputSchema.parse(raw)

    const existingActive = await prisma.companyApplication.findFirst({
      where: {
        email: data.email.toLowerCase(),
        status: { in: [DbStatus.PENDING, DbStatus.APPROVED] },
      },
    })
    if (existingActive) {
      throw new AppError(
        'ALREADY_REGISTERED',
        existingActive.status === 'APPROVED'
          ? 'Já existe uma empresa cadastrada com este email.'
          : 'Já existe uma candidatura em análise para este email.',
        409,
      )
    }

    const created = await prisma.companyApplication.create({
      data: {
        companyName: data.companyName,
        contactName: data.contactName,
        email: data.email.toLowerCase(),
        website: data.website ?? null,
        linkedinUrl: data.linkedinUrl ?? null,
        description: data.description,
      },
    })
    return toDto(created)
  },

  async listAdmin(filters: {
    status?: CompanyApplicationStatus
  } = {}): Promise<CompanyApplicationDto[]> {
    const rows = await prisma.companyApplication.findMany({
      where: filters.status ? { status: DbStatus[filters.status] } : undefined,
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toDto)
  },

  async getById(id: string): Promise<CompanyApplicationDto> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    const row = await prisma.companyApplication.findUnique({ where: { id } })
    if (!row) throw new NotFoundError('Candidatura')
    return toDto(row)
  },

  /**
   * Aprovação cria User + Profile (type COMPANY) sem GitHub.
   * O User passa a poder logar (Fase 2 plugará magic link).
   */
  async approve(
    id: string,
    actor: { userId: string },
    reviewerNote?: string,
  ): Promise<CompanyApplicationDto> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    const existing = await prisma.companyApplication.findUnique({
      where: { id },
    })
    if (!existing) throw new NotFoundError('Candidatura')
    if (existing.status !== 'PENDING') {
      throw new AppError(
        'INVALID_STATE',
        'Apenas candidaturas pendentes podem ser aprovadas.',
        409,
      )
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Reusar User se já existir por email (raro), senão criar novo.
      let user = await tx.user.findUnique({
        where: { email: existing.email },
      })
      if (!user) {
        user = await tx.user.create({
          data: {
            email: existing.email,
            acceptedTermsAt: new Date(),
          },
        })
      }

      // Criar profile COMPANY se ainda não tem.
      const profile = await tx.profile.findUnique({
        where: { userId: user.id },
      })
      if (!profile) {
        await tx.profile.create({
          data: {
            userId: user.id,
            displayName: existing.companyName,
            type: DbProfileType.COMPANY,
            bio: existing.description,
            linkedinUrl: existing.linkedinUrl,
          },
        })
      } else if (profile.type !== 'COMPANY') {
        await tx.profile.update({
          where: { id: profile.id },
          data: { type: DbProfileType.COMPANY },
        })
      }

      return tx.companyApplication.update({
        where: { id },
        data: {
          status: DbStatus.APPROVED,
          reviewerNote: reviewerNote ?? null,
          reviewedById: actor.userId,
          reviewedAt: new Date(),
          approvedUserId: user.id,
        },
      })
    })

    return toDto(updated)
  },

  async reject(
    id: string,
    actor: { userId: string },
    reviewerNote: string,
  ): Promise<CompanyApplicationDto> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    if (!reviewerNote || reviewerNote.trim().length < 3) {
      throw new ValidationError({
        reviewerNote: 'Explique o motivo da recusa (mín. 3 chars)',
      })
    }
    const existing = await prisma.companyApplication.findUnique({
      where: { id },
    })
    if (!existing) throw new NotFoundError('Candidatura')
    if (existing.status !== 'PENDING') {
      throw new AppError(
        'INVALID_STATE',
        'Apenas candidaturas pendentes podem ser recusadas.',
        409,
      )
    }

    const updated = await prisma.companyApplication.update({
      where: { id },
      data: {
        status: DbStatus.REJECTED,
        reviewerNote: reviewerNote.trim(),
        reviewedById: actor.userId,
        reviewedAt: new Date(),
      },
    })
    return toDto(updated)
  },

  async countPending(): Promise<number> {
    return prisma.companyApplication.count({
      where: { status: 'PENDING' },
    })
  },
}
