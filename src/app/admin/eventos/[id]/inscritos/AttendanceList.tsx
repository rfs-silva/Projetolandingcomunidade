'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/UserAvatar'

type Item = {
  id: string
  status: 'REGISTERED' | 'ATTENDED' | 'CANCELLED'
  registeredAt: string
  attendedAt: string | null
  user: {
    id: string
    displayName: string
    githubUsername: string
    avatarUrl: string | null
  }
}

const LABEL: Record<Item['status'], string> = {
  REGISTERED: 'Inscrito',
  ATTENDED: 'Presença confirmada',
  CANCELLED: 'Cancelado',
}

export function AttendanceList({
  eventId,
  items,
}: {
  eventId: string
  items: Item[]
}) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted-foreground">
        Nenhum inscrito ainda.
      </div>
    )
  }

  async function setAttendance(regId: string, attended: boolean) {
    setError(null)
    setPendingId(regId)
    try {
      const res = await fetch(
        `/api/admin/events/${eventId}/registrations/${regId}/attendance`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ attended }),
        },
      )
      if (!res.ok) {
        const b = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null
        setError(b?.error?.message ?? 'Não foi possível atualizar.')
        return
      }
      router.refresh()
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-background-secondary text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Membro</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Inscrição</th>
              <th className="px-4 py-3 text-right font-medium">Ação</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr
                key={it.id}
                className="border-t border-border/60 hover:bg-background-secondary/40"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      size="sm"
                      src={it.user.avatarUrl}
                      name={it.user.displayName}
                      seed={it.user.githubUsername}
                    />
                    <div>
                      <div className="font-medium text-foreground">
                        {it.user.displayName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        @{it.user.githubUsername}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      'inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ' +
                      (it.status === 'ATTENDED'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : it.status === 'CANCELLED'
                          ? 'bg-red-500/10 text-red-300 border border-red-500/30'
                          : 'bg-background-secondary text-muted-foreground border border-zinc-700/50')
                    }
                  >
                    {LABEL[it.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(it.registeredAt).toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-right">
                  {it.status === 'CANCELLED' ? (
                    <span className="text-xs text-muted-foreground">—</span>
                  ) : it.status === 'ATTENDED' ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      loading={pendingId === it.id}
                      onClick={() => setAttendance(it.id, false)}
                      icon={<X size={14} />}
                    >
                      Remover presença
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      loading={pendingId === it.id}
                      onClick={() => setAttendance(it.id, true)}
                      icon={<Check size={14} />}
                    >
                      Confirmar presença
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
