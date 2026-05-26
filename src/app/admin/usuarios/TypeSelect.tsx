'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import type { ProfileType } from '@/server/schemas/profile.schema'
import { cn } from '@/lib/utils'

const TYPES: { value: ProfileType; label: string; tone: string }[] = [
  { value: 'MEMBER', label: 'Membro', tone: 'border-primary/30 text-primary-destaque' },
  { value: 'COMPANY', label: 'Empresa', tone: 'border-amber-500/30 text-amber-300' },
  { value: 'LEADER', label: 'Liderança', tone: 'border-emerald-500/30 text-emerald-300' },
  { value: 'FOUNDER', label: 'Fundador', tone: 'border-purple-500/30 text-purple-300' },
]

export function TypeSelect({
  userId,
  current,
  isSelf,
}: {
  userId: string
  current: ProfileType
  isSelf: boolean
}) {
  const router = useRouter()
  const [value, setValue] = useState<ProfileType>(current)
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'ok' | 'error'
    message: string
  } | null>(null)
  const [, startTransition] = useTransition()

  async function onChange(next: ProfileType) {
    if (next === current && next === value) return
    setFeedback(null)
    setValue(next)
    setPending(true)

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: next }),
    })
    setPending(false)
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setValue(current)
      setFeedback({
        type: 'error',
        message: body?.error?.message ?? 'Falha ao atualizar.',
      })
      return
    }
    setFeedback({ type: 'ok', message: 'Atualizado' })
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as ProfileType)}
          disabled={pending}
          aria-label="Tipo de perfil"
          className={cn(
            'rounded-lg border bg-background px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30',
            TYPES.find((t) => t.value === value)?.tone ?? 'border-subtle',
          )}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {pending ? <Loader2 size={14} className="animate-spin text-muted-foreground" /> : null}
        {feedback?.type === 'ok' ? (
          <Check size={14} className="text-emerald-400" />
        ) : null}
        {isSelf ? (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            você
          </span>
        ) : null}
      </div>
      {feedback?.type === 'error' ? (
        <p className="text-xs text-destructive">{feedback.message}</p>
      ) : null}
    </div>
  )
}
