import 'server-only'
import { prisma } from '@/server/lib/prisma'
import { AppError, NotFoundError } from '@/server/http/errors'
import { privacyEventsService } from '@/server/services/privacy-events.service'

export const DELETE_ACCOUNT_PHRASE = 'EXCLUIR MINHA CONTA'

export type ExportPayload = {
  exportedAt: string
  schemaVersion: '1.0'
  controller: {
    name: string
    dpoContact: string
    notice: string
  }
  account: {
    id: string
    githubId: string
    githubUsername: string
    email: string | null
    avatarUrl: string | null
    acceptedTermsAt: string | null
    createdAt: string
    updatedAt: string
  }
  profile: {
    id: string
    displayName: string
    type: string
    bio: string | null
    linkedinUrl: string | null
    location: string | null
    createdAt: string
    updatedAt: string
    tags: { slug: string; label: string }[]
  } | null
  projects: Array<{
    id: string
    title: string
    description: string
    category: string
    visibility: string
    image: string | null
    demoUrl: string | null
    repoUrl: string | null
    tags: { slug: string; label: string }[]
    createdAt: string
    updatedAt: string
  }>
  mentorshipApplications: Array<{
    id: string
    kind: string
    status: string
    goal: string
    availability: string
    stack: string
    createdAt: string
    updatedAt: string
  }>
  forumThreads: Array<{
    id: string
    title: string
    body: string
    category: string
    isPinned: boolean
    isLocked: boolean
    repliesCount: number
    createdAt: string
    updatedAt: string
  }>
  forumReplies: Array<{
    id: string
    threadId: string
    threadTitle: string
    body: string
    createdAt: string
    updatedAt: string
  }>
}

export const meDataService = {
  async export(userId: string): Promise<ExportPayload> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: { include: { tags: { include: { tag: true } } } },
        projects: {
          include: { tags: { include: { tag: true } } },
          orderBy: { createdAt: 'asc' },
        },
        mentorshipApplications: { orderBy: { createdAt: 'asc' } },
        forumThreads: { orderBy: { createdAt: 'asc' } },
        forumReplies: {
          include: { thread: { select: { id: true, title: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!user) throw new NotFoundError('Usuário')

    const exportedAt = new Date()
    await privacyEventsService.record({
      type: 'DATA_EXPORTED',
      subject: {
        userId: user.id,
        githubId: user.githubId,
        githubUsername: user.githubUsername,
      },
      actor: { userId: user.id, githubId: user.githubId },
    })

    return {
      exportedAt: exportedAt.toISOString(),
      schemaVersion: '1.0',
      controller: {
        name: 'Comunidade Roraima Devs',
        dpoContact: 'privacidade@comunidaderoraima.dev',
        notice:
          'Exportação realizada conforme art. 18 II e V da LGPD. Para dúvidas, contate o DPO.',
      },
      account: {
        id: user.id,
        githubId: user.githubId,
        githubUsername: user.githubUsername,
        email: user.email,
        avatarUrl: user.avatarUrl,
        acceptedTermsAt: user.acceptedTermsAt?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      profile: user.profile
        ? {
            id: user.profile.id,
            displayName: user.profile.displayName,
            type: user.profile.type,
            bio: user.profile.bio,
            linkedinUrl: user.profile.linkedinUrl,
            location: user.profile.location,
            createdAt: user.profile.createdAt.toISOString(),
            updatedAt: user.profile.updatedAt.toISOString(),
            tags: user.profile.tags.map((pt) => ({
              slug: pt.tag.slug,
              label: pt.tag.label,
            })),
          }
        : null,
      projects: user.projects.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        visibility: p.visibility,
        image: p.image,
        demoUrl: p.demoUrl,
        repoUrl: p.repoUrl,
        tags: p.tags.map((t) => ({
          slug: t.tag.slug,
          label: t.tag.label,
        })),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      mentorshipApplications: user.mentorshipApplications.map((a) => ({
        id: a.id,
        kind: a.kind,
        status: a.status,
        goal: a.goal,
        availability: a.availability,
        stack: a.stack,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      forumThreads: user.forumThreads.map((t) => ({
        id: t.id,
        title: t.title,
        body: t.body,
        category: t.category,
        isPinned: t.isPinned,
        isLocked: t.isLocked,
        repliesCount: t.repliesCount,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      forumReplies: user.forumReplies.map((r) => ({
        id: r.id,
        threadId: r.threadId,
        threadTitle: r.thread.title,
        body: r.body,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    }
  },

  /**
   * Apaga a conta e todos os dados pessoais associados (cascade pelo schema).
   * Exige a frase de confirmação literal para evitar exclusão acidental.
   */
  async deleteAccount(
    userId: string,
    confirmation: string,
  ): Promise<{ deletedCounts: Record<string, number> }> {
    if (confirmation.trim() !== DELETE_ACCOUNT_PHRASE) {
      throw new AppError(
        'CONFIRMATION_MISMATCH',
        `Para confirmar, digite exatamente: ${DELETE_ACCOUNT_PHRASE}`,
        400,
      )
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } })
    if (!existing) throw new NotFoundError('Usuário')

    // Cascade no schema apaga Profile, ProfileTag, UserProject, UserProjectTag,
    // MentorshipApplication, ForumThread, ForumReply.
    // Coletamos contadores antes para feedback.
    const [
      projectCount,
      mentorshipCount,
      threadCount,
      replyCount,
    ] = await Promise.all([
      prisma.userProject.count({ where: { userId } }),
      prisma.mentorshipApplication.count({ where: { userId } }),
      prisma.forumThread.count({ where: { authorId: userId } }),
      prisma.forumReply.count({ where: { authorId: userId } }),
    ])

    await prisma.user.delete({ where: { id: userId } })

    // Grava o evento APÓS a exclusão. Como o índice usa subjectGithubId (não FK),
    // sobrevive ao usuário deletado e fica disponível pra comprovação.
    await privacyEventsService.record({
      type: 'ACCOUNT_DELETED',
      subject: {
        userId: null,
        githubId: existing.githubId,
        githubUsername: existing.githubUsername,
      },
      actor: { userId, githubId: existing.githubId },
      metadata: {
        deletedCounts: {
          projetos: projectCount,
          candidaturasMentoria: mentorshipCount,
          topicosForum: threadCount,
          respostasForum: replyCount,
        },
      },
    })

    return {
      deletedCounts: {
        projetos: projectCount,
        candidaturasMentoria: mentorshipCount,
        topicosForum: threadCount,
        respostasForum: replyCount,
      },
    }
  },

  summary(payload: ExportPayload) {
    return {
      hasProfile: !!payload.profile,
      tagsCount: payload.profile?.tags.length ?? 0,
      projectsCount: payload.projects.length,
      mentorshipCount: payload.mentorshipApplications.length,
      forumThreadsCount: payload.forumThreads.length,
      forumRepliesCount: payload.forumReplies.length,
    }
  },
}
