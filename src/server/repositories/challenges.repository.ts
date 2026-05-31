import 'server-only'
import { prisma } from '@/server/lib/prisma'
import type { ChallengeDto } from '@/server/schemas/challenge.schema'

function normalize(num: string): string {
  if (num.startsWith('#')) return num
  return `#${num.padStart(2, '0')}`
}

type ChallengeRow = {
  number: string
  title: string
  description: string
  imageIndex: number
  visibility: 'PUBLIC' | 'MEMBERS'
  points: number
  tags: { iconName: string; label: string }[]
}

function toDto(row: ChallengeRow): ChallengeDto {
  return {
    number: row.number,
    title: row.title,
    description: row.description,
    imageIndex: row.imageIndex,
    visibility: row.visibility,
    points: row.points,
    tags: row.tags.map((t) => ({ iconName: t.iconName, label: t.label })),
  }
}

export const challengesRepository = {
  async list({
    includeMembers = false,
  }: { includeMembers?: boolean } = {}): Promise<ChallengeDto[]> {
    const rows = await prisma.challenge.findMany({
      where: {
        status: 'PUBLISHED',
        ...(includeMembers ? {} : { visibility: 'PUBLIC' }),
      },
      include: { tags: true },
      orderBy: { number: 'asc' },
    })
    return rows.map(toDto)
  },

  async findByNumber(num: string, includeMembers = false): Promise<ChallengeDto | null> {
    const row = await prisma.challenge.findUnique({
      where: { number: normalize(num) },
      include: { tags: true },
    })
    if (!row) return null
    if (row.status !== 'PUBLISHED') return null
    if (!includeMembers && row.visibility !== 'PUBLIC') return null
    return toDto(row)
  },
}
