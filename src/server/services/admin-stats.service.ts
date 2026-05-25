import 'server-only'
import { prisma } from '@/server/lib/prisma'

export type AdminStats = {
  members: number
  membersByType: Record<string, number>
  events: { total: number; members: number; public: number }
  challenges: { total: number; members: number; public: number }
  projects: { total: number; members: number; public: number }
  mentorship: {
    total: number
    pending: number
    inReview: number
    accepted: number
    rejected: number
  }
  tags: number
}

export const adminStatsService = {
  async load(): Promise<AdminStats> {
    const [
      members,
      profilesByType,
      eventsAll,
      eventsMembers,
      challengesAll,
      challengesMembers,
      projectsAll,
      projectsMembers,
      mentorshipGroups,
      tags,
    ] = await Promise.all([
      prisma.profile.count(),
      prisma.profile.groupBy({ by: ['type'], _count: { _all: true } }),
      prisma.event.count(),
      prisma.event.count({ where: { visibility: 'MEMBERS' } }),
      prisma.challenge.count(),
      prisma.challenge.count({ where: { visibility: 'MEMBERS' } }),
      prisma.userProject.count(),
      prisma.userProject.count({ where: { visibility: 'MEMBERS' } }),
      prisma.mentorshipApplication.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.tag.count(),
    ])

    const membersByType: Record<string, number> = {}
    for (const g of profilesByType) {
      membersByType[g.type] = g._count._all
    }

    const statusCount: Record<string, number> = {}
    for (const g of mentorshipGroups) {
      statusCount[g.status] = g._count._all
    }

    return {
      members,
      membersByType,
      events: {
        total: eventsAll,
        members: eventsMembers,
        public: eventsAll - eventsMembers,
      },
      challenges: {
        total: challengesAll,
        members: challengesMembers,
        public: challengesAll - challengesMembers,
      },
      projects: {
        total: projectsAll,
        members: projectsMembers,
        public: projectsAll - projectsMembers,
      },
      mentorship: {
        total:
          (statusCount.SUBMITTED ?? 0) +
          (statusCount.IN_REVIEW ?? 0) +
          (statusCount.ACCEPTED ?? 0) +
          (statusCount.REJECTED ?? 0),
        pending: statusCount.SUBMITTED ?? 0,
        inReview: statusCount.IN_REVIEW ?? 0,
        accepted: statusCount.ACCEPTED ?? 0,
        rejected: statusCount.REJECTED ?? 0,
      },
      tags,
    }
  },
}
