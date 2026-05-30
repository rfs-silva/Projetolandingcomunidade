'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowRight, Check, Clock, Send, X } from 'lucide-react'

type Status =
  | 'NONE'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'

type Props = {
  challengeNumber: string
  initialStatus: Status
  initialReviewerNote?: string | null
}

export function ChallengeActionButton({
  challengeNumber,
  initialStatus,
  initialReviewerNote,
}: Props) {
  const [status, setStatus] = useState<Status>(initialStatus)
  const reviewerNote = initialReviewerNote ?? null
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function start() {
    setError(null)
    const res = await fetch(
      `/api/me/challenges/${encodeURIComponent(challengeNumber)}/participation`,
      { method: 'POST' },
    )
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null
      setError(body?.error?.message ?? 'Não foi possível iniciar o desafio.')
      return
    }
    setStatus('IN_PROGRESS')
    startTransition(() => router.refresh())
  }

  async function submit() {
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch(
        `/api/me/challenges/${encodeURIComponent(challengeNumber)}/submit`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            submissionUrl: url,
            submissionNote: note || undefined,
          }),
        },
      )
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null
        setError(body?.error?.message ?? 'Não foi possível enviar a submissão.')
        return
      }
      setStatus('SUBMITTED')
      setOpen(false)
      setUrl('')
      setNote('')
      startTransition(() => router.refresh())
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'APPROVED') {
    return (
      <Button
        type="button"
        variant="outline-primary"
        size="sm"
        className="w-full"
        disabled
        icon={<Check size={14} />}
      >
        Aprovado
      </Button>
    )
  }

  if (status === 'SUBMITTED') {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        disabled
        icon={<Clock size={14} />}
      >
        Em análise
      </Button>
    )
  }

  if (status === 'IN_PROGRESS' || status === 'REJECTED') {
    return (
      <div className="w-full space-y-1">
        {status === 'REJECTED' && reviewerNote ? (
          <p className="text-xs text-red-400">Revisor: {reviewerNote}</p>
        ) : null}
        <Button
          type="button"
          variant="outline-primary"
          size="sm"
          className="w-full"
          onClick={() => setOpen(true)}
          icon={<Send size={14} />}
          iconPosition="right"
        >
          {status === 'REJECTED' ? 'Reenviar submissão' : 'Submeter desafio'}
        </Button>
        {error ? <p className="text-xs text-red-400">{error}</p> : null}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar submissão</DialogTitle>
              <DialogDescription>
                Compartilhe o link do seu trabalho (GitHub, demo, vídeo). A
                liderança vai revisar antes da aprovação.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">
                  URL da submissão
                </span>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="mt-1 w-full bg-background-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">
                  Observação (opcional)
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="O que você fez, como rodar, etc."
                  className="mt-1 w-full bg-background-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </label>
              {error ? <p className="text-xs text-red-400">{error}</p> : null}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                icon={<X size={14} />}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                loading={submitting}
                disabled={!url}
                onClick={submit}
                icon={<Send size={14} />}
                iconPosition="right"
              >
                Enviar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
        onClick={start}
        icon={<ArrowRight size={14} />}
        iconPosition="right"
        className="w-full"
      >
        Iniciar desafio
      </Button>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  )
}

export type { Status as ChallengeButtonStatus }
