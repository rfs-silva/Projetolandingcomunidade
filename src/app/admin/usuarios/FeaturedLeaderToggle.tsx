'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Star, StarOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  userId: string
  initialFeatured: boolean
  initialRole: string | null
}

export function FeaturedLeaderToggle({
  userId,
  initialFeatured,
  initialRole,
}: Props) {
  const router = useRouter()
  const [featured, setFeatured] = useState(initialFeatured)
  const [role, setRole] = useState(initialRole ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

  async function save(nextFeatured: boolean, nextRole: string) {
    setError(null)
    setSaving(true)
    try {
      const res = await fetch(
        `/api/admin/users/${userId}/featured-leader`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            featured: nextFeatured,
            role: nextRole.trim() === '' ? null : nextRole.trim(),
          }),
        },
      )
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null
        setError(body?.error?.message ?? 'Não foi possível salvar.')
        return
      }
      setFeatured(nextFeatured)
      setEditing(false)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  if (!featured && !editing) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setEditing(true)}
          icon={<Star size={14} />}
        >
          Destacar
        </Button>
      </div>
    )
  }

  if (featured && !editing) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
          <Star size={10} />{' '}
          {initialRole && initialRole.trim() !== ''
            ? initialRole
            : 'Em destaque'}
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setEditing(true)}
          >
            Editar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            loading={saving}
            onClick={() => save(false, '')}
            icon={<StarOff size={12} />}
          >
            Remover
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 w-full md:w-72 flex flex-col gap-2">
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
        Cargo na landing
      </label>
      <input
        type="text"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        placeholder="Ex: Fundador, Liderança técnica"
        maxLength={80}
        className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
      />
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setEditing(false)
            setRole(initialRole ?? '')
            setError(null)
          }}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="default"
          size="sm"
          disabled={saving}
          onClick={() => save(true, role)}
          icon={
            saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Star size={14} />
            )
          }
        >
          {featured ? 'Salvar' : 'Destacar'}
        </Button>
      </div>
    </div>
  )
}
