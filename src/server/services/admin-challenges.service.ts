import 'server-only'
import { Visibility as DbVisibility } from '@prisma/client'
import { prisma } from '@/server/lib/prisma'
import {
  challengeInputSchema,
  challengeSchema,
  type ChallengeDto,
} from '@/server/schemas/challenge.schema'
import { AppError, NotFoundError, ValidationError } from '@/server/http/errors'

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

export type AdminChallengeRow = ChallengeDto & { id: string }

export const adminChallengesService = {
  async list(): Promise<AdminChallengeRow[]> {
    const rows = await prisma.challenge.findMany({
      include: { tags: true },
      orderBy: { number: 'asc' },
    })
    return rows.map((row) => ({ ...toDto(row), id: row.id }))
  },

  async getById(id: string): Promise<AdminChallengeRow> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    const row = await prisma.challenge.findUnique({
      where: { id },
      include: { tags: true },
    })
    if (!row) throw new NotFoundError('Desafio')
    return { ...toDto(row), id: row.id }
  },

  async create(raw: unknown): Promise<AdminChallengeRow> {
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

    const created = await prisma.$transaction(async (tx) => {
      const challenge = await tx.challenge.create({
        data: {
          number,
          title: data.title,
          description: data.description,
          imageIndex: data.imageIndex,
          visibility: DbVisibility[data.visibility],
          points: data.points,
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

    return this.getById(created.id)
  },

  async update(id: string, raw: unknown): Promise<AdminChallengeRow> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    const data = challengeInputSchema.parse(raw)
    const number = normalize(data.number)

    const existing = await prisma.challenge.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('Desafio')

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

    return this.getById(id)
  },

  async remove(id: string): Promise<void> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    const existing = await prisma.challenge.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('Desafio')
    await prisma.challenge.delete({ where: { id } })
  },
}
