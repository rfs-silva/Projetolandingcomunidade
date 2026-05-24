import 'server-only'
import { prisma } from '@/server/lib/prisma'
import {
  mentorshipApplicationSchema,
  mentorshipApplyInputSchema,
  type MentorshipApplicationDto,
} from '@/server/schemas/mentorship.schema'
import { AppError } from '@/server/http/errors'

const OPEN_STATUSES = ['SUBMITTED', 'IN_REVIEW'] as const

export const mentorshipService = {
  async getLatest(userId: string): Promise<MentorshipApplicationDto | null> {
    const row = await prisma.mentorshipApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return row ? mentorshipApplicationSchema.parse(row) : null
  },

  async apply(userId: string, raw: unknown): Promise<MentorshipApplicationDto> {
    const data = mentorshipApplyInputSchema.parse(raw)

    const existingOpen = await prisma.mentorshipApplication.findFirst({
      where: {
        userId,
        status: { in: [...OPEN_STATUSES] },
      },
    })
    if (existingOpen) {
      throw new AppError(
        'APPLICATION_OPEN',
        'Você já tem uma candidatura em aberto. Acompanhe o status abaixo.',
        409,
      )
    }

    const row = await prisma.mentorshipApplication.create({
      data: {
        userId,
        goal: data.goal,
        availability: data.availability,
        stack: data.stack,
      },
    })
    return mentorshipApplicationSchema.parse(row)
  },
}
