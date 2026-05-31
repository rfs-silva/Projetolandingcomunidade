'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Item = {
  id: string
  number: string
  title: string
  description: string
  metaLine: string
  ownerName: string
  kind: 'event' | 'challenge'
}

export function ApprovalList({ items }: { items: Item[] }) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rejectFor, setRejectFor] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card py-10 text-center text-sm text-muted-foreground">
        Nada pendente. 🎉
      </div>
    )
  }

  function endpointFor(item: Item, action: 'approve' | 'reject') {
    const base =
      item.kind === 'event'
        ? `/api/admin/events/${item.id}`
        : `/api/admin/challenges/${item.id}`
    return `${base}/${action}`
  }

  async function approve(item: Item) {
    setError(null)
    setPendingId(item.id)
    try {
      const res = await fetch(endpointFor(item, 'approve'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const b = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null
        setError(b?.error?.message ?? 'Não foi possível aprovar.')
        return
      }
      router.refresh()
    } finally {
      setPendingId(null)
    }
  }

  async function reject(item: Item) {
    setError(null)
    setPendingId(item.id)
    try {
      const res = await fetch(endpointFor(item, 'reject'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reviewerNote: rejectNote }),
      })
      if (!res.ok) {
        const b = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null
        setError(b?.error?.message ?? 'Não foi possível devolver.')
        return
      }
      setRejectFor(null)
      setRejectNote('')
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
      {items.map((it) => (
        <article
          key={it.id}
          className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 flex flex-col gap-3"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground">
                  {it.number}
                </span>
                <h3 className="text-base font-semibold text-foreground">
                  {it.title}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Proposto por <strong>{it.ownerName}</strong> · {it.metaLine}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {it.description}
          </p>

          {rejectFor === it.id ? (
            <div className="rounded-lg border border-border bg-background-secondary p-3 space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Motivo da devolução (visível para a empresa)
              </label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={3}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRejectFor(null)
                    setRejectNote('')
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  loading={pendingId === it.id}
                  disabled={rejectNote.trim().length < 3}
                  onClick={() => reject(it)}
                  icon={<X size={14} />}
                >
                  Confirmar devolução
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectFor(it.id)
                  setRejectNote('')
                }}
                icon={<X size={14} />}
              >
                Devolver
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                loading={pendingId === it.id}
                onClick={() => approve(it)}
                icon={<Check size={14} />}
              >
                Aprovar
              </Button>
            </div>
          )}
        </article>
      ))}
    </div>
  )
}
