'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'

type Status = 'NONE' | 'REGISTERED' | 'ATTENDED' | 'CANCELLED'

type Props = {
  eventNumber: string
  initialStatus: Status
}

export function EventRegistrationButton({ eventNumber, initialStatus }: Props) {
  const [status, setStatus] = useState<Status>(initialStatus)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function register() {
    setError(null)
    const res = await fetch(
      `/api/me/events/${encodeURIComponent(eventNumber)}/registration`,
      { method: 'POST' },
    )
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null
      setError(body?.error?.message ?? 'Não foi possível inscrever.')
      return
    }
    setStatus('REGISTERED')
    startTransition(() => router.refresh())
  }

  async function cancel() {
    setError(null)
    const res = await fetch(
      `/api/me/events/${encodeURIComponent(eventNumber)}/registration`,
      { method: 'DELETE' },
    )
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null
      setError(body?.error?.message ?? 'Não foi possível cancelar.')
      return
    }
    setStatus('CANCELLED')
    startTransition(() => router.refresh())
  }

  if (status === 'ATTENDED') {
    return (
      <Button
        type="button"
        variant="outline-primary"
        size="sm"
        className="w-full"
        disabled
        icon={<Check size={14} />}
      >
        Presença confirmada
      </Button>
    )
  }

  if (status === 'REGISTERED') {
    return (
      <div className="w-full space-y-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={isPending}
          onClick={cancel}
          icon={<X size={14} />}
          className="w-full"
        >
          Cancelar inscrição
        </Button>
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
      </div>
    )
  }

  return (
    <div className="w-full space-y-1">
      <Button
        type="button"
        variant="outline-primary"
        size="sm"
        loading={isPending}
        onClick={register}
        className="w-full"
      >
        Inscrever-se
      </Button>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  )
}
