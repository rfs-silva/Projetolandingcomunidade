import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ZodError } from 'zod'
import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { profileService } from '@/server/services/profile.service'

export const metadata = {
  title: 'Complete seu perfil',
}

export const dynamic = 'force-dynamic'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/onboarding')

  const already = await profileService.hasCompletedOnboarding(session.user.id)
  if (already) redirect('/dashboard')

  async function submit(formData: FormData) {
    'use server'
    const session = await auth()
    if (!session?.user?.id) redirect('/login?callbackUrl=/onboarding')

    const raw = {
      displayName: formData.get('displayName'),
      type: formData.get('type'),
      linkedinUrl: formData.get('linkedinUrl'),
      bio: formData.get('bio'),
      acceptedTerms: formData.get('acceptedTerms'),
    }

    try {
      await profileService.completeOnboarding(session.user.id, raw)
    } catch (err) {
      if (err instanceof ZodError) {
        const first = err.issues[0]
        redirect(`/onboarding?error=${encodeURIComponent(first.message)}`)
      }
      throw err
    }

    redirect('/dashboard')
  }

  const user = session.user
  const initialName = user.name ?? user.githubUsername ?? ''

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-xl flex flex-col gap-8 rounded-2xl border border-subtle bg-card p-8 md:p-10">
        <div className="flex items-center gap-4">
          <UserAvatar
            size="lg"
            src={user.image}
            name={user.name ?? user.githubUsername}
            seed={user.githubUsername ?? user.id ?? user.name}
          />
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Complete seu perfil
            </h1>
            <p className="text-sm text-muted-foreground">
              Falta pouco para você acessar a área de membros.
            </p>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <form action={submit} className="flex flex-col gap-5">
          <Field
            label="Nome de exibição"
            name="displayName"
            required
            defaultValue={initialName}
            placeholder="Como quer ser chamado(a) na comunidade"
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
                description="Sou desenvolvedor(a) ou estudante."
                defaultChecked
              />
              <RadioCard
                name="type"
                value="COMPANY"
                title="Empresa parceira"
                description="Represento uma empresa do ecossistema."
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Liderança e Fundador são atribuídos manualmente pela organização.
            </p>
          </div>

          <Field
            label="LinkedIn (opcional)"
            name="linkedinUrl"
            type="url"
            placeholder="https://www.linkedin.com/in/seu-perfil"
          />

          <div className="flex flex-col gap-2">
            <label
              htmlFor="bio"
              className="text-sm font-medium text-foreground"
            >
              Bio (opcional)
            </label>
            <textarea
              id="bio"
              name="bio"
              maxLength={280}
              rows={3}
              placeholder="Conte em poucas palavras o que você faz."
              className="w-full rounded-xl border border-subtle bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="acceptedTerms"
              required
              className="mt-1 h-4 w-4 rounded border-subtle bg-background accent-primary"
            />
            <span className="text-sm text-muted-foreground">
              Li e aceito os{' '}
              <Link
                href="/termos"
                target="_blank"
                className="text-primary hover:underline"
              >
                Termos de Uso
              </Link>{' '}
              e a{' '}
              <Link
                href="/privacidade"
                target="_blank"
                className="text-primary hover:underline"
              >
                Política de Privacidade
              </Link>
              .
            </span>
          </label>

          <Button type="submit" variant="default" className="w-full h-12 mt-2">
            Concluir e entrar
          </Button>
        </form>
      </div>
    </main>
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
