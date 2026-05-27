import 'server-only'
import { PrivacyEventType, Prisma } from '@prisma/client'
import { prisma } from '@/server/lib/prisma'

void Prisma

type RecordInput = {
  type: PrivacyEventType
  subject: {
    userId?: string | null
    githubId: string
    githubUsername: string
  }
  actor?: {
    userId: string
    githubId?: string | null
  }
  metadata?: Record<string, unknown>
}

export const privacyEventsService = {
  async record(input: RecordInput): Promise<void> {
    try {
      await prisma.privacyEvent.create({
        data: {
          type: input.type,
          subjectUserId: input.subject.userId ?? null,
          subjectGithubId: input.subject.githubId,
          subjectUsername: input.subject.githubUsername,
          actorUserId: input.actor?.userId ?? null,
          actorGithubId: input.actor?.githubId ?? null,
          ...(input.metadata !== undefined
            ? { metadata: input.metadata as Prisma.InputJsonValue }
            : {}),
        },
      })
    } catch (err) {
      // Falha no log não pode quebrar a operação principal.
      console.error('[privacy-events] failed to record', err)
    }
  },

  async listForUser(userId: string, limit = 50) {
    return prisma.privacyEvent.findMany({
      where: { subjectUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  },
}
