import 'server-only'
import { prisma } from '@/server/lib/prisma'
import {
  onboardingSchema,
  profileSchema,
  profileUpdateSchema,
  type OnboardingInput,
  type ProfileDto,
} from '@/server/schemas/profile.schema'
import { AppError, NotFoundError } from '@/server/http/errors'

const MAX_PROFILE_TAGS = 10

export const profileService = {
  async getByUserId(userId: string) {
    return prisma.profile.findUnique({ where: { userId } })
  },

  async getDtoByUserId(userId: string): Promise<ProfileDto> {
    const row = await prisma.profile.findUnique({
      where: { userId },
      include: { tags: { include: { tag: true } } },
    })
    if (!row) throw new NotFoundError('Perfil')
    return profileSchema.parse({
      id: row.id,
      displayName: row.displayName,
      bio: row.bio,
      linkedinUrl: row.linkedinUrl,
      type: row.type,
      location: row.location,
      tags: row.tags.map((pt) => ({
        id: pt.tag.id,
        slug: pt.tag.slug,
        label: pt.tag.label,
      })),
    })
  },

  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { acceptedTermsAt: true, profile: { select: { id: true } } },
    })
    return !!user?.acceptedTermsAt && !!user.profile
  },

  async addTag(userId: string, tagId: string): Promise<ProfileDto> {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { id: true, _count: { select: { tags: true } } },
    })
    if (!profile) throw new NotFoundError('Perfil')

    if (profile._count.tags >= MAX_PROFILE_TAGS) {
      throw new AppError(
        'TAG_LIMIT_REACHED',
        `Limite de ${MAX_PROFILE_TAGS} tags atingido`,
        409,
      )
    }

    const tag = await prisma.tag.findUnique({ where: { id: tagId } })
    if (!tag) throw new NotFoundError('Tag')

    await prisma.profileTag.upsert({
      where: { profileId_tagId: { profileId: profile.id, tagId } },
      create: { profileId: profile.id, tagId },
      update: {},
    })

    return this.getDtoByUserId(userId)
  },

  async removeTag(userId: string, tagId: string): Promise<ProfileDto> {
    const profile = await prisma.profile.findUnique({ where: { userId } })
    if (!profile) throw new NotFoundError('Perfil')

    await prisma.profileTag.deleteMany({
      where: { profileId: profile.id, tagId },
    })

    return this.getDtoByUserId(userId)
  },

  async update(userId: string, raw: unknown): Promise<ProfileDto> {
    const data = profileUpdateSchema.parse(raw)
    const existing = await prisma.profile.findUnique({ where: { userId } })
    if (!existing) throw new NotFoundError('Perfil')

    await prisma.profile.update({
      where: { userId },
      data: {
        displayName: data.displayName,
        bio: data.bio,
        linkedinUrl: data.linkedinUrl,
        location: data.location,
        type: data.type,
      },
    })

    return this.getDtoByUserId(userId)
  },

  async completeOnboarding(userId: string, raw: unknown) {
    const data: OnboardingInput = onboardingSchema.parse(raw)

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundError('Usuário')

    return prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { acceptedTermsAt: new Date() },
      })

      return tx.profile.upsert({
        where: { userId },
        update: {
          displayName: data.displayName,
          type: data.type,
          linkedinUrl: data.linkedinUrl,
          bio: data.bio,
        },
        create: {
          userId,
          displayName: data.displayName,
          type: data.type,
          linkedinUrl: data.linkedinUrl,
          bio: data.bio,
        },
      })
    })
  },
}
