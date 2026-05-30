import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireAdminSession } from '@/server/lib/admin-session'
import { adminEventsService } from '@/server/services/admin-events.service'
import { adminProgressService } from '@/server/services/admin-progress.service'
import { AttendanceList } from './AttendanceList'

export const metadata = {
  title: 'Inscritos · Admin',
}

export const dynamic = 'force-dynamic'

export default async function AdminEventRegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdminSession()
  const { id } = await params
  const event = await adminEventsService.getById(id)
  const registrations = await adminProgressService.listEventRegistrations(
    event.number,
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/eventos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} /> Voltar para eventos
        </Link>
      </div>

      <header>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
          {event.number} · {event.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {event.dateFull} · {event.type} · {event.points} pts por presença
        </p>
      </header>

      <AttendanceList
        eventId={event.id}
        items={registrations.map((r) => ({
          id: r.id,
          status: r.status,
          registeredAt: r.registeredAt.toISOString(),
          attendedAt: r.attendedAt ? r.attendedAt.toISOString() : null,
          user: r.user,
        }))}
      />
    </div>
  )
}
