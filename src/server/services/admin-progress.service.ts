import 'server-only'
import { prisma } from '@/server/lib/prisma'
import { AppError, NotFoundError, ValidationError } from '@/server/http/errors'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type PendingSubmission = {
  id: string
  challengeNumber: string
  challengeTitle: string
  points: number
  user: {
    id: string
    displayName: string
    githubUsername: string
    avatarUrl: string | null
  }
  submissionUrl: string | null
  submissionNote: string | null
  submittedAt: Date | null
}

export type EventAttendanceRow = {
  id: string
  eventNumber: string
  eventTitle: string
  status: 'REGISTERED' | 'ATTENDED' | 'CANCELLED'
  registeredAt: Date
  attendedAt: Date | null
  user: {
    id: string
    displayName: string
    githubUsername: string
    avatarUrl: string | null
  }
}

export const adminProgressService = {
  async listPendingSubmissions(): Promise<PendingSubmission[]> {
    const rows = await prisma.challengeParticipation.findMany({
      where: { status: 'SUBMITTED' },
      include: {
        challenge: { select: { number: true, title: true, points: true } },
        user: {
          select: {
            id: true,
            githubUsername: true,
            avatarUrl: true,
            profile: { select: { displayName: true } },
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
    })
    return rows.map((r) => ({
      id: r.id,
      challengeNumber: r.challenge.number,
      challengeTitle: r.challenge.title,
      points: r.challenge.points,
      user: {
        id: r.user.id,
        displayName:
          r.user.profile?.displayName ?? r.user.githubUsername ?? 'Sem nome',
        githubUsername: r.user.githubUsername ?? 'sem-github',
        avatarUrl: r.user.avatarUrl,
      },
      submissionUrl: r.submissionUrl,
      submissionNote: r.submissionNote,
      submittedAt: r.submittedAt,
    }))
  },

  async approveSubmission(id: string, reviewerNote?: string) {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    const existing = await prisma.challengeParticipation.findUnique({
      where: { id },
    })
    if (!existing) throw new NotFoundError('Submissão')
    if (existing.status !== 'SUBMITTED') {
      throw new AppError(
        'INVALID_STATE',
        'Apenas submissões em análise podem ser aprovadas.',
        409,
      )
    }
    return prisma.challengeParticipation.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewerNote: reviewerNote ?? null,
        reviewedAt: new Date(),
      },
    })
  },

  async rejectSubmission(id: string, reviewerNote: string) {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    if (!reviewerNote || reviewerNote.trim().length < 3) {
      throw new ValidationError({
        reviewerNote: 'Explique o motivo da devolução (mín. 3 chars)',
      })
    }
    const existing = await prisma.challengeParticipation.findUnique({
      where: { id },
    })
    if (!existing) throw new NotFoundError('Submissão')
    if (existing.status !== 'SUBMITTED') {
      throw new AppError(
        'INVALID_STATE',
        'Apenas submissões em análise podem ser devolvidas.',
        409,
      )
    }
    return prisma.challengeParticipation.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewerNote: reviewerNote.trim(),
        reviewedAt: new Date(),
      },
    })
  },

  async listEventRegistrations(
    eventNumber: string,
  ): Promise<EventAttendanceRow[]> {
    const norm = eventNumber.startsWith('#')
      ? eventNumber
      : `#${eventNumber.padStart(2, '0')}`
    const event = await prisma.event.findUnique({ where: { number: norm } })
    if (!event) throw new NotFoundError('Evento')

    const rows = await prisma.eventRegistration.findMany({
      where: { eventId: event.id },
      include: {
        event: { select: { number: true, title: true } },
        user: {
          select: {
            id: true,
            githubUsername: true,
            avatarUrl: true,
            profile: { select: { displayName: true } },
          },
        },
      },
      orderBy: { registeredAt: 'asc' },
    })
    return rows.map((r) => ({
      id: r.id,
      eventNumber: r.event.number,
      eventTitle: r.event.title,
      status: r.status,
      registeredAt: r.registeredAt,
      attendedAt: r.attendedAt,
      user: {
        id: r.user.id,
        displayName:
          r.user.profile?.displayName ?? r.user.githubUsername ?? 'Sem nome',
        githubUsername: r.user.githubUsername ?? 'sem-github',
        avatarUrl: r.user.avatarUrl,
      },
    }))
  },

  async setAttendance(id: string, attended: boolean) {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    const existing = await prisma.eventRegistration.findUnique({
      where: { id },
    })
    if (!existing) throw new NotFoundError('Inscrição')
    if (attended) {
      return prisma.eventRegistration.update({
        where: { id },
        data: { status: 'ATTENDED', attendedAt: new Date() },
      })
    }
    return prisma.eventRegistration.update({
      where: { id },
      data: { status: 'REGISTERED', attendedAt: null },
    })
  },

  async countPendingSubmissions(): Promise<number> {
    return prisma.challengeParticipation.count({ where: { status: 'SUBMITTED' } })
  },

  async listChallengeParticipations(challengeNumber: string): Promise<
    Array<{
      id: string
      status: 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
      submissionUrl: string | null
      submissionNote: string | null
      reviewerNote: string | null
      startedAt: Date
      submittedAt: Date | null
      reviewedAt: Date | null
      user: {
        id: string
        displayName: string
        githubUsername: string
        avatarUrl: string | null
      }
    }>
  > {
    const norm = challengeNumber.startsWith('#')
      ? challengeNumber
      : `#${challengeNumber.padStart(2, '0')}`
    const challenge = await prisma.challenge.findUnique({
      where: { number: norm },
    })
    if (!challenge) throw new NotFoundError('Desafio')

    const rows = await prisma.challengeParticipation.findMany({
      where: { challengeId: challenge.id },
      include: {
        user: {
          select: {
            id: true,
            githubUsername: true,
            avatarUrl: true,
            profile: { select: { displayName: true } },
          },
        },
      },
      orderBy: { startedAt: 'asc' },
    })
    return rows.map((r) => ({
      id: r.id,
      status: r.status,
      submissionUrl: r.submissionUrl,
      submissionNote: r.submissionNote,
      reviewerNote: r.reviewerNote,
      startedAt: r.startedAt,
      submittedAt: r.submittedAt,
      reviewedAt: r.reviewedAt,
      user: {
        id: r.user.id,
        displayName:
          r.user.profile?.displayName ?? r.user.githubUsername ?? 'Sem nome',
        githubUsername: r.user.githubUsername ?? 'sem-github',
        avatarUrl: r.user.avatarUrl,
      },
    }))
  },
}
