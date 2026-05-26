'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, LockOpen, Pin, PinOff, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThreadAdminActions({
  threadId,
  isPinned,
  isLocked,
}: {
  threadId: string
  isPinned: boolean
  isLocked: boolean
}) {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  async function patch(payload: Record<string, boolean>, key: string) {
    setError(null)
    setPending(key)
    const res = await fetch(`/api/admin/forum/threads/${threadId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setPending(null)
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setError(body?.error?.message ?? 'Falha ao atualizar.')
      return
    }
    startTransition(() => router.refresh())
  }

  async function remove() {
    if (!confirm('Excluir este tópico? Esta ação não pode ser desfeita.')) return
    setError(null)
    setPending('delete')
    const res = await fetch(`/api/admin/forum/threads/${threadId}`, {
      method: 'DELETE',
    })
    setPending(null)
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setError(body?.error?.message ?? 'Falha ao excluir.')
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex flex-col gap-1 items-end">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={
            pending === 'pin' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isPinned ? (
              <PinOff size={14} />
            ) : (
              <Pin size={14} />
            )
          }
          iconPosition="left"
          onClick={() => patch({ isPinned: !isPinned }, 'pin')}
          disabled={pending !== null}
        >
          {isPinned ? 'Desafixar' : 'Fixar'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={
            pending === 'lock' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isLocked ? (
              <LockOpen size={14} />
            ) : (
              <Lock size={14} />
            )
          }
          iconPosition="left"
          onClick={() => patch({ isLocked: !isLocked }, 'lock')}
          disabled={pending !== null}
        >
          {isLocked ? 'Reabrir' : 'Fechar'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={
            pending === 'delete' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )
          }
          iconPosition="left"
          onClick={remove}
          disabled={pending !== null}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          Excluir
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
