import 'server-only'
import { EventType as DbEventType, type Event as DbEvent } from '@prisma/client'
import { prisma } from '@/server/lib/prisma'
import type { EventDto, EventType } from '@/server/schemas/event.schema'

function normalize(num: string): string {
  if (num.startsWith('#')) return num
  return `#${num.padStart(2, '0')}`
}

function toDto(row: DbEvent): EventDto {
  return {
    number: row.number,
    title: row.title,
    description: row.description,
    dateFull: row.dateFull,
    dateShort: row.dateShort,
    type: row.type === DbEventType.REMOTO ? 'Remoto' : 'Presencial',
    visibility: row.visibility,
    imageIndex: row.imageIndex,
  }
}

function toDbType(type: EventType): DbEventType {
  return type === 'Remoto' ? DbEventType.REMOTO : DbEventType.PRESENCIAL
}

export const eventsRepository = {
  async list({
    type,
    includeMembers = false,
  }: { type?: EventType; includeMembers?: boolean } = {}): Promise<EventDto[]> {
    const rows = await prisma.event.findMany({
      where: {
        ...(type ? { type: toDbType(type) } : {}),
        ...(includeMembers ? {} : { visibility: 'PUBLIC' }),
      },
      orderBy: { number: 'asc' },
    })
    return rows.map(toDto)
  },

  async findByNumber(num: string, includeMembers = false): Promise<EventDto | null> {
    const row = await prisma.event.findUnique({
      where: { number: normalize(num) },
    })
    if (!row) return null
    if (!includeMembers && row.visibility !== 'PUBLIC') return null
    return toDto(row)
  },
}
