'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Award, Check, ExternalLink, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/UserAvatar'

type Item = {
  id: string
  challengeNumber: string
  challengeTitle: string
  points: number
  user: {
    id: string
    displayName: string
    githubUsername: string
    avatarUrl: string | null
  }
  submissionUrl: string | null
  submissionNote: string | null
  submittedAt: string | null
}

export function SubmissionsList({ items }: { items: Item[] }) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rejectFor, setRejectFor] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted-foreground">
        Nenhuma submissão pendente. 🎉
      </div>
    )
  }

  async function approve(id: string) {
    setError(null)
    setPendingId(id)
    try {
      const res = await fetch(`/api/admin/submissoes/${id}/approve`, {
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

  async function reject(id: string) {
    setError(null)
    setPendingId(id)
    try {
      const res = await fetch(`/api/admin/submissoes/${id}/reject`, {
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
    <div className="flex flex-col gap-4">
      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      {items.map((it) => (
        <article
          key={it.id}
          className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <UserAvatar
                size="default"
                src={it.user.avatarUrl}
                name={it.user.displayName}
                seed={it.user.githubUsername}
              />
              <div className="min-w-0">
                <div className="font-medium text-foreground">
                  {it.user.displayName}
                </div>
                <div className="text-xs text-muted-foreground">
                  @{it.user.githubUsername}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wider bg-background-secondary border border-zinc-700/50 text-muted-foreground px-2 py-1 rounded">
                {it.challengeNumber}
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary-destaque border border-primary/30 px-2 py-1 rounded">
                <Award size={12} /> {it.points} pts
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground">
              {it.challengeTitle}
            </h3>
            {it.submissionUrl ? (
              <a
                href={it.submissionUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1 inline-flex items-center gap-1.5 text-sm text-primary-destaque hover:underline break-all"
              >
                <ExternalLink size={12} /> {it.submissionUrl}
              </a>
            ) : null}
            {it.submissionNote ? (
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                {it.submissionNote}
              </p>
            ) : null}
            {it.submittedAt ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Enviado em {new Date(it.submittedAt).toLocaleString('pt-BR')}
              </p>
            ) : null}
          </div>

          {rejectFor === it.id ? (
            <div className="rounded-lg border border-border bg-background-secondary p-3 space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Motivo da devolução (visível para o membro)
              </label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={3}
                placeholder="Ex: A demo está fora do ar. Suba novamente e reenvie."
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
                  onClick={() => reject(it.id)}
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
                onClick={() => approve(it.id)}
                icon={<Check size={14} />}
              >
                Aprovar (+{it.points} pts)
              </Button>
            </div>
          )}
        </article>
      ))}
    </div>
  )
}
