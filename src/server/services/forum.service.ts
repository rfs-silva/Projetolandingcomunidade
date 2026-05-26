import 'server-only'
import { ForumCategory as DbForumCategory, Prisma } from '@prisma/client'
import { prisma } from '@/server/lib/prisma'
import {
  forumCategorySchema,
  replyInputSchema,
  replySchema,
  threadAdminPatchSchema,
  threadDetailSchema,
  threadInputSchema,
  threadSummarySchema,
  type ReplyDto,
  type ThreadDetailDto,
  type ThreadQuery,
  type ThreadSummaryDto,
} from '@/server/schemas/forum.schema'
import {
  AppError,
  NotFoundError,
  ValidationError,
} from '@/server/http/errors'
import { isAdminType } from '@/server/lib/admin-session'
import type { ProfileType } from '@/server/schemas/profile.schema'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const AUTHOR_INCLUDE = {
  select: {
    id: true,
    githubUsername: true,
    avatarUrl: true,
    profile: { select: { displayName: true } },
  },
} as const

function authorToDto(user: {
  id: string
  githubUsername: string
  avatarUrl: string | null
  profile: { displayName: string } | null
}) {
  return {
    id: user.id,
    displayName: user.profile?.displayName ?? user.githubUsername,
    githubUsername: user.githubUsername,
    avatarUrl: user.avatarUrl,
  }
}

async function loadActorType(
  userId: string,
): Promise<ProfileType | null> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { type: true },
  })
  return (profile?.type as ProfileType) ?? null
}

function ensureOwnerOrAdmin(
  authorId: string,
  actorId: string,
  actorType: ProfileType | null,
) {
  if (authorId === actorId) return
  if (actorType && isAdminType(actorType)) return
  throw new AppError('FORBIDDEN', 'Você não pode editar esse conteúdo', 403)
}

export type ThreadListResult = {
  threads: ThreadSummaryDto[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export const forumService = {
  async list(query: ThreadQuery): Promise<ThreadListResult> {
    const { category, q, page, pageSize } = query
    const where: Prisma.ForumThreadWhereInput = {
      ...(category ? { category: DbForumCategory[category] } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { body: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    }

    const [rows, total] = await Promise.all([
      prisma.forumThread.findMany({
        where,
        include: { author: AUTHOR_INCLUDE },
        orderBy: [
          { isPinned: 'desc' },
          { lastReplyAt: { sort: 'desc', nulls: 'last' } },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.forumThread.count({ where }),
    ])

    const threads = rows.map((row) =>
      threadSummarySchema.parse({
        id: row.id,
        title: row.title,
        category: row.category,
        isPinned: row.isPinned,
        isLocked: row.isLocked,
        repliesCount: row.repliesCount,
        lastReplyAt: row.lastReplyAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        author: authorToDto(row.author),
      }),
    )

    return {
      threads,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    }
  },

  async getById(
    id: string,
  ): Promise<{ thread: ThreadDetailDto; replies: ReplyDto[] }> {
    if (!UUID_RE.test(id)) throw new ValidationError({ id: 'ID inválido' })
    const row = await prisma.forumThread.findUnique({
      where: { id },
      include: {
        author: AUTHOR_INCLUDE,
        replies: {
          include: { author: AUTHOR_INCLUDE },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    if (!row) throw new NotFoundError('Tópico')

    return {
      thread: threadDetailSchema.parse({
        id: row.id,
        title: row.title,
        body: row.body,
        category: row.category,
        isPinned: row.isPinned,
        isLocked: row.isLocked,
        repliesCount: row.repliesCount,
        lastReplyAt: row.lastReplyAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        author: authorToDto(row.author),
      }),
      replies: row.replies.map((r) =>
        replySchema.parse({
          id: r.id,
          body: r.body,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          author: authorToDto(r.author),
        }),
      ),
    }
  },

  async createThread(userId: string, raw: unknown): Promise<ThreadDetailDto> {
    const data = threadInputSchema.parse(raw)

    if (data.category === 'ANUNCIOS') {
      const type = await loadActorType(userId)
      if (!type || !isAdminType(type)) {
        throw new AppError(
          'FORBIDDEN',
          'Apenas lideranças podem postar em Anúncios.',
          403,
        )
      }
    }

    const thread = await prisma.forumThread.create({
      data: {
        authorId: userId,
        title: data.title,
        body: data.body,
        category: DbForumCategory[data.category],
      },
      include: { author: AUTHOR_INCLUDE },
    })

    return threadDetailSchema.parse({
      id: thread.id,
      title: thread.title,
      body: thread.body,
      category: thread.category,
      isPinned: thread.isPinned,
      isLocked: thread.isLocked,
      repliesCount: thread.repliesCount,
      lastReplyAt: thread.lastReplyAt,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      author: authorToDto(thread.author),
    })
  },

  async updateThread(
    userId: string,
    threadId: string,
    raw: unknown,
  ): Promise<ThreadDetailDto> {
    if (!UUID_RE.test(threadId)) throw new ValidationError({ id: 'ID inválido' })
    const data = threadInputSchema.parse(raw)

    const existing = await prisma.forumThread.findUnique({
      where: { id: threadId },
    })
    if (!existing) throw new NotFoundError('Tópico')

    const actorType = await loadActorType(userId)
    ensureOwnerOrAdmin(existing.authorId, userId, actorType)

    if (
      data.category === 'ANUNCIOS' &&
      existing.category !== 'ANUNCIOS' &&
      !(actorType && isAdminType(actorType))
    ) {
      throw new AppError(
        'FORBIDDEN',
        'Apenas lideranças podem mover para Anúncios.',
        403,
      )
    }

    await prisma.forumThread.update({
      where: { id: threadId },
      data: {
        title: data.title,
        body: data.body,
        category: DbForumCategory[data.category],
      },
    })

    const result = await this.getById(threadId)
    return result.thread
  },

  async deleteThread(userId: string, threadId: string): Promise<void> {
    if (!UUID_RE.test(threadId)) throw new ValidationError({ id: 'ID inválido' })
    const existing = await prisma.forumThread.findUnique({
      where: { id: threadId },
    })
    if (!existing) throw new NotFoundError('Tópico')

    const actorType = await loadActorType(userId)
    ensureOwnerOrAdmin(existing.authorId, userId, actorType)

    await prisma.forumThread.delete({ where: { id: threadId } })
  },

  async adminPatchThread(
    threadId: string,
    raw: unknown,
  ): Promise<ThreadDetailDto> {
    if (!UUID_RE.test(threadId)) throw new ValidationError({ id: 'ID inválido' })
    const data = threadAdminPatchSchema.parse(raw)

    const existing = await prisma.forumThread.findUnique({
      where: { id: threadId },
    })
    if (!existing) throw new NotFoundError('Tópico')

    await prisma.forumThread.update({
      where: { id: threadId },
      data: {
        ...(data.isPinned !== undefined ? { isPinned: data.isPinned } : {}),
        ...(data.isLocked !== undefined ? { isLocked: data.isLocked } : {}),
      },
    })

    const result = await this.getById(threadId)
    return result.thread
  },

  async createReply(
    userId: string,
    threadId: string,
    raw: unknown,
  ): Promise<ReplyDto> {
    if (!UUID_RE.test(threadId)) throw new ValidationError({ id: 'ID inválido' })
    const data = replyInputSchema.parse(raw)

    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
      select: { id: true, isLocked: true },
    })
    if (!thread) throw new NotFoundError('Tópico')
    if (thread.isLocked) {
      throw new AppError('LOCKED', 'Esse tópico está fechado para respostas.', 409)
    }

    const created = await prisma.$transaction(async (tx) => {
      const reply = await tx.forumReply.create({
        data: { threadId, authorId: userId, body: data.body },
        include: { author: AUTHOR_INCLUDE },
      })
      await tx.forumThread.update({
        where: { id: threadId },
        data: {
          repliesCount: { increment: 1 },
          lastReplyAt: new Date(),
        },
      })
      return reply
    })

    return replySchema.parse({
      id: created.id,
      body: created.body,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      author: authorToDto(created.author),
    })
  },

  async updateReply(
    userId: string,
    replyId: string,
    raw: unknown,
  ): Promise<ReplyDto> {
    if (!UUID_RE.test(replyId)) throw new ValidationError({ id: 'ID inválido' })
    const data = replyInputSchema.parse(raw)

    const existing = await prisma.forumReply.findUnique({
      where: { id: replyId },
    })
    if (!existing) throw new NotFoundError('Resposta')

    const actorType = await loadActorType(userId)
    ensureOwnerOrAdmin(existing.authorId, userId, actorType)

    const updated = await prisma.forumReply.update({
      where: { id: replyId },
      data: { body: data.body },
      include: { author: AUTHOR_INCLUDE },
    })

    return replySchema.parse({
      id: updated.id,
      body: updated.body,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      author: authorToDto(updated.author),
    })
  },

  async deleteReply(userId: string, replyId: string): Promise<void> {
    if (!UUID_RE.test(replyId)) throw new ValidationError({ id: 'ID inválido' })

    const existing = await prisma.forumReply.findUnique({
      where: { id: replyId },
    })
    if (!existing) throw new NotFoundError('Resposta')

    const actorType = await loadActorType(userId)
    ensureOwnerOrAdmin(existing.authorId, userId, actorType)

    await prisma.$transaction(async (tx) => {
      await tx.forumReply.delete({ where: { id: replyId } })
      await tx.forumThread.update({
        where: { id: existing.threadId },
        data: { repliesCount: { decrement: 1 } },
      })
    })
  },

  // Para o admin: listar threads recentes para uma visão geral
  async listForAdmin(limit = 50): Promise<ThreadSummaryDto[]> {
    const rows = await prisma.forumThread.findMany({
      include: { author: AUTHOR_INCLUDE },
      orderBy: [{ isPinned: 'desc' }, { lastReplyAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    })
    return rows.map((row) =>
      threadSummarySchema.parse({
        id: row.id,
        title: row.title,
        category: row.category,
        isPinned: row.isPinned,
        isLocked: row.isLocked,
        repliesCount: row.repliesCount,
        lastReplyAt: row.lastReplyAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        author: authorToDto(row.author),
      }),
    )
  },
}

// Compat: garantir que o schema do prisma client seja referenciado para tree-shaking não remover
void forumCategorySchema
