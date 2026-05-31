import 'server-only'
import {
  ContentStatus as DbContentStatus,
  EventType as DbEventType,
  Visibility as DbVisibility,
} from '@prisma/client'
import { prisma } from '@/server/lib/prisma'
import {
  eventInputSchema,
  eventSchema,
  type EventDto,
} from '@/server/schemas/event.schema'
import { AppError, NotFoundError, ValidationError } from '@/server/http/errors'
import type { ProfileType } from '@/server/schemas/profile.schema'
import { isAdminType } from '@/server/lib/admin-session'

function normalize(num: string): string {
  if (num.startsWith('#')) return num
  return `#${num.padStart(2, '0')}`
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type EventRow = {
  number: string
  title: string
  description: string
  dateFull: string
  dateShort: string
  type: DbEventType
  visibility: DbVisibility
  imageIndex: number
  points: number
}

function toDto(row: EventRow): EventDto {
  return eventSchema.parse({
    number: row.number,
    title: row.title,
    description: row.description,
    dateFull: row.dateFull,
    dateShort: row.dateShort,
    type: row.type === DbEventType.REMOTO ? 'Remoto' : 'Presencial',
    visibility: row.visibility,
    imageIndex: row.imageIndex,
    points: row.points,
  })
}

export type AdminEventRow = EventDto & {
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

export const adminEventsService = {
  /**
   * Lista para admin. COMPANY vê só seus próprios; LEADER/FOUNDER vê tudo.
   * `statusFilter` (opcional) restringe por status.
   */
  async list(
    actor: Actor,
    statusFilter?: 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED',
  ): Promise<AdminEventRow[]> {
    const isAdmin = isAdminType(actor.profileType)
    const rows = await prisma.event.findMany({
      where: {
        ...(isAdmin ? {} : { createdById: actor.userId }),
        ...(statusFilter ? { status: DbContentStatus[statusFilter] } : {}),
      },
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

  async getById(id: string, actor: Actor): Promise<AdminEventRow> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    const row = await prisma.event.findUnique({ where: { id } })
    if (!row) throw new NotFoundError('Evento')
    if (!isAdminType(actor.profileType) && row.createdById !== actor.userId) {
      throw new NotFoundError('Evento')
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

  /**
   * Cria evento. Admin publica direto; COMPANY entra em PENDING_APPROVAL.
   */
  async create(raw: unknown, actor: Actor): Promise<AdminEventRow> {
    const data = eventInputSchema.parse(raw)
    const number = normalize(data.number)

    const dup = await prisma.event.findUnique({ where: { number } })
    if (dup) {
      throw new AppError(
        'NUMBER_TAKEN',
        `Já existe um evento com o número ${number}`,
        409,
      )
    }

    const isAdmin = isAdminType(actor.profileType)
    const row = await prisma.event.create({
      data: {
        number,
        title: data.title,
        description: data.description,
        dateFull: data.dateFull,
        dateShort: data.dateShort,
        type: data.type === 'Remoto' ? DbEventType.REMOTO : DbEventType.PRESENCIAL,
        visibility: DbVisibility[data.visibility],
        imageIndex: data.imageIndex,
        points: data.points,
        status: isAdmin
          ? DbContentStatus.PUBLISHED
          : DbContentStatus.PENDING_APPROVAL,
        createdById: actor.userId,
      },
    })
    return {
      ...toDto(row),
      id: row.id,
      status: row.status,
      createdById: row.createdById,
      reviewerNote: row.reviewerNote,
      reviewedAt: row.reviewedAt,
    }
  },

  /**
   * Atualiza. COMPANY só pode mexer no seu; se já estava REJECTED ou
   * PENDING_APPROVAL, volta para PENDING_APPROVAL (reaberta para revisão).
   */
  async update(id: string, raw: unknown, actor: Actor): Promise<AdminEventRow> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    const data = eventInputSchema.parse(raw)
    const number = normalize(data.number)

    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('Evento')
    assertCanModify(existing, actor)

    if (existing.number !== number) {
      const dup = await prisma.event.findUnique({ where: { number } })
      if (dup) {
        throw new AppError(
          'NUMBER_TAKEN',
          `Já existe um evento com o número ${number}`,
          409,
        )
      }
    }

    const isAdmin = isAdminType(actor.profileType)
    const nextStatus = isAdmin
      ? existing.status
      : DbContentStatus.PENDING_APPROVAL

    const row = await prisma.event.update({
      where: { id },
      data: {
        number,
        title: data.title,
        description: data.description,
        dateFull: data.dateFull,
        dateShort: data.dateShort,
        type: data.type === 'Remoto' ? DbEventType.REMOTO : DbEventType.PRESENCIAL,
        visibility: DbVisibility[data.visibility],
        imageIndex: data.imageIndex,
        points: data.points,
        status: nextStatus,
        ...(isAdmin
          ? {}
          : { reviewerNote: null, reviewedAt: null, reviewedById: null }),
      },
    })
    return {
      ...toDto(row),
      id: row.id,
      status: row.status,
      createdById: row.createdById,
      reviewerNote: row.reviewerNote,
      reviewedAt: row.reviewedAt,
    }
  },

  async remove(id: string, actor: Actor): Promise<void> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('Evento')
    assertCanModify(existing, actor)
    await prisma.event.delete({ where: { id } })
  },

  /**
   * LEADER/FOUNDER aprova proposta de evento.
   */
  async approve(
    id: string,
    actor: Actor,
    reviewerNote?: string,
  ): Promise<AdminEventRow> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    if (!isAdminType(actor.profileType)) {
      throw new AppError('FORBIDDEN', 'Apenas lideranças aprovam.', 403)
    }
    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('Evento')
    if (existing.status !== 'PENDING_APPROVAL') {
      throw new AppError(
        'INVALID_STATE',
        'Apenas eventos pendentes podem ser aprovados.',
        409,
      )
    }
    const row = await prisma.event.update({
      where: { id },
      data: {
        status: DbContentStatus.PUBLISHED,
        reviewerNote: reviewerNote ?? null,
        reviewedById: actor.userId,
        reviewedAt: new Date(),
      },
    })
    return {
      ...toDto(row),
      id: row.id,
      status: row.status,
      createdById: row.createdById,
      reviewerNote: row.reviewerNote,
      reviewedAt: row.reviewedAt,
    }
  },

  async reject(
    id: string,
    actor: Actor,
    reviewerNote: string,
  ): Promise<AdminEventRow> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    if (!isAdminType(actor.profileType)) {
      throw new AppError('FORBIDDEN', 'Apenas lideranças revisam.', 403)
    }
    if (!reviewerNote || reviewerNote.trim().length < 3) {
      throw new ValidationError({
        reviewerNote: 'Explique o motivo (mín. 3 chars)',
      })
    }
    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('Evento')
    if (existing.status !== 'PENDING_APPROVAL') {
      throw new AppError(
        'INVALID_STATE',
        'Apenas eventos pendentes podem ser devolvidos.',
        409,
      )
    }
    const row = await prisma.event.update({
      where: { id },
      data: {
        status: DbContentStatus.REJECTED,
        reviewerNote: reviewerNote.trim(),
        reviewedById: actor.userId,
        reviewedAt: new Date(),
      },
    })
    return {
      ...toDto(row),
      id: row.id,
      status: row.status,
      createdById: row.createdById,
      reviewerNote: row.reviewerNote,
      reviewedAt: row.reviewedAt,
    }
  },

  async countPendingApproval(): Promise<number> {
    return prisma.event.count({
      where: { status: 'PENDING_APPROVAL' },
    })
  },
}
