'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  FORUM_CATEGORY_LABELS,
  type ForumCategory,
} from '@/server/schemas/forum.schema'

type Initial = {
  id?: string
  title?: string
  body?: string
  category?: ForumCategory
}

export function ThreadForm({
  initial,
  canPostAnnouncements,
}: {
  initial?: Initial
  canPostAnnouncements: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isEditing = !!initial?.id

  async function onSubmit(formData: FormData) {
    setError(null)

    const payload = {
      title: formData.get('title'),
      body: formData.get('body'),
      category: formData.get('category'),
    }

    const url = isEditing
      ? `/api/me/forum/threads/${initial!.id}`
      : '/api/me/forum/threads'
    const method = isEditing ? 'PUT' : 'POST'

    startTransition(async () => {
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        const msg =
          body?.error?.details?.[0]?.message ??
          body?.error?.message ??
          'Não foi possível salvar.'
        setError(msg)
        return
      }
      const json = await res.json().catch(() => null)
      const id = json?.data?.id ?? initial?.id
      if (id) {
        router.push(`/dashboard/forum/${id}`)
      } else {
        router.push('/dashboard/forum')
      }
      router.refresh()
    })
  }

  const categoryOptions = Object.entries(FORUM_CATEGORY_LABELS).filter(
    ([value]) => canPostAnnouncements || value !== 'ANUNCIOS',
  )

  return (
    <form action={onSubmit} className="flex flex-col gap-5">
      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-medium text-foreground">
          Título <span className="text-destructive">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initial?.title}
          placeholder="Qual o tema do tópico?"
          className="w-full rounded-xl border border-subtle bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="text-sm font-medium text-foreground">
          Categoria <span className="text-destructive">*</span>
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={initial?.category ?? 'GERAL'}
          className="w-full rounded-xl border border-subtle bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {categoryOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {!canPostAnnouncements ? (
          <p className="text-xs text-muted-foreground">
            Anúncios só podem ser postados por lideranças.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="body" className="text-sm font-medium text-foreground">
          Conteúdo <span className="text-destructive">*</span>
        </label>
        <textarea
          id="body"
          name="body"
          rows={12}
          required
          defaultValue={initial?.body}
          placeholder={
            'Markdown suportado:\n\n**negrito** *itálico* `código`\n- listas\n- com itens\n\n[links](https://...)'
          }
          className="w-full rounded-xl border border-subtle bg-background px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
        />
        <p className="text-xs text-muted-foreground">
          Markdown será renderizado quando o tópico for publicado.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="default"
          disabled={isPending}
          icon={isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          iconPosition="left"
          className="h-11 px-6"
        >
          {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Publicar tópico'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="h-11 px-6"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
