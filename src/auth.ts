import NextAuth, { type DefaultSession } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import { prisma } from '@/server/lib/prisma'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      githubUsername: string
    } & DefaultSession['user']
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ account, profile }) {
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
          ;(token as { githubUsername?: string }).githubUsername =
            dbUser.githubUsername
          if (dbUser.avatarUrl) token.picture = dbUser.avatarUrl
        }
      }
      return token
    },

    async session({ session, token }) {
      const t = token as { userId?: string; githubUsername?: string }
      if (t.userId) {
        session.user.id = t.userId
        if (!session.user.image) {
          const dbUser = await prisma.user.findUnique({
            where: { id: t.userId },
            select: { avatarUrl: true, githubUsername: true },
          })
          if (dbUser?.avatarUrl) session.user.image = dbUser.avatarUrl
          if (dbUser?.githubUsername && !t.githubUsername) {
            session.user.githubUsername = dbUser.githubUsername
          }
        }
      }
      if (t.githubUsername) session.user.githubUsername = t.githubUsername
      return session
    },
  },
})
