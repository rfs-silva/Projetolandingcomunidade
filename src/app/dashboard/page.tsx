import Link from 'next/link'
import {
  ArrowRight,
  Calendar,
  FolderGit2,
  Lightbulb,
  Pencil,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { requireDashboardSession } from '@/server/lib/dashboard-session'

export const metadata = {
  title: 'Painel · Comunidade Roraima',
}

export const dynamic = 'force-dynamic'

const PROFILE_TYPE_LABEL: Record<string, string> = {
  MEMBER: 'Membro',
  COMPANY: 'Empresa parceira',
  LEADER: 'Liderança',
  FOUNDER: 'Fundador',
}

export default async function DashboardPage() {
  const { profile, image, githubUsername } = await requireDashboardSession('/dashboard')

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground">
        Olá, {profile.displayName.split(' ')[0]} 👋
      </h1>
      <p className="mt-2 text-muted-foreground">
        Sua área de membro. Mantenha seu perfil atualizado para que outros
        devs te encontrem.
      </p>

      <div className="mt-10 rounded-2xl border border-subtle bg-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <UserAvatar
            size="lg"
            src={image}
            name={profile.displayName}
            seed={githubUsername}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold text-foreground">
                {profile.displayName}
              </h2>
              <span className="text-xs uppercase tracking-wider text-primary-destaque bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-full">
                {PROFILE_TYPE_LABEL[profile.type] ?? profile.type}
              </span>
            </div>
            {profile.bio ? (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {profile.bio}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground italic">
                Sem bio — conte um pouco sobre você.
              </p>
            )}

            {profile.tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.tags.slice(0, 8).map((tag) => (
                  <span
                    key={tag.id}
                    className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-background-secondary text-muted-foreground border border-zinc-700/50"
                  >
                    {tag.label}
                  </span>
                ))}
                {profile.tags.length > 8 ? (
                  <span className="text-[10px] text-muted-foreground self-center">
                    +{profile.tags.length - 8}
                  </span>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                Adicione tags no seu perfil para aparecer no mural.
              </p>
            )}
          </div>
          <Link href="/dashboard/profile" className="shrink-0">
            <Button
              type="button"
              variant="outline-primary"
              icon={<Pencil size={16} />}
              iconPosition="left"
              className="w-full md:w-auto h-10"
            >
              Editar perfil
            </Button>
          </Link>
        </div>
      </div>

      <h3 className="mt-12 mb-4 text-sm uppercase tracking-wider text-muted-foreground">
        Explore
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActiveCard
          href="/dashboard/membros"
          icon={<Users size={20} />}
          title="Mural de membros"
          desc="Descubra devs por stack e tipo de perfil."
        />
        <ActiveCard
          href="/dashboard/eventos"
          icon={<Calendar size={20} />}
          title="Eventos"
          desc="Eventos públicos e exclusivos para membros."
        />
        <ActiveCard
          href="/dashboard/desafios"
          icon={<Target size={20} />}
          title="Desafios"
          desc="Pratique com desafios da comunidade."
        />
        <ActiveCard
          href="/dashboard/mentoria"
          icon={<Lightbulb size={20} />}
          title="Mentoria"
          desc="Candidate-se ao programa de mentoria."
        />
        <ActiveCard
          href="/dashboard/projetos"
          icon={<FolderGit2 size={20} />}
          title="Mural de projetos"
          desc="Publique seus projetos e veja os da comunidade."
        />
      </div>

      <div className="mt-10 rounded-2xl border border-primary/30 bg-primary/5 p-6 flex flex-col md:flex-row md:items-center gap-4">
        <Sparkles size={20} className="text-primary-destaque shrink-0" />
        <p className="text-sm text-foreground flex-1">
          Seu perfil está pronto para o mural. Quanto mais tags relevantes,
          mais fácil ser encontrado por outros devs.
        </p>
        <Link href="/dashboard/profile" className="shrink-0">
          <Button
            type="button"
            variant="default"
            icon={<ArrowRight size={16} />}
            iconPosition="right"
            size="sm"
          >
            Completar perfil
          </Button>
        </Link>
      </div>
    </section>
  )
}

function ActiveCard({
  href,
  icon,
  title,
  desc,
}: {
  href: string
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-subtle bg-card p-6 hover:border-primary/40 transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque mb-3">
        {icon}
      </div>
      <h4 className="text-base font-medium text-foreground group-hover:text-primary-destaque transition-colors">
        {title}
      </h4>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs text-primary-destaque opacity-0 group-hover:opacity-100 transition-opacity">
        Abrir <ArrowRight size={12} />
      </span>
    </Link>
  )
}
