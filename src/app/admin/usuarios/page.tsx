import Link from 'next/link'
import { Users } from 'lucide-react'
import { requireAdminSession } from '@/server/lib/admin-session'
import { adminUsersService } from '@/server/services/admin-users.service'
import {
  profileTypeSchema,
  type ProfileType,
} from '@/server/schemas/profile.schema'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { cn } from '@/lib/utils'
import { TypeSelect } from './TypeSelect'

export const metadata = {
  title: 'Admin · Usuários',
}

export const dynamic = 'force-dynamic'

const TYPE_LABEL: Record<ProfileType, string> = {
  MEMBER: 'Membro',
  COMPANY: 'Empresa',
  LEADER: 'Liderança',
  FOUNDER: 'Fundador',
}

const FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'MEMBER', label: 'Membros' },
  { value: 'COMPANY', label: 'Empresas' },
  { value: 'LEADER', label: 'Lideranças' },
  { value: 'FOUNDER', label: 'Fundadores' },
]

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const session = await requireAdminSession()
  const params = await searchParams
  const parsed = profileTypeSchema.safeParse(params.type)
  const filterType = parsed.success ? parsed.data : undefined

  const users = await adminUsersService.list({ type: filterType })

  function filterHref(value: string) {
    return value ? `/admin/usuarios?type=${value}` : '/admin/usuarios'
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
              Usuários
            </h1>
            <p className="text-sm text-muted-foreground">
              Promova ou rebaixe membros entre os papéis da plataforma.
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-subtle pb-4">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-2">
          Filtro
        </span>
        {FILTERS.map((opt) => {
          const isActive = (filterType ?? '') === opt.value
          return (
            <Link
              key={opt.value || 'all'}
              href={filterHref(opt.value)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary-destaque border-primary/30'
                  : 'bg-background-secondary text-muted-foreground border-subtle hover:text-foreground',
              )}
            >
              {opt.label}
            </Link>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        {users.length} {users.length === 1 ? 'usuário' : 'usuários'}
      </p>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-subtle">
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3 hidden md:table-cell">Localização</th>
              <th className="px-4 py-3 hidden md:table-cell">Entrou em</th>
              <th className="px-4 py-3">Papel atual</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.userId}
                className="border-b border-subtle last:border-b-0 hover:bg-card/40"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={u.avatarUrl}
                      name={u.displayName}
                      seed={u.githubUsername}
                    />
                    <div>
                      <div className="font-medium text-foreground">
                        {u.displayName}
                      </div>
                      <Link
                        target="_blank"
                        href={`https://github.com/${u.githubUsername}`}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        @{u.githubUsername}
                      </Link>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                  {u.location ?? '—'}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                  {new Date(u.joinedAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs">
                    {TYPE_LABEL[u.type]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <TypeSelect
                    userId={u.userId}
                    current={u.type}
                    isSelf={u.userId === session.userId}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Nenhum usuário no filtro.
          </div>
        ) : null}
      </div>
    </div>
  )
}
