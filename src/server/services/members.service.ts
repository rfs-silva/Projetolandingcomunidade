import 'server-only'
import { Prisma } from '@prisma/client'
import { prisma } from '@/server/lib/prisma'
import {
  memberSchema,
  type MemberDto,
  type MemberQuery,
} from '@/server/schemas/member.schema'

type MemberListResult = {
  members: MemberDto[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export const membersService = {
  async list(query: MemberQuery): Promise<MemberListResult> {
    const { type, tags, q, page, pageSize } = query

    const where: Prisma.ProfileWhereInput = {
      ...(type ? { type } : {}),
      ...(tags && tags.length > 0
        ? {
            tags: {
              some: { tag: { slug: { in: tags } } },
            },
          }
        : {}),
      ...(q
        ? {
            OR: [
              { displayName: { contains: q, mode: 'insensitive' } },
              { bio: { contains: q, mode: 'insensitive' } },
              { location: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    }

    const [rows, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        include: {
          user: {
            select: { githubUsername: true, avatarUrl: true },
          },
          tags: { include: { tag: true } },
        },
        orderBy: [{ type: 'asc' }, { displayName: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.profile.count({ where }),
    ])

    const members = rows.map((row) =>
      memberSchema.parse({
        id: row.id,
        displayName: row.displayName,
        type: row.type,
        bio: row.bio,
        linkedinUrl: row.linkedinUrl,
        location: row.location,
        avatarUrl: row.user.avatarUrl,
        githubUsername: row.user.githubUsername,
        tags: row.tags.map((pt) => ({
          id: pt.tag.id,
          slug: pt.tag.slug,
          label: pt.tag.label,
        })),
      }),
    )

    return {
      members,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    }
  },
}
