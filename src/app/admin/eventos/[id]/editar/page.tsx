import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'
import { requireAdminSession } from '@/server/lib/admin-session'
import { adminEventsService } from '@/server/services/admin-events.service'
import { EventForm } from '../../EventForm'

export const metadata = {
  title: 'Admin · Editar evento',
}

export const dynamic = 'force-dynamic'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdminSession()
  const { id } = await params
  const event = await adminEventsService.getById(id)

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Link
        href="/admin/eventos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> Voltar para eventos
      </Link>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
          <Pencil size={20} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Editar evento
          </h1>
          <p className="text-sm text-muted-foreground">
            {event.number} · {event.title}
          </p>
        </div>
      </div>

      <EventForm
        initial={{
          id: event.id,
          number: event.number,
          title: event.title,
          description: event.description,
          dateFull: event.dateFull,
          dateShort: event.dateShort,
          type: event.type,
          visibility: event.visibility,
          imageIndex: event.imageIndex,
          points: event.points,
        }}
      />
    </div>
  )
}
