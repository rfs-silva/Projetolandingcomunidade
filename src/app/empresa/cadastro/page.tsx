import Link from 'next/link'
import { ArrowLeft, Building2 } from 'lucide-react'
import { CompanyApplyForm } from './CompanyApplyForm'

export const metadata = {
  title: 'Cadastro de empresa',
  description:
    'Empresa interessada em fazer parte da comunidade? Conte um pouco sobre você e nossa liderança avalia.',
}

export const dynamic = 'force-static'

export default function CompanyApplyPage() {
  return (
    <main className="min-h-screen bg-background py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Voltar para a página inicial
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
              Sua empresa na comunidade
            </h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Sem GitHub? Sem problema. Preencha os dados e a liderança avalia.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-5 mb-8">
          <h2 className="text-sm font-medium text-foreground">
            O que sua empresa pode fazer na comunidade
          </h2>
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li>· Divulgar eventos</li>
            <li>· Propor desafios técnicos</li>
            <li>· Aparecer no mural de empresas parceiras</li>
            <li>· Conectar com talentos locais</li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Participação gratuita. Aprovação manual pela liderança garante a
            qualidade do espaço.
          </p>
        </div>

        <CompanyApplyForm />

        <p className="mt-6 text-xs text-muted-foreground">
          Já se candidatou? A liderança vai entrar em contato pelo email
          informado quando a candidatura for analisada.
        </p>
      </div>
    </main>
  )
}
