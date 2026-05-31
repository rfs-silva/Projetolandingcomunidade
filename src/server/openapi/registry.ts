import '@/server/openapi/zod-ext'
import { z } from 'zod'
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from '@asteasolutions/zod-to-openapi'

import {
  eventSchema,
  eventQuerySchema,
  eventInputSchema,
} from '@/server/schemas/event.schema'
import {
  challengeSchema,
  challengeInputSchema,
} from '@/server/schemas/challenge.schema'
import {
  projectSchema,
  projectQuerySchema,
  projectInputSchema,
  projectCategorySchema,
} from '@/server/schemas/project.schema'
import { tagSchema, tagQuerySchema } from '@/server/schemas/tag.schema'
import {
  profileSchema,
  profileUpdateSchema,
  onboardingSchema,
  profileTypeSchema,
} from '@/server/schemas/profile.schema'
import { memberSchema, memberQuerySchema } from '@/server/schemas/member.schema'
import {
  mentorshipApplicationSchema,
  mentorshipApplyInputSchema,
  mentorshipKindSchema,
  applicationStatusSchema,
} from '@/server/schemas/mentorship.schema'
import {
  threadSummarySchema,
  threadDetailSchema,
  replySchema,
  threadInputSchema,
  replyInputSchema,
  threadQuerySchema,
} from '@/server/schemas/forum.schema'

// ---------------------------------------------------------------------------
// Schemas globais (envelope de resposta e erro)
// ---------------------------------------------------------------------------

const apiErrorSchema = z
  .object({
    error: z.object({
      code: z.string().openapi({ example: 'NOT_FOUND' }),
      message: z.string().openapi({ example: 'Recurso não encontrado' }),
      details: z.unknown().optional(),
    }),
  })
  .openapi('ApiError')

const paginationMetaSchema = z.object({
  total: z.number().int(),
  page: z.number().int().optional(),
  pageSize: z.number().int().optional(),
  totalPages: z.number().int().optional(),
})

function envelope<T extends z.ZodTypeAny>(data: T) {
  return z.object({
    data,
    meta: paginationMetaSchema.optional(),
  })
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export function buildRegistry(): OpenAPIRegistry {
  const r = new OpenAPIRegistry()

  // Cookie de sessão (Auth.js) — quem testar via Swagger UI já estará logado
  // se tiver cookie no browser.
  r.registerComponent('securitySchemes', 'sessionCookie', {
    type: 'apiKey',
    in: 'cookie',
    name: 'authjs.session-token',
    description:
      'Cookie de sessão emitido pelo Auth.js após login via GitHub. Em dev pode ter outro nome (`__Secure-authjs.session-token` em https).',
  })

  // Schemas para que apareçam em components.schemas
  r.register('ApiError', apiErrorSchema)

  // ---------------- Públicos ----------------
  r.registerPath({
    method: 'get',
    path: '/api/health',
    tags: ['Public'],
    summary: 'Healthcheck',
    description: 'Retorna { status: "ok" } se o serviço e o banco estiverem ok.',
    responses: okResponse(z.object({ status: z.literal('ok') })),
  })

  r.registerPath({
    method: 'get',
    path: '/api/tags',
    tags: ['Public'],
    summary: 'Lista tags (stack e tópicos)',
    request: { query: tagQuerySchema },
    responses: okResponse(z.array(tagSchema)),
  })

  r.registerPath({
    method: 'get',
    path: '/api/categories',
    tags: ['Public'],
    summary: 'Lista categorias de projeto',
    responses: okResponse(z.array(projectCategorySchema)),
  })

  r.registerPath({
    method: 'get',
    path: '/api/events',
    tags: ['Public'],
    summary: 'Lista eventos públicos',
    request: { query: eventQuerySchema },
    responses: okResponse(z.array(eventSchema)),
  })

  r.registerPath({
    method: 'get',
    path: '/api/events/{number}',
    tags: ['Public'],
    summary: 'Detalha um evento público',
    request: {
      params: z.object({
        number: z.string().openapi({ example: '01' }),
      }),
    },
    responses: {
      ...okResponse(eventSchema),
      ...errorResponse(404, 'Evento não encontrado'),
    },
  })

  r.registerPath({
    method: 'get',
    path: '/api/challenges',
    tags: ['Public'],
    summary: 'Lista desafios públicos',
    responses: okResponse(z.array(challengeSchema)),
  })

  r.registerPath({
    method: 'get',
    path: '/api/challenges/{number}',
    tags: ['Public'],
    summary: 'Detalha um desafio público',
    request: {
      params: z.object({
        number: z.string().openapi({ example: '01' }),
      }),
    },
    responses: {
      ...okResponse(challengeSchema),
      ...errorResponse(404, 'Desafio não encontrado'),
    },
  })

  r.registerPath({
    method: 'get',
    path: '/api/projects',
    tags: ['Public'],
    summary: 'Lista projetos públicos',
    request: { query: projectQuerySchema },
    responses: okResponse(z.array(projectSchema)),
  })

  r.registerPath({
    method: 'get',
    path: '/api/projects/{id}',
    tags: ['Public'],
    summary: 'Detalha um projeto público',
    request: {
      params: z.object({ id: z.string().uuid() }),
    },
    responses: {
      ...okResponse(projectSchema),
      ...errorResponse(404, 'Projeto não encontrado'),
    },
  })

  // ---------------- Autenticados (sessão GitHub) ----------------
  r.registerPath({
    method: 'get',
    path: '/api/members',
    tags: ['Members'],
    summary: 'Mural de membros (filtros + paginação)',
    security: [{ sessionCookie: [] }],
    request: { query: memberQuerySchema },
    responses: {
      ...okResponse(z.array(memberSchema)),
      ...errorResponse(401, 'Não autenticado'),
    },
  })

  r.registerPath({
    method: 'get',
    path: '/api/me/profile',
    tags: ['Me'],
    summary: 'Meu perfil',
    security: [{ sessionCookie: [] }],
    responses: {
      ...okResponse(profileSchema),
      ...errorResponse(401, 'Não autenticado'),
    },
  })

  r.registerPath({
    method: 'put',
    path: '/api/me/profile',
    tags: ['Me'],
    summary: 'Atualiza meu perfil',
    security: [{ sessionCookie: [] }],
    request: {
      body: jsonBody(profileUpdateSchema),
    },
    responses: {
      ...okResponse(profileSchema),
      ...errorResponse(401, 'Não autenticado'),
      ...errorResponse(422, 'Dados inválidos'),
    },
  })

  r.registerPath({
    method: 'post',
    path: '/api/me/profile/tags',
    tags: ['Me'],
    summary: 'Adiciona uma tag ao perfil',
    security: [{ sessionCookie: [] }],
    request: {
      body: jsonBody(z.object({ tagId: z.string().uuid() })),
    },
    responses: {
      ...okResponse(profileSchema),
      ...errorResponse(409, 'Limite de tags atingido'),
    },
  })

  r.registerPath({
    method: 'delete',
    path: '/api/me/profile/tags/{tagId}',
    tags: ['Me'],
    summary: 'Remove uma tag do perfil',
    security: [{ sessionCookie: [] }],
    request: {
      params: z.object({ tagId: z.string().uuid() }),
    },
    responses: okResponse(profileSchema),
  })

  r.registerPath({
    method: 'post',
    path: '/api/me/onboarding',
    tags: ['Me'],
    summary: 'Completa o onboarding (aceite de termos + perfil inicial)',
    security: [{ sessionCookie: [] }],
    request: {
      body: jsonBody(onboardingSchema),
    },
    responses: {
      ...okResponse(profileSchema),
      ...errorResponse(422, 'Dados inválidos'),
    },
  })

  r.registerPath({
    method: 'get',
    path: '/api/me/events',
    tags: ['Me'],
    summary: 'Lista eventos (PUBLIC + MEMBERS)',
    security: [{ sessionCookie: [] }],
    request: { query: eventQuerySchema },
    responses: okResponse(z.array(eventSchema)),
  })

  r.registerPath({
    method: 'get',
    path: '/api/me/challenges',
    tags: ['Me'],
    summary: 'Lista desafios (PUBLIC + MEMBERS)',
    security: [{ sessionCookie: [] }],
    responses: okResponse(z.array(challengeSchema)),
  })

  r.registerPath({
    method: 'get',
    path: '/api/me/mentorship',
    tags: ['Me'],
    summary: 'Minhas candidaturas de mentoria (mentor + mentee)',
    security: [{ sessionCookie: [] }],
    request: {
      query: z.object({ kind: mentorshipKindSchema.optional() }),
    },
    responses: okResponse(
      z.union([
        mentorshipApplicationSchema.nullable(),
        z.object({
          mentor: mentorshipApplicationSchema.nullable(),
          mentee: mentorshipApplicationSchema.nullable(),
        }),
      ]),
    ),
  })

  r.registerPath({
    method: 'post',
    path: '/api/me/mentorship',
    tags: ['Me'],
    summary: 'Submete candidatura de mentoria',
    security: [{ sessionCookie: [] }],
    request: {
      body: jsonBody(mentorshipApplyInputSchema),
    },
    responses: {
      ...okResponse(mentorshipApplicationSchema, 201),
      ...errorResponse(409, 'Já existe candidatura em aberto desse tipo'),
    },
  })

  r.registerPath({
    method: 'get',
    path: '/api/me/projects',
    tags: ['Me'],
    summary: 'Meus projetos',
    security: [{ sessionCookie: [] }],
    responses: okResponse(z.array(projectSchema)),
  })

  r.registerPath({
    method: 'post',
    path: '/api/me/projects',
    tags: ['Me'],
    summary: 'Cria um novo projeto',
    security: [{ sessionCookie: [] }],
    request: { body: jsonBody(projectInputSchema) },
    responses: okResponse(projectSchema, 201),
  })

  r.registerPath({
    method: 'put',
    path: '/api/me/projects/{id}',
    tags: ['Me'],
    summary: 'Atualiza um projeto meu',
    security: [{ sessionCookie: [] }],
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: jsonBody(projectInputSchema),
    },
    responses: okResponse(projectSchema),
  })

  r.registerPath({
    method: 'delete',
    path: '/api/me/projects/{id}',
    tags: ['Me'],
    summary: 'Exclui um projeto meu',
    security: [{ sessionCookie: [] }],
    request: {
      params: z.object({ id: z.string().uuid() }),
    },
    responses: {
      204: { description: 'Projeto excluído' },
    },
  })

  r.registerPath({
    method: 'get',
    path: '/api/me/forum/threads',
    tags: ['Forum'],
    summary: 'Lista tópicos do fórum',
    security: [{ sessionCookie: [] }],
    request: { query: threadQuerySchema },
    responses: okResponse(z.array(threadSummarySchema)),
  })

  r.registerPath({
    method: 'post',
    path: '/api/me/forum/threads',
    tags: ['Forum'],
    summary: 'Cria um novo tópico',
    security: [{ sessionCookie: [] }],
    request: { body: jsonBody(threadInputSchema) },
    responses: okResponse(threadDetailSchema, 201),
  })

  r.registerPath({
    method: 'get',
    path: '/api/me/forum/threads/{id}',
    tags: ['Forum'],
    summary: 'Detalha um tópico (com respostas)',
    security: [{ sessionCookie: [] }],
    request: {
      params: z.object({ id: z.string().uuid() }),
    },
    responses: okResponse(
      z.object({
        thread: threadDetailSchema,
        replies: z.array(replySchema),
      }),
    ),
  })

  r.registerPath({
    method: 'post',
    path: '/api/me/forum/threads/{id}/replies',
    tags: ['Forum'],
    summary: 'Adiciona resposta a um tópico',
    security: [{ sessionCookie: [] }],
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: jsonBody(replyInputSchema),
    },
    responses: okResponse(replySchema, 201),
  })

  r.registerPath({
    method: 'get',
    path: '/api/me/data-export',
    tags: ['Privacy'],
    summary: 'Exporta todos os meus dados (portabilidade LGPD)',
    security: [{ sessionCookie: [] }],
    responses: {
      200: {
        description: 'JSON estruturado com dados pessoais',
        content: {
          'application/json': {
            schema: { type: 'object' as const, description: 'Dados do usuário' },
          },
        },
      },
    },
  })

  r.registerPath({
    method: 'delete',
    path: '/api/me/account',
    tags: ['Privacy'],
    summary: 'Exclui a conta e dados pessoais associados',
    security: [{ sessionCookie: [] }],
    request: {
      body: jsonBody(
        z.object({
          confirmation: z
            .string()
            .openapi({ example: 'EXCLUIR MINHA CONTA' }),
        }),
      ),
    },
    responses: {
      ...okResponse(z.object({ ok: z.literal(true) })),
      ...errorResponse(400, 'Frase de confirmação incorreta'),
    },
  })

  // ---------------- Admin ----------------
  r.registerPath({
    method: 'patch',
    path: '/api/admin/users/{id}',
    tags: ['Admin'],
    summary: 'Altera o tipo de perfil de um usuário',
    security: [{ sessionCookie: [] }],
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: jsonBody(z.object({ type: profileTypeSchema })),
    },
    responses: {
      ...okResponse(z.object({ userId: z.string().uuid(), type: profileTypeSchema })),
      ...errorResponse(403, 'Acesso restrito a administradores'),
    },
  })

  r.registerPath({
    method: 'patch',
    path: '/api/admin/mentorship/{id}',
    tags: ['Admin'],
    summary: 'Atualiza status de uma candidatura de mentoria',
    security: [{ sessionCookie: [] }],
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: jsonBody(z.object({ status: applicationStatusSchema })),
    },
    responses: okResponse(mentorshipApplicationSchema),
  })

  r.registerPath({
    method: 'get',
    path: '/api/admin/events',
    tags: ['Admin'],
    summary: 'Lista todos os eventos (incl. drafts/inativos)',
    security: [{ sessionCookie: [] }],
    responses: okResponse(z.array(eventSchema)),
  })

  r.registerPath({
    method: 'post',
    path: '/api/admin/events',
    tags: ['Admin'],
    summary: 'Cria um evento',
    security: [{ sessionCookie: [] }],
    request: { body: jsonBody(eventInputSchema) },
    responses: okResponse(eventSchema, 201),
  })

  r.registerPath({
    method: 'put',
    path: '/api/admin/events/{id}',
    tags: ['Admin'],
    summary: 'Atualiza um evento',
    security: [{ sessionCookie: [] }],
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: jsonBody(eventInputSchema),
    },
    responses: okResponse(eventSchema),
  })

  r.registerPath({
    method: 'delete',
    path: '/api/admin/events/{id}',
    tags: ['Admin'],
    summary: 'Exclui um evento',
    security: [{ sessionCookie: [] }],
    request: {
      params: z.object({ id: z.string().uuid() }),
    },
    responses: {
      204: { description: 'Evento excluído' },
    },
  })

  r.registerPath({
    method: 'post',
    path: '/api/admin/challenges',
    tags: ['Admin'],
    summary: 'Cria um desafio',
    security: [{ sessionCookie: [] }],
    request: { body: jsonBody(challengeInputSchema) },
    responses: okResponse(challengeSchema, 201),
  })

  r.registerPath({
    method: 'patch',
    path: '/api/admin/forum/threads/{id}',
    tags: ['Admin'],
    summary: 'Fixa / fecha um tópico do fórum',
    security: [{ sessionCookie: [] }],
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: jsonBody(
        z.object({
          isPinned: z.boolean().optional(),
          isLocked: z.boolean().optional(),
        }),
      ),
    },
    responses: okResponse(threadDetailSchema),
  })

  r.registerPath({
    method: 'delete',
    path: '/api/admin/forum/threads/{id}',
    tags: ['Admin'],
    summary: 'Exclui um tópico do fórum (moderação)',
    security: [{ sessionCookie: [] }],
    request: {
      params: z.object({ id: z.string().uuid() }),
    },
    responses: {
      204: { description: 'Tópico excluído' },
    },
  })

  return r
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonBody<T extends z.ZodTypeAny>(schema: T) {
  return {
    required: true,
    content: {
      'application/json': { schema },
    },
  }
}

function okResponse<T extends z.ZodTypeAny>(data: T, status: 200 | 201 = 200) {
  const code = status as 200 | 201
  return {
    [code]: {
      description: code === 201 ? 'Recurso criado' : 'OK',
      content: {
        'application/json': { schema: envelope(data) },
      },
    },
  }
}

function errorResponse(status: number, description: string) {
  return {
    [status]: {
      description,
      content: {
        'application/json': { schema: apiErrorSchema },
      },
    },
  }
}

export function generateOpenApiDocument() {
  const registry = buildRegistry()
  const generator = new OpenApiGeneratorV31(registry.definitions)

  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Comunidade Roraima Fullstack Developers API',
      version: '1.1.0',
      description:
        'API REST que alimenta a plataforma. Endpoints públicos não exigem auth; ' +
        'rotas `/api/me/*` e `/api/admin/*` usam cookie de sessão emitido pelo Auth.js.\n\n' +
        '**Nota POC:** alguns endpoints novos (gamificação, ranking, empresas, aprovações ' +
        'de conteúdo, marcação de liderança em destaque) ainda não estão totalmente documentados ' +
        'aqui — ver código em `src/app/api/` ou o roadmap no README.',
      contact: { email: process.env.DPO_EMAIL || 'contato@comunidaderoraima.dev' },
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local' },
    ],
    tags: [
      { name: 'Public', description: 'Sem autenticação' },
      { name: 'Me', description: 'Conta do usuário autenticado' },
      { name: 'Members', description: 'Mural de membros' },
      { name: 'Forum', description: 'Tópicos e respostas' },
      { name: 'Gamification', description: 'Participação em desafios, eventos, pontos e ranking' },
      { name: 'Companies', description: 'Candidaturas e gestão de empresas parceiras' },
      { name: 'Privacy', description: 'LGPD: export e exclusão de conta' },
      { name: 'Admin', description: 'Restritos a LEADER/FOUNDER' },
    ],
  })
}
