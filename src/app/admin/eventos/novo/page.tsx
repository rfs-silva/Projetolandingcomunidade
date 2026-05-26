import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { requireAdminSession } from '@/server/lib/admin-session'
import { EventForm } from '../EventForm'

export const metadata = {
  title: 'Admin · Novo evento',
}

export const dynamic = 'force-dynamic'

export default async function NewEventPage() {
  await requireAdminSession()

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
          <Plus size={20} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Novo evento
          </h1>
          <p className="text-sm text-muted-foreground">
            Crie um evento público ou exclusivo para membros.
          </p>
        </div>
      </div>

      <EventForm />
    </div>
  )
}
