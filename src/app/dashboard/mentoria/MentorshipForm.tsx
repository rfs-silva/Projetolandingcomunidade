'use client'

import { useTransition, useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Action = (formData: FormData) => Promise<{ error?: string } | void>

export function MentorshipForm({ action }: { action: Action }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await action(formData)
      if (result && 'error' in result && result.error) {
        setError(result.error)
      }
    })
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-5">
      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Textarea
        label="O que você quer alcançar?"
        name="goal"
        required
        rows={4}
        placeholder="Ex: melhorar minha base em system design para passar em entrevistas sênior em 6 meses."
      />

      <Field
        label="Disponibilidade"
        name="availability"
        required
        placeholder="Ex: terça e quinta à noite, 1h por encontro"
      />

      <Field
        label="Stack / área de interesse"
        name="stack"
        required
        placeholder="Ex: Node.js, system design, backend"
      />

      <Button
        type="submit"
        variant="default"
        disabled={isPending}
        icon={isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        iconPosition="left"
        className="self-start h-11 px-6"
      >
        {isPending ? 'Enviando...' : 'Enviar candidatura'}
      </Button>
    </form>
  )
}

function Field({
  label,
  name,
  required,
  placeholder,
}: {
  label: string
  name: string
  required?: boolean
  placeholder?: string
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
        type="text"
        required={required}
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
  placeholder,
  rows = 3,
}: {
  label: string
  name: string
  required?: boolean
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
        placeholder={placeholder}
        className="w-full rounded-xl border border-subtle bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
      />
    </div>
  )
}
