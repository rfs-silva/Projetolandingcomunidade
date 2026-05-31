import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  FileText,
  Mail,
  Shield,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { requireDashboardSession } from '@/server/lib/dashboard-session'
import { meDataService } from '@/server/services/me-data.service'
import { privacyEventsService } from '@/server/services/privacy-events.service'
import { DeleteAccountForm } from './DeleteAccountForm'

export const metadata = {
  title: 'Privacidade',
}

import { DPO_EMAIL } from '@/server/lib/privacy-contact'

export const dynamic = 'force-dynamic'

export default async function PrivacyPage() {
  const { userId, profile } = await requireDashboardSession('/dashboard/privacidade')
  const [payload, events] = await Promise.all([
    meDataService.export(userId),
    privacyEventsService.listForUser(userId, 30),
  ])
  const summary = meDataService.summary(payload)

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Voltar para o painel
      </Link>

      <div className="flex items-start gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
          <Shield size={22} />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
            Privacidade dos seus dados
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Exerça seus direitos previstos no art. 18 da LGPD.
          </p>
        </div>
      </div>

      {/* Resumo dos dados */}
      <section className="mt-10">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
          O que temos sobre você
        </h2>
        <div className="rounded-xl border border-subtle bg-card p-5 flex flex-col gap-3">
          <Row
            label="Conta"
            value={`@${payload.account.githubUsername} · ${payload.account.email ?? 'sem e-mail'}`}
          />
          <Row label="Tipo de perfil" value={profile.type} />
          <Row label="Tags do perfil" value={`${summary.tagsCount} tags`} />
          <Row label="Projetos" value={`${summary.projectsCount}`} />
          <Row
            label="Candidaturas de mentoria"
            value={`${summary.mentorshipCount}`}
          />
          <Row label="Tópicos no fórum" value={`${summary.forumThreadsCount}`} />
          <Row
            label="Respostas no fórum"
            value={`${summary.forumRepliesCount}`}
          />
          <Row
            label="Termos aceitos em"
            value={
              payload.account.acceptedTermsAt
                ? new Date(payload.account.acceptedTermsAt).toLocaleString('pt-BR')
                : '—'
            }
          />
          <Row
            label="Conta criada em"
            value={new Date(payload.account.createdAt).toLocaleString('pt-BR')}
          />
        </div>
      </section>

      {/* Direitos */}
      <section className="mt-10 flex flex-col gap-4">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
          Seus direitos
        </h2>

        {/* Acesso/portabilidade */}
        <div className="rounded-xl border border-subtle bg-card p-5 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <Download size={18} className="text-primary-destaque shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Baixar meus dados (portabilidade)
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Arquivo JSON estruturado com tudo que armazenamos sobre você.
                Você pode importar em outras plataformas ou guardar offline.
              </p>
            </div>
          </div>
          <a
            href="/api/me/data-export"
            download
            className="self-start"
          >
            <Button
              type="button"
              variant="outline-primary"
              size="sm"
              icon={<Download size={14} />}
              iconPosition="left"
            >
              Baixar JSON
            </Button>
          </a>
        </div>

        {/* Correção */}
        <div className="rounded-xl border border-subtle bg-card p-5 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="text-primary-destaque shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Corrigir dados
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Edite nome, bio, LinkedIn, localização, tipo e tags pelo seu
                perfil.
              </p>
            </div>
          </div>
          <Link href="/dashboard/profile" className="self-start">
            <Button type="button" variant="ghost" size="sm">
              Ir para meu perfil
            </Button>
          </Link>
        </div>

        {/* Documentos legais */}
        <div className="rounded-xl border border-subtle bg-card p-5 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <FileText size={18} className="text-primary-destaque shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Política e termos
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Releia o que você aceitou ao entrar.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/privacidade" target="_blank">
              <Button type="button" variant="ghost" size="sm">
                Política de Privacidade
              </Button>
            </Link>
            <Link href="/termos" target="_blank">
              <Button type="button" variant="ghost" size="sm">
                Termos de Uso
              </Button>
            </Link>
          </div>
        </div>

        {/* DPO */}
        <div className="rounded-xl border border-subtle bg-card p-5 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <Mail size={18} className="text-primary-destaque shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Falar com o Encarregado (DPO)
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tem dúvida, quer registrar incidente ou exercer um direito que
                não está aqui? Escreva direto pro DPO. Respondemos em até 15
                dias úteis.
              </p>
            </div>
          </div>
          <a href={`mailto:${DPO_EMAIL}`} className="self-start">
            <Button type="button" variant="ghost" size="sm">
              {DPO_EMAIL}
            </Button>
          </a>
        </div>

        {/* Exclusão (zona de perigo) */}
        <DeleteAccountForm />
      </section>

      {events.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
            Histórico de eventos de privacidade
          </h2>
          <div className="rounded-xl border border-subtle bg-card divide-y divide-subtle text-sm">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="px-4 py-3 flex items-center justify-between gap-3"
              >
                <span className="text-foreground">
                  {EVENT_LABEL[ev.type as keyof typeof EVENT_LABEL] ?? ev.type}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(ev.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Registro mantido conforme art. 37 da LGPD para comprovação de
            operações de tratamento.
          </p>
        </section>
      ) : null}
    </section>
  )
}

const EVENT_LABEL = {
  TERMS_ACCEPTED: 'Aceitou os termos de uso',
  DATA_EXPORTED: 'Exportou seus dados',
  ACCOUNT_DELETED: 'Excluiu a conta',
  PROFILE_TYPE_CHANGED: 'Tipo de perfil alterado',
} as const

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground font-medium text-right">{value}</dd>
    </div>
  )
}
