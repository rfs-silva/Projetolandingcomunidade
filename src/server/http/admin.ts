import 'server-only'
import { auth } from '@/auth'
import { prisma } from '@/server/lib/prisma'
import { AppError } from '@/server/http/errors'
import type { ProfileType } from '@/server/schemas/profile.schema'

/**
 * Exige que a requisição venha de um usuário com perfil LEADER ou FOUNDER.
 * Retorna o userId.
 */
export async function requireAdminUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new AppError('UNAUTHORIZED', 'Não autenticado', 401)
  }
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { type: true },
  })
  if (!profile || (profile.type !== 'LEADER' && profile.type !== 'FOUNDER')) {
    throw new AppError('FORBIDDEN', 'Acesso restrito a administradores', 403)
  }
  return session.user.id
}

/**
 * Exige LEADER, FOUNDER ou COMPANY — para endpoints de criação de conteúdo
 * (eventos e desafios). Retorna o userId.
 */
export async function requireContentCreatorUserId(): Promise<string> {
  const actor = await requireContentCreatorActor()
  return actor.userId
}

/**
 * Como requireContentCreatorUserId, mas retorna também o profileType
 * pra que o service consiga aplicar checagens de ownership.
 */
export async function requireContentCreatorActor(): Promise<{
  userId: string
  profileType: ProfileType
}> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new AppError('UNAUTHORIZED', 'Não autenticado', 401)
  }
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { type: true },
  })
  if (
    !profile ||
    (profile.type !== 'LEADER' &&
      profile.type !== 'FOUNDER' &&
      profile.type !== 'COMPANY')
  ) {
    throw new AppError(
      'FORBIDDEN',
      'Acesso restrito a lideranças e empresas parceiras',
      403,
    )
  }
  return { userId: session.user.id, profileType: profile.type }
}
