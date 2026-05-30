'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Award, Check, Clock, ExternalLink, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/UserAvatar'

type Status = 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'

type Item = {
  id: string
  status: Status
  submissionUrl: string | null
  submissionNote: string | null
  reviewerNote: string | null
  startedAt: string
  submittedAt: string | null
  reviewedAt: string | null
  user: {
    id: string
    displayName: string
    githubUsername: string
    avatarUrl: string | null
  }
}

const STATUS_LABEL: Record<Status, string> = {
  IN_PROGRESS: 'Em andamento',
  SUBMITTED: 'Em análise',
  APPROVED: 'Aprovada',
  REJECTED: 'Devolvida',
}

const STATUS_CLASS: Record<Status, string> = {
  IN_PROGRESS:
    'bg-background-secondary text-muted-foreground border border-zinc-700/50',
  SUBMITTED: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
  APPROVED: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
  REJECTED: 'bg-red-500/10 text-red-300 border border-red-500/30',
}

const STATUS_ICON: Record<Status, React.ReactNode> = {
  IN_PROGRESS: <Send size={12} />,
  SUBMITTED: <Clock size={12} />,
  APPROVED: <Award size={12} />,
  REJECTED: <X size={12} />,
}

export function ParticipationsList({
  items,
  points,
}: {
  items: Item[]
  points: number
}) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rejectFor, setRejectFor] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted-foreground">
        Nenhuma participação nos filtros atuais.
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
    <div className="flex flex-col gap-3">
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
              <span
                className={
                  'inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ' +
                  STATUS_CLASS[it.status]
                }
              >
                {STATUS_ICON[it.status]}
                {STATUS_LABEL[it.status]}
              </span>
            </div>
          </div>

          {it.submissionUrl ? (
            <a
              href={it.submissionUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-sm text-primary-destaque hover:underline break-all"
            >
              <ExternalLink size={12} /> {it.submissionUrl}
            </a>
          ) : null}

          {it.submissionNote ? (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Observação do membro
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {it.submissionNote}
              </p>
            </div>
          ) : null}

          {it.reviewerNote ? (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Nota da revisão
              </div>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                {it.reviewerNote}
              </p>
            </div>
          ) : null}

          <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
            <span>
              Início: {new Date(it.startedAt).toLocaleString('pt-BR')}
            </span>
            {it.submittedAt ? (
              <span>
                Enviado: {new Date(it.submittedAt).toLocaleString('pt-BR')}
              </span>
            ) : null}
            {it.reviewedAt ? (
              <span>
                Revisado: {new Date(it.reviewedAt).toLocaleString('pt-BR')}
              </span>
            ) : null}
          </div>

          {it.status === 'SUBMITTED' ? (
            rejectFor === it.id ? (
              <div className="rounded-lg border border-border bg-background-secondary p-3 space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Motivo da devolução (visível para o membro)
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
                  Aprovar (+{points} pts)
                </Button>
              </div>
            )
          ) : null}
        </article>
      ))}
    </div>
  )
}
