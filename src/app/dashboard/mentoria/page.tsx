import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Handshake,
  Sparkles,
  ShieldX,
} from 'lucide-react'
import { AppError } from '@/server/http/errors'
import { requireDashboardSession } from '@/server/lib/dashboard-session'
import { mentorshipService } from '@/server/services/mentorship.service'
import type {
  ApplicationStatus,
  MentorshipApplicationDto,
  MentorshipKind,
} from '@/server/schemas/mentorship.schema'
import { mentorshipKindSchema } from '@/server/schemas/mentorship.schema'
import { MentorshipForm } from './MentorshipForm'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Mentoria',
}

export const dynamic = 'force-dynamic'

const STATUS: Record<
  ApplicationStatus,
  { label: string; tone: string; icon: React.ReactNode; description: string }
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

const TAB_INFO: Record<
  MentorshipKind,
  { icon: React.ReactNode; title: string; subtitle: string }
> = {
  MENTEE: {
    icon: <Sparkles size={20} />,
    title: 'Como mentorado',
    subtitle: 'Buscar orientação e direção para sua carreira',
  },
  MENTOR: {
    icon: <Handshake size={20} />,
    title: 'Como mentor',
    subtitle: 'Compartilhar sua experiência com a comunidade',
  },
}

export default async function MentorshipPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { userId } = await requireDashboardSession('/dashboard/mentoria')
  const params = await searchParams
  const tabParsed = mentorshipKindSchema.safeParse(params.tab?.toUpperCase())
  const activeKind: MentorshipKind = tabParsed.success ? tabParsed.data : 'MENTEE'

  const applications = await mentorshipService.getLatestAll(userId)
  const current =
    activeKind === 'MENTOR' ? applications.mentor : applications.mentee

  async function applyAction(formData: FormData): Promise<{ error?: string } | void> {
    'use server'
    const { userId } = await requireDashboardSession('/dashboard/mentoria')

    const raw = {
      kind: formData.get('kind'),
      goal: formData.get('goal'),
      availability: formData.get('availability'),
      stack: formData.get('stack'),
    }

    try {
      await mentorshipService.apply(userId, raw)
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

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Voltar para o painel
      </Link>

      <div className="flex items-start gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
          <Handshake size={22} />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
            Programa de mentoria
          </h1>
          <p className="mt-1 text-muted-foreground">
            Mentorias 1:1 conectando quem quer aprender com quem quer ensinar.
          </p>
        </div>
      </div>

      <div className="mt-6 flex border-b border-subtle">
        {(['MENTEE', 'MENTOR'] as MentorshipKind[]).map((k) => {
          const isActive = activeKind === k
          const apps =
            k === 'MENTOR' ? applications.mentor : applications.mentee
          return (
            <Link
              key={k}
              href={`/dashboard/mentoria?tab=${k.toLowerCase()}`}
              scroll={false}
              className={cn(
                'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted',
              )}
            >
              {TAB_INFO[k].icon}
              <span>{TAB_INFO[k].title}</span>
              {apps ? (
                <span className="text-[10px] uppercase tracking-wider text-primary-destaque bg-primary/10 border border-primary/30 px-1.5 py-0.5 rounded ml-1">
                  ativa
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>

      <p className="text-sm text-muted-foreground mt-4 mb-6">
        {TAB_INFO[activeKind].subtitle}
      </p>

      <KindPanel
        current={current}
        kind={activeKind}
        onApply={applyAction}
      />
    </section>
  )
}

function KindPanel({
  current,
  kind,
  onApply,
}: {
  current: MentorshipApplicationDto | null
  kind: MentorshipKind
  onApply: (formData: FormData) => Promise<{ error?: string } | void>
}) {
  const hasOpenApplication =
    current?.status === 'SUBMITTED' || current?.status === 'IN_REVIEW'

  return (
    <>
      {current ? (
        <div
          className={cn(
            'rounded-2xl border p-6 flex flex-col gap-4',
            STATUS[current.status].tone,
          )}
        >
          <div className="flex items-center gap-3">
            {STATUS[current.status].icon}
            <span className="text-xs uppercase tracking-wider">Status</span>
            <span className="text-sm font-semibold">
              {STATUS[current.status].label}
            </span>
          </div>
          <p className="text-sm text-foreground/90">
            {STATUS[current.status].description}
          </p>

          <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <Detail
              label={kind === 'MENTOR' ? 'Stack que ensino' : 'Stack que quero'}
              value={current.stack}
            />
            <Detail label="Disponibilidade" value={current.availability} />
            <Detail
              label="Enviada em"
              value={new Date(current.createdAt).toLocaleDateString('pt-BR')}
            />
          </dl>

          <Detail
            label={kind === 'MENTOR' ? 'O que ofereço' : 'Meu objetivo'}
            value={current.goal}
            multiline
          />

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
            {current ? 'Nova candidatura' : 'Candidate-se'}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Conte seus objetivos e disponibilidade. A coordenação avalia cada
            candidatura individualmente.
          </p>
          <MentorshipForm kind={kind} action={onApply} />
        </div>
      ) : null}
    </>
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
