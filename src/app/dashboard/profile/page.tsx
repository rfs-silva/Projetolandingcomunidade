import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { ArrowLeft, LogOut } from 'lucide-react'
import { auth, signOut } from '@/auth'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { profileService } from '@/server/services/profile.service'

export const metadata = {
  title: 'Meu perfil · Comunidade Roraima',
}

export const dynamic = 'force-dynamic'

import { ProfileForm } from './ProfileForm'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/dashboard/profile')

  const onboarded = await profileService.hasCompletedOnboarding(session.user.id)
  if (!onboarded) redirect('/onboarding')

  const profile = await profileService.getDtoByUserId(session.user.id)
  const user = session.user

  async function updateAction(formData: FormData): Promise<{ error?: string } | void> {
    'use server'
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Sessão expirada. Faça login novamente.' }
    }

    const raw = {
      displayName: formData.get('displayName'),
      type: formData.get('type'),
      linkedinUrl: formData.get('linkedinUrl'),
      location: formData.get('location'),
      bio: formData.get('bio'),
    }

    try {
      await profileService.update(session.user.id, raw)
      revalidatePath('/dashboard/profile')
      revalidatePath('/dashboard')
    } catch (err) {
      if (err instanceof ZodError) {
        return { error: err.issues[0]?.message ?? 'Dados inválidos' }
      }
      console.error('[profile/update] error', err)
      return { error: 'Não foi possível salvar. Tente novamente.' }
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-subtle">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Comunidade" width={32} height={32} />
            <span className="text-sm font-medium text-foreground">
              Comunidade Roraima
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <UserAvatar
              src={user.image}
              name={profile.displayName}
              seed={user.githubUsername ?? user.id}
            />
            <span className="hidden sm:inline text-sm text-muted-foreground">
              {profile.displayName}
            </span>
            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/' })
              }}
            >
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                icon={<LogOut size={16} />}
                iconPosition="left"
              >
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Voltar para o painel
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <UserAvatar
            size="lg"
            src={user.image}
            name={profile.displayName}
            seed={user.githubUsername ?? user.id}
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
              Meu perfil
            </h1>
            <p className="text-sm text-muted-foreground">
              Atualize seus dados — outros membros poderão encontrar você pelo
              mural.
            </p>
          </div>
        </div>

        <ProfileForm profile={profile} action={updateAction} />
      </section>
    </main>
  )
}
