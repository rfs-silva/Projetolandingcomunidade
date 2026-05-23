'use client'

import { useMemo, useState, useTransition } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TagDto } from '@/server/schemas/tag.schema'

const MAX_TAGS = 10

type SelectedTag = { id: string; slug: string; label: string }

export function TagsManager({
  initialSelected,
  allTags,
}: {
  initialSelected: SelectedTag[]
  allTags: TagDto[]
}) {
  const [selected, setSelected] = useState<SelectedTag[]>(initialSelected)
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    const selectedIds = new Set(selected.map((t) => t.id))
    return allTags
      .filter((t) => !selectedIds.has(t.id))
      .filter((t) =>
        q
          ? t.label.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)
          : true,
      )
      .slice(0, 12)
  }, [allTags, selected, query])

  async function addTag(tag: TagDto) {
    if (selected.length >= MAX_TAGS) {
      setError(`Limite de ${MAX_TAGS} tags atingido.`)
      return
    }
    setError(null)
    setPendingId(tag.id)
    // optimistic
    const prev = selected
    setSelected([...selected, { id: tag.id, slug: tag.slug, label: tag.label }])

    startTransition(async () => {
      const res = await fetch('/api/me/profile/tags', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tagId: tag.id }),
      })
      if (!res.ok) {
        setSelected(prev)
        const body = await res.json().catch(() => null)
        setError(body?.error?.message ?? 'Não foi possível adicionar a tag.')
      } else {
        setQuery('')
      }
      setPendingId(null)
    })
  }

  async function removeTag(tag: SelectedTag) {
    setError(null)
    setPendingId(tag.id)
    const prev = selected
    setSelected(selected.filter((t) => t.id !== tag.id))

    startTransition(async () => {
      const res = await fetch(`/api/me/profile/tags/${tag.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        setSelected(prev)
        const body = await res.json().catch(() => null)
        setError(body?.error?.message ?? 'Não foi possível remover a tag.')
      }
      setPendingId(null)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-xl border border-subtle bg-background">
        {selected.length === 0 ? (
          <span className="text-sm text-muted-foreground">
            Nenhuma tag selecionada. Use o campo abaixo para adicionar.
          </span>
        ) : (
          selected.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => removeTag(tag)}
              disabled={pendingId === tag.id}
              className={cn(
                'group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors',
                'bg-primary/10 text-primary-destaque border border-primary/30',
                'hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40',
                'disabled:opacity-50',
              )}
              aria-label={`Remover ${tag.label}`}
            >
              {tag.label}
              {pendingId === tag.id ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <X size={12} className="opacity-70 group-hover:opacity-100" />
              )}
            </button>
          ))
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {selected.length} de {MAX_TAGS} tags
        </span>
      </div>

      <div className="relative">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-subtle bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
          <Search size={16} className="text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar tags (ex: react, python, mentoria...)"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {(query || suggestions.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.length === 0 ? (
              <span className="text-xs text-muted-foreground">
                Nenhuma sugestão encontrada.
              </span>
            ) : (
              suggestions.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => addTag(tag)}
                  disabled={pendingId === tag.id || selected.length >= MAX_TAGS}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors',
                    'bg-background-secondary border border-subtle text-muted-foreground',
                    'hover:bg-primary/10 hover:text-primary-destaque hover:border-primary/30',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                  )}
                >
                  {tag.label}
                  {pendingId === tag.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <span className="text-xs opacity-50">+</span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
