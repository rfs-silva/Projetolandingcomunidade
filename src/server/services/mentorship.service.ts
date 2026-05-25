import 'server-only'
import { MentorshipKind as DbKind } from '@prisma/client'
import { prisma } from '@/server/lib/prisma'
import {
  mentorshipApplicationSchema,
  mentorshipApplyInputSchema,
  type MentorshipApplicationDto,
  type MentorshipKind,
} from '@/server/schemas/mentorship.schema'
import { AppError } from '@/server/http/errors'

const OPEN_STATUSES = ['SUBMITTED', 'IN_REVIEW'] as const

export type LatestApplications = {
  mentor: MentorshipApplicationDto | null
  mentee: MentorshipApplicationDto | null
}

export const mentorshipService = {
  async getLatest(
    userId: string,
    kind: MentorshipKind,
  ): Promise<MentorshipApplicationDto | null> {
    const row = await prisma.mentorshipApplication.findFirst({
      where: { userId, kind: DbKind[kind] },
      orderBy: { createdAt: 'desc' },
    })
    return row ? mentorshipApplicationSchema.parse(row) : null
  },

  async getLatestAll(userId: string): Promise<LatestApplications> {
    const [mentor, mentee] = await Promise.all([
      this.getLatest(userId, 'MENTOR'),
      this.getLatest(userId, 'MENTEE'),
    ])
    return { mentor, mentee }
  },

  async apply(userId: string, raw: unknown): Promise<MentorshipApplicationDto> {
    const data = mentorshipApplyInputSchema.parse(raw)

    const existingOpen = await prisma.mentorshipApplication.findFirst({
      where: {
        userId,
        kind: DbKind[data.kind],
        status: { in: [...OPEN_STATUSES] },
      },
    })
    if (existingOpen) {
      throw new AppError(
        'APPLICATION_OPEN',
        `Você já tem uma candidatura ${data.kind === 'MENTOR' ? 'como mentor' : 'como mentorado'} em aberto.`,
        409,
      )
    }

    const row = await prisma.mentorshipApplication.create({
      data: {
        userId,
        kind: DbKind[data.kind],
        goal: data.goal,
        availability: data.availability,
        stack: data.stack,
      },
    })
    return mentorshipApplicationSchema.parse(row)
  },
}
