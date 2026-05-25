'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TagDto } from '@/server/schemas/tag.schema'

const MAX_TAGS = 8

type Initial = {
  id?: string
  title?: string
  description?: string
  category?: 'Front-end' | 'Back-end' | 'Mobile' | 'Fullstack'
  visibility?: 'PUBLIC' | 'MEMBERS'
  image?: string
  demoUrl?: string
  repoUrl?: string
  tagIds?: string[]
}

export function ProjectForm({
  initial,
  allTags,
}: {
  initial?: Initial
  allTags: TagDto[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initial?.tagIds ?? [],
  )
  const [tagQuery, setTagQuery] = useState('')

  const isEditing = !!initial?.id

  const selectedTags = allTags.filter((t) => selectedTagIds.includes(t.id))
  const suggestions = allTags
    .filter((t) => !selectedTagIds.includes(t.id))
    .filter((t) => {
      const q = tagQuery.trim().toLowerCase()
      if (!q) return true
      return (
        t.label.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)
      )
    })
    .slice(0, 10)

  function toggleTag(id: string) {
    setSelectedTagIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id)
      if (prev.length >= MAX_TAGS) return prev
      return [...prev, id]
    })
  }

  async function onSubmit(formData: FormData) {
    setError(null)
    const payload = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      visibility: formData.get('visibility'),
      image: formData.get('image'),
      demoUrl: formData.get('demoUrl'),
      repoUrl: formData.get('repoUrl'),
      tagIds: selectedTagIds,
    }

    const url = isEditing
      ? `/api/me/projects/${initial!.id}`
      : '/api/me/projects'
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
      router.push('/dashboard/projetos')
      router.refresh()
    })
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-5">
      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Field
        label="Título"
        name="title"
        required
        defaultValue={initial?.title}
        placeholder="Ex: API de pagamentos"
      />

      <Textarea
        label="Descrição"
        name="description"
        required
        rows={4}
        defaultValue={initial?.description}
        placeholder="Conte o que o projeto faz e o que aprendeu construindo."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Categoria"
          name="category"
          required
          defaultValue={initial?.category}
          options={[
            { value: 'Front-end', label: 'Front-end' },
            { value: 'Back-end', label: 'Back-end' },
            { value: 'Mobile', label: 'Mobile' },
            { value: 'Fullstack', label: 'Fullstack' },
          ]}
        />
        <Select
          label="Visibilidade"
          name="visibility"
          required
          defaultValue={initial?.visibility ?? 'MEMBERS'}
          options={[
            { value: 'MEMBERS', label: 'Só membros' },
            { value: 'PUBLIC', label: 'Público (landing)' },
          ]}
        />
      </div>

      <Field
        label="Imagem (URL)"
        name="image"
        type="url"
        defaultValue={initial?.image}
        placeholder="https://..."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Live demo (URL)"
          name="demoUrl"
          type="url"
          defaultValue={initial?.demoUrl}
          placeholder="https://meu-projeto.com"
        />
        <Field
          label="Repositório (URL)"
          name="repoUrl"
          type="url"
          defaultValue={initial?.repoUrl}
          placeholder="https://github.com/user/repo"
        />
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-foreground">
          Tags ({selectedTagIds.length}/{MAX_TAGS})
        </label>

        <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-xl border border-subtle bg-background">
          {selectedTags.length === 0 ? (
            <span className="text-sm text-muted-foreground">
              Nenhuma tag selecionada.
            </span>
          ) : (
            selectedTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-destaque border border-primary/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition-colors"
              >
                {tag.label}
                <X size={12} />
              </button>
            ))
          )}
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-subtle bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
          <Search size={16} className="text-muted-foreground" />
          <input
            type="text"
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
            placeholder="Buscar tag..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestions.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              disabled={selectedTagIds.length >= MAX_TAGS}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors',
                'bg-background-secondary border border-subtle text-muted-foreground',
                'hover:bg-primary/10 hover:text-primary-destaque hover:border-primary/30',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              {tag.label}
              <span className="opacity-50">+</span>
            </button>
          ))}
        </div>
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
          {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Publicar projeto'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/dashboard/projetos')}
          className="h-11 px-6"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  name,
  required,
  defaultValue,
  placeholder,
  type = 'text',
}: {
  label: string
  name: string
  required?: boolean
  defaultValue?: string
  placeholder?: string
  type?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-destructive ml-1">*</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl border border-subtle bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  )
}

function Textarea({
  label,
  name,
  required,
  defaultValue,
  placeholder,
  rows = 3,
}: {
  label: string
  name: string
  required?: boolean
  defaultValue?: string
  placeholder?: string
  rows?: number
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-destructive ml-1">*</span> : null}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl border border-subtle bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
      />
    </div>
  )
}

function Select({
  label,
  name,
  required,
  defaultValue,
  options,
}: {
  label: string
  name: string
  required?: boolean
  defaultValue?: string
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-destructive ml-1">*</span> : null}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-subtle bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
