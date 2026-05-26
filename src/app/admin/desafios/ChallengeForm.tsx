'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ICON_NAMES = ['Monitor', 'Layers'] as const

type Tag = { iconName: string; label: string }

type Initial = {
  id?: string
  number?: string
  title?: string
  description?: string
  imageIndex?: number
  visibility?: 'PUBLIC' | 'MEMBERS'
  tags?: Tag[]
}

export function ChallengeForm({ initial }: { initial?: Initial }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [tags, setTags] = useState<Tag[]>(initial?.tags ?? [])
  const [tagDraft, setTagDraft] = useState<Tag>({
    iconName: 'Monitor',
    label: '',
  })

  const isEditing = !!initial?.id

  function addTag() {
    if (!tagDraft.label.trim()) return
    if (tags.length >= 6) return
    setTags([...tags, { ...tagDraft, label: tagDraft.label.trim() }])
    setTagDraft({ iconName: 'Monitor', label: '' })
  }

  function removeTag(idx: number) {
    setTags(tags.filter((_, i) => i !== idx))
  }

  async function onSubmit(formData: FormData) {
    setError(null)

    const payload = {
      number: formData.get('number'),
      title: formData.get('title'),
      description: formData.get('description'),
      imageIndex: Number(formData.get('imageIndex')),
      visibility: formData.get('visibility'),
      tags,
    }

    const url = isEditing
      ? `/api/admin/challenges/${initial!.id}`
      : '/api/admin/challenges'
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
      router.push('/admin/desafios')
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

      <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-4">
        <Field
          label="Número"
          name="number"
          required
          defaultValue={initial?.number}
          placeholder="#06"
        />
        <Field
          label="Título"
          name="title"
          required
          defaultValue={initial?.title}
          placeholder="Desafio de Performance"
        />
      </div>

      <Textarea
        label="Descrição"
        name="description"
        required
        rows={3}
        defaultValue={initial?.description}
        placeholder="O que o desafio propõe, critérios de avaliação..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Visibilidade"
          name="visibility"
          required
          defaultValue={initial?.visibility ?? 'PUBLIC'}
          options={[
            { value: 'PUBLIC', label: 'Público (landing)' },
            { value: 'MEMBERS', label: 'Só membros' },
          ]}
        />
        <Field
          label="Image index"
          name="imageIndex"
          type="number"
          required
          defaultValue={String(initial?.imageIndex ?? 1)}
          placeholder="1"
        />
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-foreground">
          Tags ({tags.length}/6)
        </label>

        <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-xl border border-subtle bg-background">
          {tags.length === 0 ? (
            <span className="text-sm text-muted-foreground">
              Nenhuma tag adicionada.
            </span>
          ) : (
            tags.map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={() => removeTag(i)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-destaque border border-primary/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition-colors"
              >
                <span className="opacity-60 text-[10px]">{t.iconName}</span>{' '}
                {t.label}
                <X size={12} />
              </button>
            ))
          )}
        </div>

        <div className="grid grid-cols-[120px_1fr_auto] gap-2 items-end">
          <Select
            label="Ícone"
            name="_tagIcon"
            defaultValue={tagDraft.iconName}
            value={tagDraft.iconName}
            onChange={(v) => setTagDraft({ ...tagDraft, iconName: v })}
            options={ICON_NAMES.map((i) => ({ value: i, label: i }))}
          />
          <Field
            label="Rótulo da tag"
            name="_tagLabel"
            value={tagDraft.label}
            onChange={(v) => setTagDraft({ ...tagDraft, label: v })}
            placeholder="Ex: Iniciante"
          />
          <Button
            type="button"
            variant="outline-primary"
            size="sm"
            icon={<Plus size={14} />}
            iconPosition="left"
            onClick={addTag}
            disabled={tags.length >= 6 || !tagDraft.label.trim()}
            className="h-10"
          >
            Adicionar
          </Button>
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
          {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar desafio'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/desafios')}
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
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  name: string
  required?: boolean
  defaultValue?: string
  value?: string
  onChange?: (v: string) => void
  placeholder?: string
  type?: string
}) {
  const controlled = value !== undefined && onChange !== undefined
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-destructive ml-1">*</span> : null}
      </label>
      <input
        id={name}
        name={controlled ? undefined : name}
        type={type}
        required={required}
        defaultValue={controlled ? undefined : defaultValue}
        value={controlled ? value : undefined}
        onChange={controlled ? (e) => onChange!(e.target.value) : undefined}
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
  value,
  onChange,
  options,
}: {
  label: string
  name: string
  required?: boolean
  defaultValue?: string
  value?: string
  onChange?: (v: string) => void
  options: { value: string; label: string }[]
}) {
  const controlled = value !== undefined && onChange !== undefined
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-destructive ml-1">*</span> : null}
      </label>
      <select
        id={name}
        name={controlled ? undefined : name}
        required={required}
        defaultValue={controlled ? undefined : defaultValue}
        value={controlled ? value : undefined}
        onChange={controlled ? (e) => onChange!(e.target.value) : undefined}
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
