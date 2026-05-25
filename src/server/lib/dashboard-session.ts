import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { profileService } from '@/server/services/profile.service'
import type { ProfileDto } from '@/server/schemas/profile.schema'

export type DashboardSession = {
  userId: string
  image: string | null | undefined
  githubUsername: string
  profile: ProfileDto
}

/**
 * Carrega a sessão + perfil do usuário autenticado, redirecionando para
 * /login se não houver sessão e para /onboarding se faltar perfil/termos.
 *
 * Memoizada por request via React.cache: layout e page que chamam dentro
 * do mesmo render compartilham o resultado sem nova query no banco.
 */
export const requireDashboardSession = cache(
  async (callbackPath: string = '/dashboard'): Promise<DashboardSession> => {
    const session = await auth()
    if (!session?.user?.id) {
      redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`)
    }

    const onboarded = await profileService.hasCompletedOnboarding(session.user.id)
    if (!onboarded) redirect('/onboarding')

    const profile = await profileService.getDtoByUserId(session.user.id)

    return {
      userId: session.user.id,
      image: session.user.image,
      githubUsername: session.user.githubUsername ?? session.user.id,
      profile,
    }
  },
)
