import 'server-only'
import {
  ChallengeParticipationStatus as DbChallengeStatus,
  EventRegistrationStatus as DbEventStatus,
  Prisma,
} from '@prisma/client'
import { prisma } from '@/server/lib/prisma'
import {
  challengeParticipationSchema,
  eventRegistrationSchema,
  submitChallengeSchema,
  type ChallengeParticipationDto,
  type EventRegistrationDto,
} from '@/server/schemas/progress.schema'
import { AppError, NotFoundError } from '@/server/http/errors'

void Prisma

function normalizeNumber(num: string): string {
  if (num.startsWith('#')) return num
  return `#${num.padStart(2, '0')}`
}

function toChallengeDto(row: {
  id: string
  challengeId: string
  status: DbChallengeStatus
  submissionUrl: string | null
  submissionNote: string | null
  reviewerNote: string | null
  startedAt: Date
  submittedAt: Date | null
  reviewedAt: Date | null
  challenge: { number: string; title: string; points: number }
}): ChallengeParticipationDto {
  return challengeParticipationSchema.parse({
    id: row.id,
    challengeId: row.challengeId,
    challengeNumber: row.challenge.number,
    challengeTitle: row.challenge.title,
    status: row.status,
    submissionUrl: row.submissionUrl,
    submissionNote: row.submissionNote,
    reviewerNote: row.reviewerNote,
    startedAt: row.startedAt,
    submittedAt: row.submittedAt,
    reviewedAt: row.reviewedAt,
    points: row.challenge.points,
  })
}

function toEventDto(row: {
  id: string
  eventId: string
  status: DbEventStatus
  registeredAt: Date
  attendedAt: Date | null
  cancelledAt: Date | null
  event: { number: string; title: string; points: number }
}): EventRegistrationDto {
  return eventRegistrationSchema.parse({
    id: row.id,
    eventId: row.eventId,
    eventNumber: row.event.number,
    eventTitle: row.event.title,
    status: row.status,
    registeredAt: row.registeredAt,
    attendedAt: row.attendedAt,
    cancelledAt: row.cancelledAt,
    points: row.event.points,
  })
}

export const progressService = {
  // ------------------------------ Desafios ------------------------------
  async startChallenge(
    userId: string,
    challengeNumber: string,
  ): Promise<ChallengeParticipationDto> {
    const challenge = await prisma.challenge.findUnique({
      where: { number: normalizeNumber(challengeNumber) },
    })
    if (!challenge) throw new NotFoundError('Desafio')

    const existing = await prisma.challengeParticipation.findUnique({
      where: { userId_challengeId: { userId, challengeId: challenge.id } },
      include: { challenge: { select: { number: true, title: true, points: true } } },
    })
    if (existing) {
      return toChallengeDto({ ...existing, challenge: existing.challenge })
    }

    const created = await prisma.challengeParticipation.create({
      data: { userId, challengeId: challenge.id },
      include: { challenge: { select: { number: true, title: true, points: true } } },
    })
    return toChallengeDto(created)
  },

  async submitChallenge(
    userId: string,
    challengeNumber: string,
    raw: unknown,
  ): Promise<ChallengeParticipationDto> {
    const data = submitChallengeSchema.parse(raw)
    const challenge = await prisma.challenge.findUnique({
      where: { number: normalizeNumber(challengeNumber) },
    })
    if (!challenge) throw new NotFoundError('Desafio')

    const participation = await prisma.challengeParticipation.findUnique({
      where: { userId_challengeId: { userId, challengeId: challenge.id } },
    })
    if (!participation) {
      throw new AppError(
        'NOT_STARTED',
        'Inicie o desafio antes de submeter.',
        409,
      )
    }
    if (participation.status === 'APPROVED') {
      throw new AppError(
        'ALREADY_APPROVED',
        'Esta submissão já foi aprovada.',
        409,
      )
    }

    const updated = await prisma.challengeParticipation.update({
      where: { id: participation.id },
      data: {
        status: 'SUBMITTED',
        submissionUrl: data.submissionUrl,
        submissionNote: data.submissionNote,
        submittedAt: new Date(),
      },
      include: { challenge: { select: { number: true, title: true, points: true } } },
    })
    return toChallengeDto(updated)
  },

  async myChallengeParticipation(
    userId: string,
    challengeNumber: string,
  ): Promise<ChallengeParticipationDto | null> {
    const challenge = await prisma.challenge.findUnique({
      where: { number: normalizeNumber(challengeNumber) },
    })
    if (!challenge) return null

    const row = await prisma.challengeParticipation.findUnique({
      where: { userId_challengeId: { userId, challengeId: challenge.id } },
      include: { challenge: { select: { number: true, title: true, points: true } } },
    })
    return row ? toChallengeDto(row) : null
  },

  async listMyChallenges(userId: string): Promise<ChallengeParticipationDto[]> {
    const rows = await prisma.challengeParticipation.findMany({
      where: { userId },
      include: { challenge: { select: { number: true, title: true, points: true } } },
      orderBy: { updatedAt: 'desc' },
    })
    return rows.map(toChallengeDto)
  },

  // ------------------------------ Eventos -------------------------------
  async registerEvent(
    userId: string,
    eventNumber: string,
  ): Promise<EventRegistrationDto> {
    const event = await prisma.event.findUnique({
      where: { number: normalizeNumber(eventNumber) },
    })
    if (!event) throw new NotFoundError('Evento')

    const existing = await prisma.eventRegistration.findUnique({
      where: { userId_eventId: { userId, eventId: event.id } },
      include: { event: { select: { number: true, title: true, points: true } } },
    })
    if (existing) {
      // Se estava cancelado, reativa
      if (existing.status === 'CANCELLED') {
        const reactivated = await prisma.eventRegistration.update({
          where: { id: existing.id },
          data: {
            status: 'REGISTERED',
            registeredAt: new Date(),
            cancelledAt: null,
          },
          include: { event: { select: { number: true, title: true, points: true } } },
        })
        return toEventDto(reactivated)
      }
      return toEventDto(existing)
    }

    const created = await prisma.eventRegistration.create({
      data: { userId, eventId: event.id },
      include: { event: { select: { number: true, title: true, points: true } } },
    })
    return toEventDto(created)
  },

  async cancelEventRegistration(
    userId: string,
    eventNumber: string,
  ): Promise<EventRegistrationDto> {
    const event = await prisma.event.findUnique({
      where: { number: normalizeNumber(eventNumber) },
    })
    if (!event) throw new NotFoundError('Evento')

    const registration = await prisma.eventRegistration.findUnique({
      where: { userId_eventId: { userId, eventId: event.id } },
    })
    if (!registration) throw new NotFoundError('Inscrição')

    if (registration.status === 'ATTENDED') {
      throw new AppError(
        'CANNOT_CANCEL',
        'Não é possível cancelar uma presença já confirmada.',
        409,
      )
    }

    const updated = await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
      include: { event: { select: { number: true, title: true, points: true } } },
    })
    return toEventDto(updated)
  },

  async myEventRegistration(
    userId: string,
    eventNumber: string,
  ): Promise<EventRegistrationDto | null> {
    const event = await prisma.event.findUnique({
      where: { number: normalizeNumber(eventNumber) },
    })
    if (!event) return null

    const row = await prisma.eventRegistration.findUnique({
      where: { userId_eventId: { userId, eventId: event.id } },
      include: { event: { select: { number: true, title: true, points: true } } },
    })
    return row ? toEventDto(row) : null
  },

  async listMyEvents(userId: string): Promise<EventRegistrationDto[]> {
    const rows = await prisma.eventRegistration.findMany({
      where: { userId, status: { not: 'CANCELLED' } },
      include: { event: { select: { number: true, title: true, points: true } } },
      orderBy: { registeredAt: 'desc' },
    })
    return rows.map(toEventDto)
  },

  // ------------------------------ Stats / ranking ------------------------------
  async myStats(userId: string): Promise<{
    points: number
    challengesApproved: number
    challengesInProgress: number
    challengesSubmitted: number
    eventsAttended: number
    eventsRegistered: number
  }> {
    const [approved, inProgress, submitted, attended, registered] =
      await Promise.all([
        prisma.challengeParticipation.findMany({
          where: { userId, status: 'APPROVED' },
          include: { challenge: { select: { points: true } } },
        }),
        prisma.challengeParticipation.count({
          where: { userId, status: 'IN_PROGRESS' },
        }),
        prisma.challengeParticipation.count({
          where: { userId, status: 'SUBMITTED' },
        }),
        prisma.eventRegistration.findMany({
          where: { userId, status: 'ATTENDED' },
          include: { event: { select: { points: true } } },
        }),
        prisma.eventRegistration.count({
          where: { userId, status: 'REGISTERED' },
        }),
      ])

    const challengePoints = approved.reduce(
      (sum, p) => sum + p.challenge.points,
      0,
    )
    const eventPoints = attended.reduce((sum, r) => sum + r.event.points, 0)

    return {
      points: challengePoints + eventPoints,
      challengesApproved: approved.length,
      challengesInProgress: inProgress,
      challengesSubmitted: submitted,
      eventsAttended: attended.length,
      eventsRegistered: registered,
    }
  },

  /**
   * Ranking público: top N por pontos (desafios aprovados + eventos com presença).
   * Não expõe email; usa displayName do perfil quando existir, senão githubUsername.
   */
  async ranking(limit = 10): Promise<
    Array<{
      rank: number
      userId: string
      displayName: string
      githubUsername: string
      avatarUrl: string | null
      points: number
      challengesApproved: number
      eventsAttended: number
    }>
  > {
    const safeLimit = Math.min(Math.max(limit, 1), 50)

    const [approvedRows, attendedRows] = await Promise.all([
      prisma.challengeParticipation.findMany({
        where: { status: 'APPROVED' },
        include: { challenge: { select: { points: true } } },
      }),
      prisma.eventRegistration.findMany({
        where: { status: 'ATTENDED' },
        include: { event: { select: { points: true } } },
      }),
    ])

    type Agg = {
      points: number
      challengesApproved: number
      eventsAttended: number
    }
    const byUser = new Map<string, Agg>()
    for (const row of approvedRows) {
      const cur = byUser.get(row.userId) ?? {
        points: 0,
        challengesApproved: 0,
        eventsAttended: 0,
      }
      cur.points += row.challenge.points
      cur.challengesApproved += 1
      byUser.set(row.userId, cur)
    }
    for (const row of attendedRows) {
      const cur = byUser.get(row.userId) ?? {
        points: 0,
        challengesApproved: 0,
        eventsAttended: 0,
      }
      cur.points += row.event.points
      cur.eventsAttended += 1
      byUser.set(row.userId, cur)
    }

    const userIds = Array.from(byUser.keys())
    if (userIds.length === 0) return []

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        githubUsername: true,
        avatarUrl: true,
        profile: { select: { displayName: true } },
      },
    })

    const merged = users
      .map((u) => {
        const agg = byUser.get(u.id)!
        return {
          userId: u.id,
          displayName:
            u.profile?.displayName ?? u.githubUsername ?? 'Sem nome',
          githubUsername: u.githubUsername ?? 'sem-github',
          avatarUrl: u.avatarUrl,
          ...agg,
        }
      })
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.challengesApproved !== a.challengesApproved)
          return b.challengesApproved - a.challengesApproved
        return b.eventsAttended - a.eventsAttended
      })
      .slice(0, safeLimit)
      .map((u, i) => ({ rank: i + 1, ...u }))

    return merged
  },
}
