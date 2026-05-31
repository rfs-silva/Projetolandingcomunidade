import NextAuth, { type DefaultSession } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/server/lib/prisma'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      githubUsername: string
    } & DefaultSession['user']
  }
}

/**
 * Login dev por email para empresas aprovadas, ENQUANTO o magic link
 * não está pronto. Sem verificação de email, sem senha. Só funciona se
 * a empresa já foi aprovada pelo admin (User existe e Profile.type=COMPANY).
 *
 * TODO Fase 2: substituir por Auth.js Email provider (magic link).
 */
const ENABLE_DEV_COMPANY_LOGIN =
  process.env.ENABLE_DEV_COMPANY_LOGIN !== 'false'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    ...(ENABLE_DEV_COMPANY_LOGIN
      ? [
          Credentials({
            id: 'company-email',
            name: 'Empresa (login dev)',
            credentials: {
              email: { label: 'Email', type: 'email' },
            },
            async authorize(raw) {
              const email = String(raw?.email ?? '')
                .trim()
                .toLowerCase()
              if (!email) return null
              const user = await prisma.user.findUnique({
                where: { email },
                include: { profile: { select: { type: true } } },
              })
              if (!user) return null
              if (user.profile?.type !== 'COMPANY') return null
              return {
                id: user.id,
                email: user.email ?? undefined,
                name: user.profile
                  ? undefined
                  : user.githubUsername ?? undefined,
              }
            },
          }),
        ]
      : []),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ account, profile }) {
      // Credentials provider já valida na função authorize; não precisa de extra check aqui.
      if (account?.provider === 'company-email') return true
      if (account?.provider !== 'github' || !profile) return false

      const githubId = String(profile.id ?? account.providerAccountId)
      const login = (profile as { login?: string }).login
      if (!githubId || !login) return false

      await prisma.user.upsert({
        where: { githubId },
        update: {
          githubUsername: login,
          email: profile.email ?? undefined,
          avatarUrl: (profile as { avatar_url?: string }).avatar_url,
        },
        create: {
          githubId,
          githubUsername: login,
          email: profile.email ?? undefined,
          avatarUrl: (profile as { avatar_url?: string }).avatar_url,
        },
      })
      return true
    },

    // jwt roda no runtime Node (durante signIn). Aqui podemos consultar
    // Prisma livremente para popular o token com tudo que a sessão precisa.
    async jwt({ token, account, profile, user }) {
      if (user) {
        token.name = user.name ?? token.name
        token.email = user.email ?? token.email
        token.picture = user.image ?? token.picture
      }
      if (account?.provider === 'github' && profile) {
        const githubId = String(profile.id ?? account.providerAccountId)
        const dbUser = await prisma.user.findUnique({ where: { githubId } })
        if (dbUser) {
          ;(token as { userId?: string }).userId = dbUser.id
          if (dbUser.githubUsername) {
            ;(token as { githubUsername?: string }).githubUsername =
              dbUser.githubUsername
          }
          if (dbUser.avatarUrl) token.picture = dbUser.avatarUrl
        }
      }
      if (account?.provider === 'company-email' && user?.id) {
        ;(token as { userId?: string }).userId = user.id
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            avatarUrl: true,
            githubUsername: true,
            profile: { select: { displayName: true } },
          },
        })
        if (dbUser?.profile?.displayName) token.name = dbUser.profile.displayName
        if (dbUser?.avatarUrl) token.picture = dbUser.avatarUrl
        if (dbUser?.githubUsername) {
          ;(token as { githubUsername?: string }).githubUsername =
            dbUser.githubUsername
        }
      }
      return token
    },

    // session é chamada inclusive pelo middleware (edge runtime). NÃO chamar
    // Prisma aqui — popula tudo no token via jwt.
    async session({ session, token }) {
      const t = token as { userId?: string; githubUsername?: string }
      if (t.userId) session.user.id = t.userId
      if (t.githubUsername) session.user.githubUsername = t.githubUsername
      return session
    },
  },
})
