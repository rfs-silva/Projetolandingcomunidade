import 'server-only'
import { prisma } from '@/server/lib/prisma'

export type CompanyDashboardStats = {
  events: {
    published: number
    pendingApproval: number
    rejected: number
    totalRegistrations: number
    totalAttended: number
  }
  challenges: {
    published: number
    pendingApproval: number
    rejected: number
    totalParticipations: number
    totalApproved: number
  }
  recent: {
    events: Array<{
      id: string
      number: string
      title: string
      status: 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED'
      registrations: number
      attended: number
      reviewerNote: string | null
      updatedAt: Date
    }>
    challenges: Array<{
      id: string
      number: string
      title: string
      status: 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED'
      participations: number
      approved: number
      reviewerNote: string | null
      updatedAt: Date
    }>
  }
}

export const companyDashboardService = {
  async load(userId: string): Promise<CompanyDashboardStats> {
    const [eventGroups, challengeGroups, events, challenges] =
      await Promise.all([
        prisma.event.groupBy({
          by: ['status'],
          where: { createdById: userId },
          _count: { _all: true },
        }),
        prisma.challenge.groupBy({
          by: ['status'],
          where: { createdById: userId },
          _count: { _all: true },
        }),
        prisma.event.findMany({
          where: { createdById: userId },
          orderBy: { updatedAt: 'desc' },
          take: 5,
          include: {
            registrations: {
              select: { status: true },
            },
          },
        }),
        prisma.challenge.findMany({
          where: { createdById: userId },
          orderBy: { updatedAt: 'desc' },
          take: 5,
          include: {
            participations: {
              select: { status: true },
            },
          },
        }),
      ])

    const eventCounts = {
      PUBLISHED: 0,
      PENDING_APPROVAL: 0,
      REJECTED: 0,
    } as Record<string, number>
    for (const g of eventGroups) eventCounts[g.status] = g._count._all

    const challengeCounts = {
      PUBLISHED: 0,
      PENDING_APPROVAL: 0,
      REJECTED: 0,
    } as Record<string, number>
    for (const g of challengeGroups) challengeCounts[g.status] = g._count._all

    // Totais agregados de inscritos e presenças (todos os eventos da empresa).
    const totalRegistrations = await prisma.eventRegistration.count({
      where: { event: { createdById: userId }, status: { not: 'CANCELLED' } },
    })
    const totalAttended = await prisma.eventRegistration.count({
      where: { event: { createdById: userId }, status: 'ATTENDED' },
    })
    const totalParticipations = await prisma.challengeParticipation.count({
      where: { challenge: { createdById: userId } },
    })
    const totalApproved = await prisma.challengeParticipation.count({
      where: { challenge: { createdById: userId }, status: 'APPROVED' },
    })

    return {
      events: {
        published: eventCounts.PUBLISHED ?? 0,
        pendingApproval: eventCounts.PENDING_APPROVAL ?? 0,
        rejected: eventCounts.REJECTED ?? 0,
        totalRegistrations,
        totalAttended,
      },
      challenges: {
        published: challengeCounts.PUBLISHED ?? 0,
        pendingApproval: challengeCounts.PENDING_APPROVAL ?? 0,
        rejected: challengeCounts.REJECTED ?? 0,
        totalParticipations,
        totalApproved,
      },
      recent: {
        events: events.map((e) => ({
          id: e.id,
          number: e.number,
          title: e.title,
          status: e.status,
          registrations: e.registrations.filter(
            (r) => r.status !== 'CANCELLED',
          ).length,
          attended: e.registrations.filter((r) => r.status === 'ATTENDED')
            .length,
          reviewerNote: e.reviewerNote,
          updatedAt: e.updatedAt,
        })),
        challenges: challenges.map((c) => ({
          id: c.id,
          number: c.number,
          title: c.title,
          status: c.status,
          participations: c.participations.length,
          approved: c.participations.filter((p) => p.status === 'APPROVED')
            .length,
          reviewerNote: c.reviewerNote,
          updatedAt: c.updatedAt,
        })),
      },
    }
  },
}
