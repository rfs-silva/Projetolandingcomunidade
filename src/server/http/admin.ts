import 'server-only'
import { auth } from '@/auth'
import { prisma } from '@/server/lib/prisma'
import { AppError } from '@/server/http/errors'

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
