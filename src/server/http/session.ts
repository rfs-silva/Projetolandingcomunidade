import 'server-only'
import { auth } from '@/auth'
import { AppError } from '@/server/http/errors'

export async function requireUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new AppError('UNAUTHORIZED', 'Não autenticado', 401)
  }
  return session.user.id
}
