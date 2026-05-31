'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CompanyApplyForm() {
  const [submitted, setSubmitted] = useState<{ companyName: string } | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function onSubmit(formData: FormData) {
    setError(null)
    const payload = {
      companyName: formData.get('companyName'),
      contactName: formData.get('contactName'),
      email: formData.get('email'),
      website: formData.get('website') || null,
      linkedinUrl: formData.get('linkedinUrl') || null,
      description: formData.get('description'),
    }

    startTransition(async () => {
      const res = await fetch('/api/empresas', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: { message?: string; details?: { message?: string }[] } }
          | null
        const msg =
          body?.error?.details?.[0]?.message ??
          body?.error?.message ??
          'Não foi possível enviar a candidatura.'
        setError(msg)
        return
      }
      const json = (await res.json()) as {
        data: { companyName: string }
      }
      setSubmitted({ companyName: json.data.companyName })
    })
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-center mb-3">
          <CheckCircle2 size={22} />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Candidatura recebida!
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Recebemos a candidatura da{' '}
          <strong className="text-foreground">{submitted.companyName}</strong>.
          A liderança vai avaliar e responder pelo email informado.
        </p>
      </div>
    )
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-5">
      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Field
        label="Nome da empresa"
        name="companyName"
        required
        placeholder="Ex: Acme Tecnologia LTDA"
      />
      <Field
        label="Nome do responsável"
        name="contactName"
        required
        placeholder="Quem está enviando esta candidatura"
      />
      <Field
        label="Email de contato"
        name="email"
        type="email"
        required
        placeholder="contato@empresa.com.br"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Site (opcional)"
          name="website"
          type="url"
          placeholder="https://empresa.com.br"
        />
        <Field
          label="LinkedIn (opcional)"
          name="linkedinUrl"
          type="url"
          placeholder="https://linkedin.com/company/..."
        />
      </div>
      <Textarea
        label="Sobre a empresa e o que pretende fazer na comunidade"
        name="description"
        required
        rows={5}
        placeholder="Conte rapidamente o que sua empresa faz, com que stacks trabalha e o que pretende contribuir (mín. 30 caracteres)."
      />

      <Button
        type="submit"
        variant="default"
        disabled={isPending}
        icon={
          isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )
        }
        iconPosition="right"
        className="h-11 mt-2"
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
  type = 'text',
}: {
  label: string
  name: string
  required?: boolean
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
  rows = 4,
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
