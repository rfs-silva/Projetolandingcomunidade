import 'server-only'
import { EventType as DbEventType, Visibility as DbVisibility } from '@prisma/client'
import { prisma } from '@/server/lib/prisma'
import {
  eventInputSchema,
  eventSchema,
  type EventDto,
} from '@/server/schemas/event.schema'
import { AppError, NotFoundError, ValidationError } from '@/server/http/errors'

function normalize(num: string): string {
  if (num.startsWith('#')) return num
  return `#${num.padStart(2, '0')}`
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function toDto(row: {
  number: string
  title: string
  description: string
  dateFull: string
  dateShort: string
  type: DbEventType
  visibility: DbVisibility
  imageIndex: number
}): EventDto {
  return eventSchema.parse({
    number: row.number,
    title: row.title,
    description: row.description,
    dateFull: row.dateFull,
    dateShort: row.dateShort,
    type: row.type === DbEventType.REMOTO ? 'Remoto' : 'Presencial',
    visibility: row.visibility,
    imageIndex: row.imageIndex,
  })
}

export type AdminEventRow = EventDto & { id: string }

export const adminEventsService = {
  async list(): Promise<AdminEventRow[]> {
    const rows = await prisma.event.findMany({
      orderBy: { number: 'asc' },
    })
    return rows.map((row) => ({ ...toDto(row), id: row.id }))
  },

  async getById(id: string): Promise<AdminEventRow> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    const row = await prisma.event.findUnique({ where: { id } })
    if (!row) throw new NotFoundError('Evento')
    return { ...toDto(row), id: row.id }
  },

  async create(raw: unknown): Promise<AdminEventRow> {
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
      },
    })
    return { ...toDto(row), id: row.id }
  },

  async update(id: string, raw: unknown): Promise<AdminEventRow> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    const data = eventInputSchema.parse(raw)
    const number = normalize(data.number)

    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('Evento')

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
      },
    })
    return { ...toDto(row), id: row.id }
  },

  async remove(id: string): Promise<void> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    const existing = await prisma.event.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('Evento')
    await prisma.event.delete({ where: { id } })
  },
}
