import 'server-only'
import {
  ContentStatus as DbContentStatus,
  Visibility as DbVisibility,
} from '@prisma/client'
import { prisma } from '@/server/lib/prisma'
import {
  challengeInputSchema,
  challengeSchema,
  type ChallengeDto,
} from '@/server/schemas/challenge.schema'
import { AppError, NotFoundError, ValidationError } from '@/server/http/errors'
import type { ProfileType } from '@/server/schemas/profile.schema'
import { isAdminType } from '@/server/lib/admin-session'

function normalize(num: string): string {
  if (num.startsWith('#')) return num
  return `#${num.padStart(2, '0')}`
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type ChallengeRowWithTags = {
  number: string
  title: string
  description: string
  imageIndex: number
  visibility: DbVisibility
  points: number
  tags: { iconName: string; label: string }[]
}

function toDto(row: ChallengeRowWithTags): ChallengeDto {
  return challengeSchema.parse({
    number: row.number,
    title: row.title,
    description: row.description,
    imageIndex: row.imageIndex,
    visibility: row.visibility,
    points: row.points,
    tags: row.tags.map((t) => ({ iconName: t.iconName, label: t.label })),
  })
}

export type AdminChallengeRow = ChallengeDto & {
  id: string
  status: 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED'
  createdById: string | null
  reviewerNote: string | null
  reviewedAt: Date | null
}

type Actor = { userId: string; profileType: ProfileType }

function assertCanModify(
  row: { createdById: string | null },
  actor: Actor,
): void {
  if (isAdminType(actor.profileType)) return
  if (row.createdById && row.createdById === actor.userId) return
  throw new AppError(
    'FORBIDDEN',
    'Você só pode editar conteúdo criado pela sua conta.',
    403,
  )
}

export const adminChallengesService = {
  async list(
    actor: Actor,
    statusFilter?: 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED',
  ): Promise<AdminChallengeRow[]> {
    const isAdmin = isAdminType(actor.profileType)
    const rows = await prisma.challenge.findMany({
      where: {
        ...(isAdmin ? {} : { createdById: actor.userId }),
        ...(statusFilter ? { status: DbContentStatus[statusFilter] } : {}),
      },
      include: { tags: true },
      orderBy: { number: 'asc' },
    })
    return rows.map((row) => ({
      ...toDto(row),
      id: row.id,
      status: row.status,
      createdById: row.createdById,
      reviewerNote: row.reviewerNote,
      reviewedAt: row.reviewedAt,
    }))
  },

  async getById(id: string, actor: Actor): Promise<AdminChallengeRow> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    const row = await prisma.challenge.findUnique({
      where: { id },
      include: { tags: true },
    })
    if (!row) throw new NotFoundError('Desafio')
    if (!isAdminType(actor.profileType) && row.createdById !== actor.userId) {
      throw new NotFoundError('Desafio')
    }
    return {
      ...toDto(row),
      id: row.id,
      status: row.status,
      createdById: row.createdById,
      reviewerNote: row.reviewerNote,
      reviewedAt: row.reviewedAt,
    }
  },

  async create(raw: unknown, actor: Actor): Promise<AdminChallengeRow> {
    const data = challengeInputSchema.parse(raw)
    const number = normalize(data.number)

    const dup = await prisma.challenge.findUnique({ where: { number } })
    if (dup) {
      throw new AppError(
        'NUMBER_TAKEN',
        `Já existe um desafio com o número ${number}`,
        409,
      )
    }

    const isAdmin = isAdminType(actor.profileType)
    const created = await prisma.$transaction(async (tx) => {
      const challenge = await tx.challenge.create({
        data: {
          number,
          title: data.title,
          description: data.description,
          imageIndex: data.imageIndex,
          visibility: DbVisibility[data.visibility],
          points: data.points,
          status: isAdmin
            ? DbContentStatus.PUBLISHED
            : DbContentStatus.PENDING_APPROVAL,
          createdById: actor.userId,
        },
      })
      if (data.tags.length > 0) {
        await tx.challengeTag.createMany({
          data: data.tags.map((t) => ({
            challengeId: challenge.id,
            iconName: t.iconName,
            label: t.label,
          })),
        })
      }
      return challenge
    })

    return this.getById(created.id, actor)
  },

  async update(
    id: string,
    raw: unknown,
    actor: Actor,
  ): Promise<AdminChallengeRow> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    const data = challengeInputSchema.parse(raw)
    const number = normalize(data.number)

    const existing = await prisma.challenge.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('Desafio')
    assertCanModify(existing, actor)

    if (existing.number !== number) {
      const dup = await prisma.challenge.findUnique({ where: { number } })
      if (dup) {
        throw new AppError(
          'NUMBER_TAKEN',
          `Já existe um desafio com o número ${number}`,
          409,
        )
      }
    }

    const isAdmin = isAdminType(actor.profileType)
    const nextStatus = isAdmin
      ? existing.status
      : DbContentStatus.PENDING_APPROVAL

    await prisma.$transaction(async (tx) => {
      await tx.challenge.update({
        where: { id },
        data: {
          number,
          title: data.title,
          description: data.description,
          imageIndex: data.imageIndex,
          visibility: DbVisibility[data.visibility],
          points: data.points,
          status: nextStatus,
          ...(isAdmin
            ? {}
            : { reviewerNote: null, reviewedAt: null, reviewedById: null }),
        },
      })
      await tx.challengeTag.deleteMany({ where: { challengeId: id } })
      if (data.tags.length > 0) {
        await tx.challengeTag.createMany({
          data: data.tags.map((t) => ({
            challengeId: id,
            iconName: t.iconName,
            label: t.label,
          })),
        })
      }
    })

    return this.getById(id, actor)
  },

  async remove(id: string, actor: Actor): Promise<void> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    const existing = await prisma.challenge.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('Desafio')
    assertCanModify(existing, actor)
    await prisma.challenge.delete({ where: { id } })
  },

  async approve(
    id: string,
    actor: Actor,
    reviewerNote?: string,
  ): Promise<AdminChallengeRow> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    if (!isAdminType(actor.profileType)) {
      throw new AppError('FORBIDDEN', 'Apenas lideranças aprovam.', 403)
    }
    const existing = await prisma.challenge.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('Desafio')
    if (existing.status !== 'PENDING_APPROVAL') {
      throw new AppError(
        'INVALID_STATE',
        'Apenas desafios pendentes podem ser aprovados.',
        409,
      )
    }
    await prisma.challenge.update({
      where: { id },
      data: {
        status: DbContentStatus.PUBLISHED,
        reviewerNote: reviewerNote ?? null,
        reviewedById: actor.userId,
        reviewedAt: new Date(),
      },
    })
    return this.getById(id, actor)
  },

  async reject(
    id: string,
    actor: Actor,
    reviewerNote: string,
  ): Promise<AdminChallengeRow> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    if (!isAdminType(actor.profileType)) {
      throw new AppError('FORBIDDEN', 'Apenas lideranças revisam.', 403)
    }
    if (!reviewerNote || reviewerNote.trim().length < 3) {
      throw new ValidationError({
        reviewerNote: 'Explique o motivo (mín. 3 chars)',
      })
    }
    const existing = await prisma.challenge.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('Desafio')
    if (existing.status !== 'PENDING_APPROVAL') {
      throw new AppError(
        'INVALID_STATE',
        'Apenas desafios pendentes podem ser devolvidos.',
        409,
      )
    }
    await prisma.challenge.update({
      where: { id },
      data: {
        status: DbContentStatus.REJECTED,
        reviewerNote: reviewerNote.trim(),
        reviewedById: actor.userId,
        reviewedAt: new Date(),
      },
    })
    return this.getById(id, actor)
  },

  async countPendingApproval(): Promise<number> {
    return prisma.challenge.count({
      where: { status: 'PENDING_APPROVAL' },
    })
  },
}
