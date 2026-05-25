'use client'

import { useTransition, useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MentorshipKind } from '@/server/schemas/mentorship.schema'

type Action = (formData: FormData) => Promise<{ error?: string } | void>

type Labels = {
  goalLabel: string
  goalPlaceholder: string
  availabilityLabel: string
  availabilityPlaceholder: string
  stackLabel: string
  stackPlaceholder: string
  submitLabel: string
}

const LABELS_BY_KIND: Record<MentorshipKind, Labels> = {
  MENTEE: {
    goalLabel: 'O que você quer alcançar?',
    goalPlaceholder:
      'Ex: melhorar minha base em system design para entrevistas sênior em 6 meses.',
    availabilityLabel: 'Sua disponibilidade',
    availabilityPlaceholder: 'Ex: terça e quinta à noite, 1h por encontro',
    stackLabel: 'Stack / área que quer aprender',
    stackPlaceholder: 'Ex: Node.js, system design, backend',
    submitLabel: 'Quero ser mentorado',
  },
  MENTOR: {
    goalLabel: 'O que você pode oferecer?',
    goalPlaceholder:
      'Ex: 8 anos atuando como backend sênior, posso ajudar com arquitetura, carreira e entrevistas.',
    availabilityLabel: 'Disponibilidade para mentorar',
    availabilityPlaceholder: 'Ex: 1h por semana, terças à noite',
    stackLabel: 'Stack / área que você domina',
    stackPlaceholder: 'Ex: Go, Kubernetes, sistemas distribuídos',
    submitLabel: 'Quero ser mentor',
  },
}

export function MentorshipForm({
  kind,
  action,
}: {
  kind: MentorshipKind
  action: Action
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const labels = LABELS_BY_KIND[kind]

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
      <input type="hidden" name="kind" value={kind} />

      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Textarea
        label={labels.goalLabel}
        name="goal"
        required
        rows={4}
        placeholder={labels.goalPlaceholder}
      />

      <Field
        label={labels.availabilityLabel}
        name="availability"
        required
        placeholder={labels.availabilityPlaceholder}
      />

      <Field
        label={labels.stackLabel}
        name="stack"
        required
        placeholder={labels.stackPlaceholder}
      />

      <Button
        type="submit"
        variant="default"
        disabled={isPending}
        icon={isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        iconPosition="left"
        className="self-start h-11 px-6"
      >
        {isPending ? 'Enviando...' : labels.submitLabel}
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
