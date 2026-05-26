'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ReplyForm({ threadId }: { threadId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLTextAreaElement>(null)

  function onSubmit(formData: FormData) {
    setError(null)
    const body = (formData.get('body') as string)?.trim()
    if (!body || body.length < 2) {
      setError('Resposta muito curta')
      return
    }
    startTransition(async () => {
      const res = await fetch(`/api/me/forum/threads/${threadId}/replies`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ body }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        setError(
          json?.error?.details?.[0]?.message ??
            json?.error?.message ??
            'Não foi possível enviar.',
        )
        return
      }
      if (ref.current) ref.current.value = ''
      router.refresh()
    })
  }

  return (
    <form
      action={onSubmit}
      className="rounded-xl border border-subtle bg-card p-4 flex flex-col gap-3"
    >
      <label htmlFor="body" className="text-sm font-medium text-foreground">
        Responder
      </label>
      <textarea
        id="body"
        ref={ref}
        name="body"
        rows={4}
        placeholder="Markdown suportado — **negrito**, *itálico*, `código`..."
        className="w-full rounded-lg border border-subtle bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
      />
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="default"
          size="sm"
          disabled={isPending}
          icon={isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          iconPosition="left"
        >
          {isPending ? 'Enviando...' : 'Publicar resposta'}
        </Button>
      </div>
    </form>
  )
}
