'use client'

import { useTransition, useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPES = [
  { value: '', label: 'Todos' },
  { value: 'MEMBER', label: 'Membros' },
  { value: 'COMPANY', label: 'Empresas' },
  { value: 'LEADER', label: 'Lideranças' },
  { value: 'FOUNDER', label: 'Fundadores' },
]

type ActiveTag = { slug: string; label: string }

export function MembersFilters({
  total,
  activeTags,
}: {
  total: number
  activeTags: ActiveTag[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [pending, setPending] = useState(false)

  const currentType = searchParams.get('type') ?? ''
  const currentQ = searchParams.get('q') ?? ''
  const [searchValue, setSearchValue] = useState(currentQ)

  useEffect(() => {
    setSearchValue(currentQ)
  }, [currentQ])

  function pushParams(updater: (p: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString())
    updater(params)
    params.delete('page')
    setPending(true)
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
      setPending(false)
    })
  }

  function changeType(type: string) {
    pushParams((p) => {
      if (type) p.set('type', type)
      else p.delete('type')
    })
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    pushParams((p) => {
      if (searchValue.trim()) p.set('q', searchValue.trim())
      else p.delete('q')
    })
  }

  function removeTag(slug: string) {
    const remaining = activeTags.filter((t) => t.slug !== slug).map((t) => t.slug)
    pushParams((p) => {
      if (remaining.length === 0) p.delete('tags')
      else p.set('tags', remaining.join(','))
    })
  }

  function clearAll() {
    setPending(true)
    startTransition(() => {
      router.replace(pathname)
      setPending(false)
    })
  }

  const hasActive = currentType || currentQ || activeTags.length > 0

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={submitSearch}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-subtle bg-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30"
      >
        <Search size={16} className="text-muted-foreground" />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Buscar por nome, bio ou localização..."
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {pending ? (
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        ) : null}
      </form>

      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t.value || 'all'}
            type="button"
            onClick={() => changeType(t.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
              currentType === t.value
                ? 'bg-primary/10 text-primary-destaque border-primary/30'
                : 'bg-background-secondary text-muted-foreground border-subtle hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Tags ativas:
          </span>
          {activeTags.map((tag) => (
            <button
              key={tag.slug}
              type="button"
              onClick={() => removeTag(tag.slug)}
              className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-destaque border border-primary/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition-colors"
            >
              {tag.label}
              <X size={12} className="opacity-70" />
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {total} {total === 1 ? 'membro encontrado' : 'membros encontrados'}
        </span>
        {hasActive ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-primary-destaque hover:underline"
          >
            Limpar filtros
          </button>
        ) : null}
      </div>
    </div>
  )
}
