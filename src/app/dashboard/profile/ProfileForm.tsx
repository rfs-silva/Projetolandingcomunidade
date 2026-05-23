'use client'

import { useTransition, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProfileDto } from '@/server/schemas/profile.schema'

type Action = (formData: FormData) => Promise<{ error?: string } | void>

export function ProfileForm({
  profile,
  action,
}: {
  profile: ProfileDto
  action: Action
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function onSubmit(formData: FormData) {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await action(formData)
      if (result && 'error' in result && result.error) {
        setError(result.error)
        return
      }
      setSaved(true)
    })
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-5">
      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {saved ? (
        <div className="rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-400 flex items-center gap-2">
          <Check size={16} /> Perfil atualizado com sucesso.
        </div>
      ) : null}

      <Field
        label="Nome de exibição"
        name="displayName"
        required
        defaultValue={profile.displayName}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">
          Tipo de perfil
        </label>
        <div className="grid grid-cols-2 gap-3">
          <RadioCard
            name="type"
            value="MEMBER"
            title="Membro"
            description="Desenvolvedor(a) ou estudante."
            defaultChecked={profile.type === 'MEMBER'}
          />
          <RadioCard
            name="type"
            value="COMPANY"
            title="Empresa parceira"
            description="Representante de empresa do ecossistema."
            defaultChecked={profile.type === 'COMPANY'}
          />
        </div>
        {(profile.type === 'LEADER' || profile.type === 'FOUNDER') && (
          <p className="text-xs text-muted-foreground">
            Seu tipo atual é <strong>{profile.type}</strong>, atribuído pela
            organização. Editar aqui rebaixa para Membro ou Empresa.
          </p>
        )}
      </div>

      <Field
        label="LinkedIn"
        name="linkedinUrl"
        type="url"
        placeholder="https://www.linkedin.com/in/seu-perfil"
        defaultValue={profile.linkedinUrl ?? ''}
      />

      <Field
        label="Localização"
        name="location"
        placeholder="Ex.: Boa Vista, RR"
        defaultValue={profile.location ?? ''}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="bio" className="text-sm font-medium text-foreground">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          maxLength={280}
          rows={3}
          defaultValue={profile.bio ?? ''}
          placeholder="Conte em poucas palavras o que você faz."
          className="w-full rounded-xl border border-subtle bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      <Button
        type="submit"
        variant="default"
        disabled={isPending}
        icon={isPending ? <Loader2 size={16} className="animate-spin" /> : null}
        iconPosition="left"
        className="self-start h-11 px-6"
      >
        {isPending ? 'Salvando...' : 'Salvar alterações'}
      </Button>
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

function RadioCard({
  name,
  value,
  title,
  description,
  defaultChecked,
}: {
  name: string
  value: string
  title: string
  description: string
  defaultChecked?: boolean
}) {
  return (
    <label className="relative flex flex-col gap-1 rounded-xl border border-subtle bg-background p-4 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="sr-only peer"
        required
      />
      <span className="text-sm font-medium text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </label>
  )
}
