import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import {
  requireDashboardSession,
  type DashboardSession,
} from '@/server/lib/dashboard-session'
import type { ProfileType } from '@/server/schemas/profile.schema'

const ADMIN_TYPES: ProfileType[] = ['LEADER', 'FOUNDER']

/**
 * Carrega a sessão do dashboard E exige que o usuário seja LEADER ou FOUNDER.
 * Redireciona para /dashboard se for membro comum (sem acesso ao admin).
 * Memoizada por request via React.cache.
 */
export const requireAdminSession = cache(
  async (callbackPath: string = '/admin'): Promise<DashboardSession> => {
    const session = await requireDashboardSession(callbackPath)
    if (!ADMIN_TYPES.includes(session.profile.type)) {
      redirect('/dashboard')
    }
    return session
  },
)

export function isAdminType(type: ProfileType): boolean {
  return ADMIN_TYPES.includes(type)
}
