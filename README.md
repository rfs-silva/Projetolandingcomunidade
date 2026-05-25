# Comunidade Roraima Devs

Plataforma da comunidade de desenvolvedores de Roraima — landing pública,
área de membros, mentoria, mural de projetos e mural de membros.

## Stack

- **Next.js 16** (App Router · Route Handlers · Server Components/Actions)
- **TypeScript** + **Zod** (validação de contratos)
- **Tailwind CSS v4** + **shadcn/ui** + Radix UI
- **PostgreSQL 16** + **Prisma 6** (migrations versionadas, seed idempotente)
- **Auth.js v5** (NextAuth) com GitHub OAuth (JWT)
- **Docker Compose** (Postgres + web)

## Pré-requisitos

- Docker + Docker Compose
- Node.js 20+ (para rodar Prisma CLI / scripts locais)

## Setup rápido

```bash
# 1. Variáveis de ambiente
cp .env.example .env
# Preencha AUTH_GITHUB_ID e AUTH_GITHUB_SECRET (ver seção abaixo)

# 2. Sobe Postgres + web (migrations e seed rodam no startup)
docker compose up -d

# 3. Acesse
#    Landing:           http://localhost:3000
#    Login:             http://localhost:3000/login
#    Painel do membro:  http://localhost:3000/dashboard
#    API health:        http://localhost:3000/api/health
```

## Estrutura

```
src/
├── app/
│   ├── page.tsx                    # Landing pública (Hero/Lideranças/Eventos/...)
│   ├── (legais)
│   │   ├── manifesto/              # /manifesto
│   │   ├── termos/                 # /termos
│   │   └── privacidade/            # /privacidade
│   ├── login/                      # Login GitHub
│   ├── onboarding/                 # Aceite de termos + tipo de perfil
│   ├── dashboard/                  # Área protegida
│   │   ├── page.tsx                # Painel com resumo do perfil + cards
│   │   ├── profile/                # Editar perfil + tags
│   │   ├── membros/                # Mural de membros (filtros + paginação)
│   │   ├── eventos/                # Lista com PUBLIC + MEMBERS
│   │   ├── desafios/               # Lista com PUBLIC + MEMBERS
│   │   ├── mentoria/               # Candidatura + status
│   │   └── projetos/               # CRUD de projetos do membro
│   └── api/
│       ├── auth/[...nextauth]/     # Auth.js handlers
│       ├── health/                 # Healthcheck (verifica DB)
│       ├── tags/                   # GET (público)
│       ├── events/                 # GET (apenas PUBLIC)
│       ├── challenges/             # GET (apenas PUBLIC)
│       ├── projects/               # GET (apenas PUBLIC)
│       ├── categories/             # GET (público)
│       ├── members/                # GET (auth: PUBLIC+MEMBERS)
│       └── me/                     # Tudo de "eu" (auth required)
│           ├── profile/            # GET/PUT + tags POST/DELETE
│           ├── events/             # GET (PUBLIC+MEMBERS)
│           ├── challenges/         # GET (PUBLIC+MEMBERS)
│           ├── mentorship/         # GET/POST
│           └── projects/           # GET/POST + [id] GET/PUT/DELETE
├── auth.ts                         # Config Auth.js (GitHub + JWT + upsert User)
├── middleware.ts                   # Protege /dashboard e /onboarding
├── components/
│   ├── layout/                     # Header (session-aware) + Footer
│   ├── sections/                   # Hero, About, Leaders, Events, Challenges, Showcase, Mentorship
│   ├── ui/                         # button, avatar, UserAvatar, dialog
│   ├── auth/AuthGate.tsx           # Modal de login pra CTAs exclusivas
│   └── providers/AuthProvider.tsx
└── server/
    ├── lib/prisma.ts               # Singleton do Prisma client
    ├── http/                       # response, errors, session helper
    ├── schemas/                    # Zod (event, challenge, project, profile, tag, member, leader, mentorship)
    ├── repositories/               # Prisma ↔ DTO
    └── services/                   # Regras de negócio (async)

prisma/
├── schema.prisma                   # 10 modelos cobrindo MVP
├── seed.ts                         # Idempotente: 6 eventos, 5 desafios, 52 tags, 8 perfis seed
└── migrations/                     # Versionadas

content/
└── leaders.json                    # Lideranças (versionadas, sem painel admin)
```

## Variáveis de ambiente

Veja [.env.example](./.env.example). Resumo:

| Variável             | Descrição                                       | Obrigatória |
| -------------------- | ----------------------------------------------- | ----------- |
| `DATABASE_URL`       | Conexão Postgres                                | Sim         |
| `AUTH_SECRET`        | Chave JWT (32+ bytes base64)                    | Sim         |
| `AUTH_URL`           | URL pública (ex.: `http://localhost:3000`)      | Sim         |
| `AUTH_GITHUB_ID`     | Client ID do GitHub OAuth App                   | Sim p/ login |
| `AUTH_GITHUB_SECRET` | Client Secret do GitHub OAuth App               | Sim p/ login |

Gerar `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Setup do GitHub OAuth App

1. https://github.com/settings/developers → **New OAuth App**
2. **Homepage URL**: `http://localhost:3000`
3. **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Cole `Client ID` e `Client Secret` no `.env`
5. `docker compose restart web`

## API REST

### Respostas padronizadas

```json
{ "data": ..., "meta": { "total": N, "page": 1, "pageSize": 12, "totalPages": 3 } }
{ "error": { "code": "NOT_FOUND", "message": "...", "details": ... } }
```

### Endpoints públicos (sem auth)

| Método | Rota                          | O que faz                                          |
| ------ | ----------------------------- | -------------------------------------------------- |
| GET    | `/api/health`                 | Healthcheck (verifica DB)                          |
| GET    | `/api/tags?category=&q=`      | Lista tags com filtro/busca                        |
| GET    | `/api/categories`             | Categorias de projeto                              |
| GET    | `/api/events?type=`           | Eventos públicos                                   |
| GET    | `/api/events/:number`         | Evento público específico                          |
| GET    | `/api/challenges`             | Desafios públicos                                  |
| GET    | `/api/challenges/:number`     | Desafio público específico                         |
| GET    | `/api/projects?category=`     | Projetos PUBLIC                                    |
| GET    | `/api/projects/:id`           | Projeto público                                    |

### Endpoints autenticados

| Método | Rota                                | O que faz                                       |
| ------ | ----------------------------------- | ----------------------------------------------- |
| GET    | `/api/members?type=&tags=&q=&page=` | Mural de membros com filtros + paginação        |
| GET    | `/api/me/profile`                   | Perfil do usuário atual                         |
| PUT    | `/api/me/profile`                   | Atualiza perfil                                 |
| POST   | `/api/me/profile/tags`              | Adiciona tag ao perfil (`{ tagId }`)            |
| DELETE | `/api/me/profile/tags/:tagId`       | Remove tag                                      |
| GET    | `/api/me/events`                    | Todos os eventos (PUBLIC + MEMBERS)             |
| GET    | `/api/me/challenges`                | Todos os desafios (PUBLIC + MEMBERS)            |
| GET    | `/api/me/mentorship`                | Última candidatura à mentoria                   |
| POST   | `/api/me/mentorship`                | Envia candidatura à mentoria                    |
| GET    | `/api/me/projects`                  | Meus projetos                                   |
| POST   | `/api/me/projects`                  | Cria projeto                                    |
| GET    | `/api/me/projects/:id`              | Projeto específico (com tagIds)                 |
| PUT    | `/api/me/projects/:id`              | Atualiza projeto                                |
| DELETE | `/api/me/projects/:id`              | Exclui projeto                                  |
| `*`    | `/api/auth/*`                       | Endpoints Auth.js (signin, callback…)           |

## Scripts npm

```bash
npm run dev                # Next.js dev
npm run build              # Build prod
npm run lint               # ESLint
npm run prisma:generate    # Gera Prisma Client
npm run prisma:migrate     # migrate dev
npm run prisma:deploy      # migrate deploy (prod)
npm run prisma:studio      # GUI do banco
npm run db:seed            # Roda o seed idempotente
npm run db:reset           # Zera e reaplica migrations + seed
```

## Comandos Docker

```bash
docker compose up -d              # sobe Postgres + web
docker compose logs -f web        # acompanha logs
docker compose restart web        # após mudar .env
docker compose down               # para tudo
docker compose down -v            # zera volume do Postgres
```

## Gitflow

Branches `main`, `develop`, `homol`. Features saem de `develop`.
Detalhes em [GITFLOW.md](./GITFLOW.md).

## Roadmap MVP

- ✅ **E0** Fundação (Docker, Postgres, Prisma, migrations, seed)
- ✅ **E1** Auth GitHub + onboarding + termos/privacidade
- ✅ **E2** Landing pública (Hero, Lideranças, Eventos, Desafios, Mentoria, Manifesto, Modal gating)
- ✅ **E3** Perfil completo (editar + 52 tags + multi-select)
- ✅ **E4** Mural de membros (filtros + busca + paginação)
- ✅ **E5** Eventos/desafios exclusivos (visibility PUBLIC/MEMBERS)
- ✅ **E6** Mentoria (candidatura + status)
- ✅ **E7** Mural de projetos (CRUD próprio + visibilidade)
- ✅ **E8** Polimento e documentação
