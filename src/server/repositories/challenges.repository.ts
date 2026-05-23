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
  tags: { iconName: string; label: string }[]
}

function toDto(row: ChallengeRow): ChallengeDto {
  return {
    number: row.number,
    title: row.title,
    description: row.description,
    imageIndex: row.imageIndex,
    tags: row.tags.map((t) => ({ iconName: t.iconName, label: t.label })),
  }
}

export const challengesRepository = {
  async list(): Promise<ChallengeDto[]> {
    const rows = await prisma.challenge.findMany({
      include: { tags: true },
      orderBy: { number: 'asc' },
    })
    return rows.map(toDto)
  },

  async findByNumber(num: string): Promise<ChallengeDto | null> {
    const row = await prisma.challenge.findUnique({
      where: { number: normalize(num) },
      include: { tags: true },
    })
    return row ? toDto(row) : null
  },
}
