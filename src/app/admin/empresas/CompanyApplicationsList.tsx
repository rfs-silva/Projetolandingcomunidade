'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Check,
  ExternalLink,
  Linkedin,
  Mail,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type Status = 'PENDING' | 'APPROVED' | 'REJECTED'

type Item = {
  id: string
  companyName: string
  contactName: string
  email: string
  website: string | null
  linkedinUrl: string | null
  description: string
  status: Status
  reviewerNote: string | null
  reviewedAt: string | null
  createdAt: string
}

const STATUS_LABEL: Record<Status, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovada',
  REJECTED: 'Recusada',
}

const STATUS_CLASS: Record<Status, string> = {
  PENDING: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
  APPROVED:
    'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
  REJECTED: 'bg-red-500/10 text-red-300 border border-red-500/30',
}

export function CompanyApplicationsList({ items }: { items: Item[] }) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rejectFor, setRejectFor] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted-foreground">
        Nenhuma candidatura nesse filtro.
      </div>
    )
  }

  async function approve(id: string) {
    setError(null)
    setPendingId(id)
    try {
      const res = await fetch(`/api/admin/empresas/${id}/approve`, {
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
      const res = await fetch(`/api/admin/empresas/${id}/reject`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reviewerNote: rejectNote }),
      })
      if (!res.ok) {
        const b = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null
        setError(b?.error?.message ?? 'Não foi possível recusar.')
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
            <div className="flex items-start gap-3 min-w-0">
              <span className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 text-primary-destaque flex items-center justify-center shrink-0">
                <Building2 size={18} />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-foreground">
                  {it.companyName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Contato: {it.contactName}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  <a
                    href={`mailto:${it.email}`}
                    className="inline-flex items-center gap-1 text-primary-destaque hover:underline"
                  >
                    <Mail size={11} /> {it.email}
                  </a>
                  {it.website ? (
                    <a
                      href={it.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink size={11} /> Site
                    </a>
                  ) : null}
                  {it.linkedinUrl ? (
                    <a
                      href={it.linkedinUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <Linkedin size={11} /> LinkedIn
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
            <span
              className={
                'inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ' +
                STATUS_CLASS[it.status]
              }
            >
              {STATUS_LABEL[it.status]}
            </span>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Sobre a empresa
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {it.description}
            </p>
          </div>

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
              Recebida em {new Date(it.createdAt).toLocaleString('pt-BR')}
            </span>
            {it.reviewedAt ? (
              <span>
                Revisada em {new Date(it.reviewedAt).toLocaleString('pt-BR')}
              </span>
            ) : null}
          </div>

          {it.status === 'PENDING' ? (
            rejectFor === it.id ? (
              <div className="rounded-lg border border-border bg-background-secondary p-3 space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Motivo da recusa (registrado internamente)
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
                    Confirmar recusa
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
                  Recusar
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  loading={pendingId === it.id}
                  onClick={() => approve(it.id)}
                  icon={<Check size={14} />}
                >
                  Aprovar empresa
                </Button>
              </div>
            )
          ) : null}
        </article>
      ))}
    </div>
  )
}
