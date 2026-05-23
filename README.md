# Comunidade Roraima Devs

Plataforma da comunidade de desenvolvedores de Roraima — landing pública,
mentoria, desafios, eventos e mural de membros/projetos.

## Stack

- **Next.js 16** (App Router, Route Handlers para API)
- **TypeScript** + **Zod** (validação de contratos)
- **Tailwind CSS v4** + **shadcn/ui** + Radix UI
- **PostgreSQL 16** + **Prisma 6** (migrations versionadas)
- **Auth.js v5** (NextAuth) com GitHub OAuth (JWT)
- **Docker Compose** (Postgres + web)

## Pré-requisitos

- Docker + Docker Compose
- Node.js 20+ (para rodar Prisma CLI / scripts locais)

## Setup rápido

```bash
# 1. Copie o exemplo de envs
cp .env.example .env

# 2. (Opcional para landing) crie o OAuth App no GitHub — ver seção abaixo
#    Preencha AUTH_GITHUB_ID e AUTH_GITHUB_SECRET no .env

# 3. Suba o stack (Postgres + web). Migrations e seed rodam automaticamente.
docker compose up -d

# 4. Acesse
#    Landing: http://localhost:3000
#    Login:   http://localhost:3000/login
#    API:     http://localhost:3000/api/health
```

## Estrutura

```
src/
├── app/
│   ├── page.tsx                  # Landing pública
│   ├── login/                    # Página de login (GitHub)
│   ├── dashboard/                # Área de membro (protegida)
│   └── api/                      # Route Handlers REST
│       ├── auth/[...nextauth]/   # Auth.js handlers
│       ├── health/
│       ├── events/[number]/
│       ├── challenges/[number]/
│       └── projects/[id]/
├── auth.ts                       # Config Auth.js (GitHub + JWT + upsert User)
├── middleware.ts                 # Protege /dashboard
├── components/
│   ├── layout/                   # Header (session-aware), Footer
│   ├── sections/                 # Hero, About, Events, Challenges, Showcase, Mentorship
│   ├── ui/                       # button, avatar (shadcn)
│   └── providers/AuthProvider.tsx
└── server/
    ├── lib/prisma.ts             # Singleton do Prisma client
    ├── http/                     # response.ts, errors.ts
    ├── schemas/                  # Zod schemas (DTOs + validação)
    ├── repositories/             # Acesso a dados (Prisma)
    └── services/                 # Regras de negócio

prisma/
├── schema.prisma                 # 10 modelos cobrindo MVP
├── seed.ts                       # Seed idempotente
└── migrations/                   # Migrations versionadas
```

## Variáveis de ambiente

Veja [.env.example](./.env.example) — todas documentadas.

| Variável             | Descrição                                     | Obrigatória |
| -------------------- | --------------------------------------------- | ----------- |
| `DATABASE_URL`       | Conexão Postgres                              | Sim         |
| `AUTH_SECRET`        | Chave para assinar JWT (32+ bytes base64)     | Sim         |
| `AUTH_URL`           | URL pública (ex.: `http://localhost:3000`)    | Sim         |
| `AUTH_GITHUB_ID`     | Client ID do GitHub OAuth App                 | Sim p/ login |
| `AUTH_GITHUB_SECRET` | Client Secret do GitHub OAuth App             | Sim p/ login |

Gerar `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Setup do GitHub OAuth App

1. Acesse https://github.com/settings/developers → **New OAuth App**
2. Preencha:
   - **Application name**: Comunidade Roraima Devs (Local)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Após criar, gere um **Client Secret**.
4. Cole `Client ID` em `AUTH_GITHUB_ID` e `Client Secret` em `AUTH_GITHUB_SECRET` no `.env`.
5. Reinicie o stack: `docker compose restart web`.

> Para produção, crie um OAuth App separado com a URL pública e callback correspondente.

## API

Resposta de sucesso:

```json
{ "data": ..., "meta": { "total": N } }
```

Resposta de erro:

```json
{ "error": { "code": "NOT_FOUND", "message": "...", "details": ... } }
```

| Método | Rota                                  | Descrição                              |
| ------ | ------------------------------------- | -------------------------------------- |
| GET    | `/api/health`                         | Healthcheck (verifica DB)              |
| GET    | `/api/events?type=Remoto\|Presencial` | Lista eventos                          |
| GET    | `/api/events/:number`                 | Evento por número (`01`, `02`...)      |
| GET    | `/api/challenges`                     | Lista desafios                         |
| GET    | `/api/challenges/:number`             | Desafio por número                     |
| GET    | `/api/projects?category=...`          | Lista projetos públicos                |
| GET    | `/api/projects/:id`                   | Projeto por UUID                       |
| GET    | `/api/categories`                     | Categorias de projeto                  |
| `*`    | `/api/auth/*`                         | Endpoints Auth.js (signin, callback…)  |

## Scripts npm

| Script                 | O que faz                                       |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Next.js em modo dev                             |
| `npm run build`        | Build de produção                               |
| `npm run lint`         | ESLint                                          |
| `npm run prisma:generate` | Gera o Prisma Client                        |
| `npm run prisma:migrate`  | Cria/aplica migration em dev (`migrate dev`) |
| `npm run prisma:deploy`   | Aplica migrations em prod                    |
| `npm run prisma:studio`   | Abre o Prisma Studio                         |
| `npm run db:seed`         | Roda o seed (idempotente)                    |
| `npm run db:reset`        | Zera o banco e reaplica migrations + seed    |

## Comandos Docker

```bash
docker compose up -d          # sobe Postgres + web
docker compose logs -f web    # acompanha o app
docker compose restart web    # reinicia só o web (após mudar .env)
docker compose down           # para tudo
docker compose down -v        # zera o volume do Postgres
```

## Gitflow

Este projeto segue Gitflow — branches `main`, `develop`, `homol`. Detalhes em
[GITFLOW.md](./GITFLOW.md).

## Roadmap

Backlog organizado em épicos E0..E8. Status atual:

- ✅ E0 — Fundação (Docker, Postgres, Prisma, migrations, seed)
- 🚧 E1 — Auth GitHub (infra pronta — falta criar OAuth App)
- ⏳ E2..E8 — Próximos sprints
