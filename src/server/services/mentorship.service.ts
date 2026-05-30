import 'server-only'
import {
  ApplicationStatus as DbStatus,
  MentorshipKind as DbKind,
} from '@prisma/client'
import { prisma } from '@/server/lib/prisma'
import {
  mentorshipApplicationSchema,
  mentorshipApplyInputSchema,
  type ApplicationStatus,
  type MentorshipApplicationDto,
  type MentorshipKind,
} from '@/server/schemas/mentorship.schema'
import { AppError, NotFoundError } from '@/server/http/errors'

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

  async listAdmin(filters: {
    status?: ApplicationStatus
    kind?: MentorshipKind
  }) {
    const rows = await prisma.mentorshipApplication.findMany({
      where: {
        ...(filters.status ? { status: DbStatus[filters.status] } : {}),
        ...(filters.kind ? { kind: DbKind[filters.kind] } : {}),
      },
      include: {
        user: {
          select: {
            githubUsername: true,
            avatarUrl: true,
            profile: { select: { displayName: true, type: true } },
          },
        },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    })
    return rows.map((row) => ({
      ...mentorshipApplicationSchema.parse({
        id: row.id,
        kind: row.kind,
        goal: row.goal,
        availability: row.availability,
        stack: row.stack,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
      user: {
        githubUsername: row.user.githubUsername,
        avatarUrl: row.user.avatarUrl,
        displayName: row.user.profile?.displayName ?? row.user.githubUsername,
        type: row.user.profile?.type ?? null,
      },
    }))
  },

  async updateStatus(
    applicationId: string,
    status: ApplicationStatus,
  ): Promise<MentorshipApplicationDto> {
    const existing = await prisma.mentorshipApplication.findUnique({
      where: { id: applicationId },
    })
    if (!existing) throw new NotFoundError('Candidatura')

    const updated = await prisma.mentorshipApplication.update({
      where: { id: applicationId },
      data: { status: DbStatus[status] },
    })
    return mentorshipApplicationSchema.parse(updated)
  },

  async adminStats(): Promise<{
    total: number
    byStatus: Record<ApplicationStatus, number>
    byKind: Record<MentorshipKind, number>
    acceptedMentors: number
    acceptedMentees: number
  }> {
    const grouped = await prisma.mentorshipApplication.groupBy({
      by: ['status', 'kind'],
      _count: { _all: true },
    })

    const byStatus: Record<ApplicationStatus, number> = {
      SUBMITTED: 0,
      IN_REVIEW: 0,
      ACCEPTED: 0,
      REJECTED: 0,
    }
    const byKind: Record<MentorshipKind, number> = { MENTOR: 0, MENTEE: 0 }
    let total = 0
    let acceptedMentors = 0
    let acceptedMentees = 0
    for (const g of grouped) {
      const c = g._count._all
      total += c
      byStatus[g.status as ApplicationStatus] += c
      byKind[g.kind as MentorshipKind] += c
      if (g.status === 'ACCEPTED') {
        if (g.kind === 'MENTOR') acceptedMentors += c
        if (g.kind === 'MENTEE') acceptedMentees += c
      }
    }
    return { total, byStatus, byKind, acceptedMentors, acceptedMentees }
  },
}
