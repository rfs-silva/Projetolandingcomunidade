import 'server-only'
import { prisma } from '@/server/lib/prisma'
import {
  leaderSchema,
  type LeaderDto,
} from '@/server/schemas/leader.schema'

const TYPE_FALLBACK_ROLE: Record<string, string> = {
  FOUNDER: 'Fundador',
  LEADER: 'Liderança',
  COMPANY: 'Empresa parceira',
  MEMBER: 'Membro',
}

export const leadersService = {
  /**
   * Lideranças públicas exibidas na landing. Persistido no banco via
   * Profile.featuredAsLeader; o cargo exibido vem de Profile.leaderRole
   * (fallback para o ProfileType quando vazio).
   */
  async list(): Promise<LeaderDto[]> {
    const profiles = await prisma.profile.findMany({
      where: { featuredAsLeader: true },
      include: {
        user: {
          select: { githubUsername: true, avatarUrl: true },
        },
      },
      orderBy: [{ type: 'asc' }, { displayName: 'asc' }],
    })

    return profiles.map((p) =>
      leaderSchema.parse({
        name: p.displayName,
        role: p.leaderRole ?? TYPE_FALLBACK_ROLE[p.type] ?? 'Liderança',
        bio: p.bio ?? 'Membro destacado da comunidade.',
        githubUsername: p.user.githubUsername,
        linkedinUrl: p.linkedinUrl,
        avatarUrl: p.user.avatarUrl,
      }),
    )
  },
}
