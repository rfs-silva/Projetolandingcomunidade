import 'server-only'
import { prisma } from '@/server/lib/prisma'
import { onboardingSchema, type OnboardingInput } from '@/server/schemas/profile.schema'
import { NotFoundError } from '@/server/http/errors'

export const profileService = {
  async getByUserId(userId: string) {
    return prisma.profile.findUnique({ where: { userId } })
  },

  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { acceptedTermsAt: true, profile: { select: { id: true } } },
    })
    return !!user?.acceptedTermsAt && !!user.profile
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
