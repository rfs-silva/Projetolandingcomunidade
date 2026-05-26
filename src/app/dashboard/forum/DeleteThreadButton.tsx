'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DeleteThreadButton({ threadId }: { threadId: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  async function onClick() {
    if (!confirm('Excluir este tópico? Esta ação não pode ser desfeita.')) return
    setError(null)
    setPending(true)
    const res = await fetch(`/api/me/forum/threads/${threadId}`, {
      method: 'DELETE',
    })
    setPending(false)
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setError(body?.error?.message ?? 'Falha ao excluir.')
      return
    }
    startTransition(() => {
      router.push('/dashboard/forum')
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-1 items-end">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClick}
        disabled={pending}
        icon={pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        iconPosition="left"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        Excluir
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
