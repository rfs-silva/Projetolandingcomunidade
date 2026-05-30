'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Initial = {
  id?: string
  number?: string
  title?: string
  description?: string
  dateFull?: string
  dateShort?: string
  type?: 'Remoto' | 'Presencial'
  visibility?: 'PUBLIC' | 'MEMBERS'
  imageIndex?: number
  points?: number
}

export function EventForm({ initial }: { initial?: Initial }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isEditing = !!initial?.id

  async function onSubmit(formData: FormData) {
    setError(null)

    const payload = {
      number: formData.get('number'),
      title: formData.get('title'),
      description: formData.get('description'),
      dateFull: formData.get('dateFull'),
      dateShort: formData.get('dateShort'),
      type: formData.get('type'),
      visibility: formData.get('visibility'),
      imageIndex: Number(formData.get('imageIndex')),
      points: Number(formData.get('points')),
    }

    const url = isEditing
      ? `/api/admin/events/${initial!.id}`
      : '/api/admin/events'
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
      router.push('/admin/eventos')
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
          placeholder="#07"
        />
        <Field
          label="Título"
          name="title"
          required
          defaultValue={initial?.title}
          placeholder="Workshop de Go"
        />
      </div>

      <Textarea
        label="Descrição"
        name="description"
        required
        rows={3}
        defaultValue={initial?.description}
        placeholder="O que vai rolar no evento, palestrantes, público alvo..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Data completa"
          name="dateFull"
          required
          defaultValue={initial?.dateFull}
          placeholder="Sábado, 18 de Outubro às 9h"
        />
        <Field
          label="Data curta (badge)"
          name="dateShort"
          required
          defaultValue={initial?.dateShort}
          placeholder="18 de Outubro"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Select
          label="Modalidade"
          name="type"
          required
          defaultValue={initial?.type ?? 'Remoto'}
          options={[
            { value: 'Remoto', label: 'Remoto' },
            { value: 'Presencial', label: 'Presencial' },
          ]}
        />
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
          defaultValue={String(initial?.imageIndex ?? 200)}
          placeholder="200"
        />
        <Field
          label="Pontos (1-100)"
          name="points"
          type="number"
          required
          defaultValue={String(initial?.points ?? 10)}
          placeholder="10"
        />
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
          {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar evento'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/eventos')}
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
