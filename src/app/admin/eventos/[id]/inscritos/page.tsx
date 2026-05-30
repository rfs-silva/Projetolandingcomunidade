import Link from 'next/link'
import { ArrowLeft, Award, Calendar, CheckCircle2, UserMinus, Users } from 'lucide-react'
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

  const counts = {
    registered: registrations.filter((r) => r.status === 'REGISTERED').length,
    attended: registrations.filter((r) => r.status === 'ATTENDED').length,
    cancelled: registrations.filter((r) => r.status === 'CANCELLED').length,
  }
  const total = registrations.length
  const distributed = counts.attended * event.points

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

      <header className="flex items-start gap-3 flex-wrap">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
          <Calendar size={20} />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            {event.number} · {event.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {event.dateFull} · {event.type} · {event.points} pts por presença
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          label="Total de inscrições"
          value={total}
          icon={<Users size={16} />}
        />
        <Stat
          label="Aguardando presença"
          value={counts.registered}
          icon={<Users size={16} />}
          tone={counts.registered > 0 ? 'warn' : 'default'}
        />
        <Stat
          label="Presenças confirmadas"
          value={counts.attended}
          icon={<CheckCircle2 size={16} />}
          tone="success"
        />
        <Stat
          label="Pontos distribuídos"
          value={distributed}
          icon={<Award size={16} />}
        />
      </div>

      {counts.cancelled > 0 ? (
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
          <UserMinus size={12} /> {counts.cancelled}{' '}
          {counts.cancelled === 1 ? 'cancelamento' : 'cancelamentos'}.
        </p>
      ) : null}

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

function Stat({
  label,
  value,
  icon,
  tone = 'default',
}: {
  label: string
  value: number
  icon: React.ReactNode
  tone?: 'default' | 'warn' | 'success'
}) {
  const klass =
    tone === 'success'
      ? 'border-emerald-500/40 bg-emerald-500/10'
      : tone === 'warn'
        ? 'border-amber-500/40 bg-amber-500/10'
        : 'border-subtle bg-card'
  return (
    <div className={'rounded-xl border p-4 ' + klass}>
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
    </div>
  )
}
