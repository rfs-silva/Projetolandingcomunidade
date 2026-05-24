import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { ArrowLeft, CheckCircle2, Clock, LogOut, ShieldX, ThumbsUp } from 'lucide-react'
import { auth, signOut } from '@/auth'
import { AppError } from '@/server/http/errors'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { profileService } from '@/server/services/profile.service'
import { mentorshipService } from '@/server/services/mentorship.service'
import type { ApplicationStatus } from '@/server/schemas/mentorship.schema'
import { MentorshipForm } from './MentorshipForm'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Mentoria · Comunidade Roraima',
}

export const dynamic = 'force-dynamic'

const STATUS: Record<
  ApplicationStatus,
  {
    label: string
    tone: string
    icon: React.ReactNode
    description: string
  }
> = {
  SUBMITTED: {
    label: 'Enviada',
    tone: 'border-primary/30 bg-primary/5 text-primary-destaque',
    icon: <Clock size={20} />,
    description: 'Sua candidatura foi recebida e está aguardando análise.',
  },
  IN_REVIEW: {
    label: 'Em análise',
    tone: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    icon: <Clock size={20} />,
    description: 'A coordenação está analisando seu perfil e disponibilidade.',
  },
  ACCEPTED: {
    label: 'Aceita',
    tone: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    icon: <CheckCircle2 size={20} />,
    description: 'Parabéns! Você foi aceito no programa. Entraremos em contato.',
  },
  REJECTED: {
    label: 'Não selecionada',
    tone: 'border-destructive/30 bg-destructive/10 text-destructive',
    icon: <ShieldX size={20} />,
    description:
      'Dessa vez não foi possível. Você pode tentar novamente no próximo ciclo.',
  },
}

export default async function MentorshipPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/dashboard/mentoria')
  const onboarded = await profileService.hasCompletedOnboarding(session.user.id)
  if (!onboarded) redirect('/onboarding')

  const [me, application] = await Promise.all([
    profileService.getDtoByUserId(session.user.id),
    mentorshipService.getLatest(session.user.id),
  ])

  async function applyAction(formData: FormData): Promise<{ error?: string } | void> {
    'use server'
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Sessão expirada. Faça login novamente.' }
    }

    const raw = {
      goal: formData.get('goal'),
      availability: formData.get('availability'),
      stack: formData.get('stack'),
    }

    try {
      await mentorshipService.apply(session.user.id, raw)
      revalidatePath('/dashboard/mentoria')
    } catch (err) {
      if (err instanceof ZodError) {
        return { error: err.issues[0]?.message ?? 'Dados inválidos' }
      }
      if (err instanceof AppError) {
        return { error: err.message }
      }
      console.error('[mentorship/apply] error', err)
      return { error: 'Não foi possível enviar. Tente novamente.' }
    }
  }

  const hasOpenApplication =
    application?.status === 'SUBMITTED' || application?.status === 'IN_REVIEW'

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
              src={session.user.image}
              name={me.displayName}
              seed={session.user.githubUsername ?? session.user.id}
            />
            <span className="hidden sm:inline text-sm text-muted-foreground">
              {me.displayName}
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

      <section className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Voltar para o painel
        </Link>

        <div className="flex items-start gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
            <ThumbsUp size={22} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
              Programa de mentoria
            </h1>
            <p className="mt-1 text-muted-foreground">
              Mentorias 1:1 com profissionais experientes da comunidade.
            </p>
          </div>
        </div>

        {application ? (
          <div
            className={cn(
              'mt-10 rounded-2xl border p-6 flex flex-col gap-4',
              STATUS[application.status].tone,
            )}
          >
            <div className="flex items-center gap-3">
              {STATUS[application.status].icon}
              <span className="text-xs uppercase tracking-wider">
                Status
              </span>
              <span className="text-sm font-semibold">
                {STATUS[application.status].label}
              </span>
            </div>
            <p className="text-sm text-foreground/90">
              {STATUS[application.status].description}
            </p>

            <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Detail label="Stack" value={application.stack} />
              <Detail label="Disponibilidade" value={application.availability} />
              <Detail
                label="Enviada em"
                value={new Date(application.createdAt).toLocaleDateString('pt-BR')}
              />
            </dl>

            <Detail label="Objetivo" value={application.goal} multiline />

            {!hasOpenApplication ? (
              <p className="text-xs text-muted-foreground mt-2">
                Você pode enviar uma nova candidatura abaixo.
              </p>
            ) : null}
          </div>
        ) : null}

        {!hasOpenApplication ? (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-foreground mb-1">
              {application ? 'Nova candidatura' : 'Candidate-se'}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Conte seus objetivos e disponibilidade. Nossa coordenação avalia
              cada candidatura individualmente.
            </p>
            <MentorshipForm action={applyAction} />
          </div>
        ) : null}
      </section>
    </main>
  )
}

function Detail({
  label,
  value,
  multiline,
}: {
  label: string
  value: string
  multiline?: boolean
}) {
  return (
    <div className={multiline ? 'col-span-full' : ''}>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          'mt-0.5 text-foreground',
          multiline ? 'whitespace-pre-wrap text-sm' : 'text-sm',
        )}
      >
        {value}
      </dd>
    </div>
  )
}
