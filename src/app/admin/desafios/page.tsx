import Link from 'next/link'
import {
  CheckCircle2,
  Clock,
  Lock,
  Pencil,
  Plus,
  Target,
  Users,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  isAdminType,
  requireContentCreatorSession,
} from '@/server/lib/admin-session'
import { adminChallengesService } from '@/server/services/admin-challenges.service'
import { cn } from '@/lib/utils'
import { DeleteButton } from '../eventos/DeleteButton'

export const metadata = {
  title: 'Admin · Desafios',
}

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: 'Publicado',
  PENDING_APPROVAL: 'Em revisão',
  REJECTED: 'Devolvido',
}

const STATUS_CLASS: Record<string, string> = {
  PUBLISHED: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  PENDING_APPROVAL: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  REJECTED: 'bg-red-500/10 text-red-300 border-red-500/30',
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  PUBLISHED: <CheckCircle2 size={10} />,
  PENDING_APPROVAL: <Clock size={10} />,
  REJECTED: <XCircle size={10} />,
}

export default async function AdminChallengesPage() {
  const session = await requireContentCreatorSession()
  const isAdmin = isAdminType(session.profile.type)
  const challenges = await adminChallengesService.list({
    userId: session.userId,
    profileType: session.profile.type,
  })

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
            <Target size={20} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
              Desafios
            </h1>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? 'Crie, edite e remova desafios públicos ou exclusivos para membros.'
                : 'Proponha desafios da sua empresa. Liderança revisa antes de publicar.'}
            </p>
          </div>
        </div>
        <Link href="/admin/desafios/novo">
          <Button
            type="button"
            variant="default"
            icon={<Plus size={16} />}
            iconPosition="left"
            className="h-10"
          >
            Novo desafio
          </Button>
        </Link>
      </header>

      {!isAdmin ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
          Suas propostas entram como{' '}
          <strong>Em revisão</strong> e ficam visíveis na landing após
          aprovação da liderança.
        </div>
      ) : null}

      {challenges.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border border-dashed">
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? 'Nenhum desafio cadastrado.'
              : 'Você ainda não propôs nenhum desafio.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-subtle">
                <th className="px-4 py-3 w-20">#</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3 hidden md:table-cell">Tags</th>
                <th className="px-4 py-3">Visibilidade</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {challenges.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-subtle last:border-b-0 hover:bg-card/40 align-top"
                >
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {c.number}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{c.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {c.description}
                    </div>
                    {c.reviewerNote ? (
                      <div className="mt-1 text-[11px] text-red-400">
                        Revisor: {c.reviewerNote}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        c.tags.map((t, i) => (
                          <span
                            key={i}
                            className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-background-secondary text-muted-foreground border border-zinc-700/50"
                          >
                            {t.label}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-[10px] uppercase tracking-wider border px-1.5 py-0.5 rounded',
                        c.visibility === 'MEMBERS'
                          ? 'bg-primary/10 text-primary-destaque border-primary/30'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
                      )}
                    >
                      {c.visibility === 'MEMBERS' ? (
                        <>
                          <Lock size={10} /> Membros
                        </>
                      ) : (
                        'Público'
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        'inline-flex items-center gap-1 text-[10px] uppercase tracking-wider border px-1.5 py-0.5 rounded ' +
                        (STATUS_CLASS[c.status] ?? '')
                      }
                    >
                      {STATUS_ICON[c.status]}
                      {STATUS_LABEL[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {isAdmin && c.status === 'PUBLISHED' ? (
                        <Link
                          href={`/admin/desafios/${c.id}/participacoes`}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            icon={<Users size={14} />}
                            iconPosition="left"
                          >
                            Participações
                          </Button>
                        </Link>
                      ) : null}
                      <Link href={`/admin/desafios/${c.id}/editar`}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          icon={<Pencil size={14} />}
                          iconPosition="left"
                        >
                          Editar
                        </Button>
                      </Link>
                      <DeleteButton
                        endpoint={`/api/admin/challenges/${c.id}`}
                        confirmText={`Excluir o desafio "${c.title}"?`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
