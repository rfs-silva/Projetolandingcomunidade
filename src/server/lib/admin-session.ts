import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import {
  requireDashboardSession,
  type DashboardSession,
} from '@/server/lib/dashboard-session'
import type { ProfileType } from '@/server/schemas/profile.schema'

const ADMIN_TYPES: ProfileType[] = ['LEADER', 'FOUNDER']
const CONTENT_CREATOR_TYPES: ProfileType[] = ['LEADER', 'FOUNDER', 'COMPANY']

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

/**
 * Permite acesso a quem cria conteúdo: LEADER, FOUNDER ou COMPANY.
 * Usado nas páginas de gestão de eventos e desafios — empresas podem
 * criar suas próprias propostas, lideranças podem moderar tudo.
 */
export const requireContentCreatorSession = cache(
  async (callbackPath: string = '/admin'): Promise<DashboardSession> => {
    const session = await requireDashboardSession(callbackPath)
    if (!CONTENT_CREATOR_TYPES.includes(session.profile.type)) {
      redirect('/dashboard')
    }
    return session
  },
)

export function isAdminType(type: ProfileType): boolean {
  return ADMIN_TYPES.includes(type)
}

export function isContentCreatorType(type: ProfileType): boolean {
  return CONTENT_CREATOR_TYPES.includes(type)
}
