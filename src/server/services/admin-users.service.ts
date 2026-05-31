import 'server-only'
import { ProfileType as DbProfileType } from '@prisma/client'
import { prisma } from '@/server/lib/prisma'
import {
  profileTypeSchema,
  type ProfileType,
} from '@/server/schemas/profile.schema'
import { NotFoundError } from '@/server/http/errors'
import { privacyEventsService } from '@/server/services/privacy-events.service'

export type AdminUserRow = {
  userId: string
  profileId: string
  displayName: string
  githubUsername: string | null
  avatarUrl: string | null
  type: ProfileType
  location: string | null
  joinedAt: Date
  featuredAsLeader: boolean
  leaderRole: string | null
}

export const adminUsersService = {
  async list({ type }: { type?: ProfileType } = {}): Promise<AdminUserRow[]> {
    const rows = await prisma.profile.findMany({
      where: type ? { type: DbProfileType[type] } : undefined,
      include: {
        user: {
          select: {
            githubUsername: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: [{ type: 'asc' }, { displayName: 'asc' }],
    })
    return rows.map((row) => ({
      userId: row.userId,
      profileId: row.id,
      displayName: row.displayName,
      githubUsername: row.user.githubUsername,
      avatarUrl: row.user.avatarUrl,
      type: profileTypeSchema.parse(row.type),
      location: row.location,
      joinedAt: row.user.createdAt,
      featuredAsLeader: row.featuredAsLeader,
      leaderRole: row.leaderRole,
    }))
  },

  async updateFeaturedLeader(
    userId: string,
    input: { featured: boolean; role?: string | null },
  ): Promise<{
    userId: string
    featuredAsLeader: boolean
    leaderRole: string | null
  }> {
    const existing = await prisma.profile.findUnique({ where: { userId } })
    if (!existing) throw new NotFoundError('Perfil')

    const trimmed = (input.role ?? '').trim()
    const role = input.featured ? (trimmed.length > 0 ? trimmed : null) : null

    const updated = await prisma.profile.update({
      where: { userId },
      data: {
        featuredAsLeader: input.featured,
        leaderRole: role,
      },
    })

    return {
      userId: updated.userId,
      featuredAsLeader: updated.featuredAsLeader,
      leaderRole: updated.leaderRole,
    }
  },

  async updateType(
    userId: string,
    type: ProfileType,
    actor?: { userId: string },
  ): Promise<{ userId: string; type: ProfileType }> {
    const existing = await prisma.profile.findUnique({
      where: { userId },
      include: { user: { select: { githubId: true, githubUsername: true } } },
    })
    if (!existing) throw new NotFoundError('Perfil')

    const previousType = existing.type as ProfileType

    await prisma.profile.update({
      where: { userId },
      data: { type: DbProfileType[type] },
    })

    if (previousType !== type) {
      let actorGithubId: string | null = null
      if (actor?.userId) {
        const actorUser = await prisma.user.findUnique({
          where: { id: actor.userId },
          select: { githubId: true },
        })
        actorGithubId = actorUser?.githubId ?? null
      }
      await privacyEventsService.record({
        type: 'PROFILE_TYPE_CHANGED',
        subject: {
          userId,
          githubId: existing.user.githubId,
          githubUsername: existing.user.githubUsername,
        },
        actor: actor
          ? { userId: actor.userId, githubId: actorGithubId }
          : undefined,
        metadata: { from: previousType, to: type },
      })
    }

    return { userId, type }
  },
}
