import Link from 'next/link'
import { Calendar, Lock, Pencil, Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { requireContentCreatorSession } from '@/server/lib/admin-session'
import { adminEventsService } from '@/server/services/admin-events.service'
import { cn } from '@/lib/utils'
import { DeleteButton } from './DeleteButton'

export const metadata = {
  title: 'Admin · Eventos',
}

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
  await requireContentCreatorSession()
  const events = await adminEventsService.list()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
            <Calendar size={20} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
              Eventos
            </h1>
            <p className="text-sm text-muted-foreground">
              Crie, edite e remova eventos públicos ou exclusivos para membros.
            </p>
          </div>
        </div>
        <Link href="/admin/eventos/novo">
          <Button
            type="button"
            variant="default"
            icon={<Plus size={16} />}
            iconPosition="left"
            className="h-10"
          >
            Novo evento
          </Button>
        </Link>
      </header>

      {events.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border border-dashed">
          <p className="text-sm text-muted-foreground">Nenhum evento cadastrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-subtle">
                <th className="px-4 py-3 w-20">#</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3 hidden md:table-cell">Data</th>
                <th className="px-4 py-3">Modalidade</th>
                <th className="px-4 py-3">Visibilidade</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-subtle last:border-b-0 hover:bg-card/40"
                >
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {event.number}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{event.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {event.description}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                    {event.dateShort}
                  </td>
                  <td className="px-4 py-3 text-xs">{event.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-[10px] uppercase tracking-wider border px-1.5 py-0.5 rounded',
                        event.visibility === 'MEMBERS'
                          ? 'bg-primary/10 text-primary-destaque border-primary/30'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
                      )}
                    >
                      {event.visibility === 'MEMBERS' ? (
                        <>
                          <Lock size={10} /> Membros
                        </>
                      ) : (
                        'Público'
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/admin/eventos/${event.id}/inscritos`}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          icon={<Users size={14} />}
                          iconPosition="left"
                        >
                          Inscritos
                        </Button>
                      </Link>
                      <Link href={`/admin/eventos/${event.id}/editar`}>
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
                        endpoint={`/api/admin/events/${event.id}`}
                        confirmText={`Excluir o evento "${event.title}"?`}
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
