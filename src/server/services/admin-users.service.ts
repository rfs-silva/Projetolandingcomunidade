import 'server-only'
import { ProfileType as DbProfileType } from '@prisma/client'
import { prisma } from '@/server/lib/prisma'
import {
  profileTypeSchema,
  type ProfileType,
} from '@/server/schemas/profile.schema'
import { NotFoundError } from '@/server/http/errors'

export type AdminUserRow = {
  userId: string
  profileId: string
  displayName: string
  githubUsername: string
  avatarUrl: string | null
  type: ProfileType
  location: string | null
  joinedAt: Date
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
    }))
  },

  async updateType(
    userId: string,
    type: ProfileType,
  ): Promise<{ userId: string; type: ProfileType }> {
    const existing = await prisma.profile.findUnique({ where: { userId } })
    if (!existing) throw new NotFoundError('Perfil')

    await prisma.profile.update({
      where: { userId },
      data: { type: DbProfileType[type] },
    })

    return { userId, type }
  },
}
