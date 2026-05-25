'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, Loader2, ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ApplicationStatus } from '@/server/schemas/mentorship.schema'

const NEXT_ACTIONS: Record<
  ApplicationStatus,
  { label: string; status: ApplicationStatus; icon: React.ReactNode; variant: 'default' | 'outline-primary' | 'destructive' }[]
> = {
  SUBMITTED: [
    {
      label: 'Iniciar análise',
      status: 'IN_REVIEW',
      icon: <Clock size={14} />,
      variant: 'outline-primary',
    },
    {
      label: 'Aceitar',
      status: 'ACCEPTED',
      icon: <CheckCircle2 size={14} />,
      variant: 'default',
    },
    {
      label: 'Recusar',
      status: 'REJECTED',
      icon: <ShieldX size={14} />,
      variant: 'destructive',
    },
  ],
  IN_REVIEW: [
    {
      label: 'Aceitar',
      status: 'ACCEPTED',
      icon: <CheckCircle2 size={14} />,
      variant: 'default',
    },
    {
      label: 'Recusar',
      status: 'REJECTED',
      icon: <ShieldX size={14} />,
      variant: 'destructive',
    },
  ],
  ACCEPTED: [
    {
      label: 'Reverter para análise',
      status: 'IN_REVIEW',
      icon: <Clock size={14} />,
      variant: 'outline-primary',
    },
  ],
  REJECTED: [
    {
      label: 'Reabrir',
      status: 'SUBMITTED',
      icon: <Clock size={14} />,
      variant: 'outline-primary',
    },
  ],
}

export function StatusActions({
  applicationId,
  current,
}: {
  applicationId: string
  current: ApplicationStatus
}) {
  const router = useRouter()
  const [pending, setPending] = useState<ApplicationStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  async function changeTo(status: ApplicationStatus) {
    setError(null)
    setPending(status)
    const res = await fetch(`/api/admin/mentorship/${applicationId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setPending(null)
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setError(body?.error?.message ?? 'Falha ao atualizar.')
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {NEXT_ACTIONS[current].map((action) => (
          <Button
            key={action.status}
            type="button"
            size="sm"
            variant={action.variant}
            disabled={pending !== null}
            icon={
              pending === action.status ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                action.icon
              )
            }
            iconPosition="left"
            onClick={() => changeTo(action.status)}
          >
            {action.label}
          </Button>
        ))}
      </div>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  )
}
