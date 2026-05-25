import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { requireDashboardSession } from '@/server/lib/dashboard-session'
import { profileService } from '@/server/services/profile.service'
import { tagsService } from '@/server/services/tags.service'

export const metadata = {
  title: 'Meu perfil · Comunidade Roraima',
}

export const dynamic = 'force-dynamic'

import { ProfileForm } from './ProfileForm'
import { TagsManager } from './TagsManager'

export default async function ProfilePage() {
  const { profile, image, githubUsername } =
    await requireDashboardSession('/dashboard/profile')
  const allTags = await tagsService.list({})

  async function updateAction(formData: FormData): Promise<{ error?: string } | void> {
    'use server'
    const { userId } = await requireDashboardSession('/dashboard/profile')

    const raw = {
      displayName: formData.get('displayName'),
      type: formData.get('type'),
      linkedinUrl: formData.get('linkedinUrl'),
      location: formData.get('location'),
      bio: formData.get('bio'),
    }

    try {
      await profileService.update(userId, raw)
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
          src={image}
          name={profile.displayName}
          seed={githubUsername}
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

      <div className="mt-12 pt-8 border-t border-subtle">
        <h2 className="text-xl font-semibold text-foreground">
          Minhas tags
        </h2>
        <p className="text-sm text-muted-foreground mt-1 mb-5">
          Adicione sua stack e interesses. Outros membros poderão te
          encontrar pelo mural usando essas tags.
        </p>
        <TagsManager initialSelected={profile.tags} allTags={allTags} />
      </div>
    </section>
  )
}
