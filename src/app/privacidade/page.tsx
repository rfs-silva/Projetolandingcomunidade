import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade · Comunidade Roraima',
}

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-background py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Voltar para a página inicial
        </Link>

        <h1 className="mt-6 text-3xl md:text-4xl font-semibold text-foreground">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <section className="prose prose-invert mt-10 max-w-none text-foreground/90 space-y-6">
          <h2 className="text-xl font-semibold">1. Dados coletados</h2>
          <p>Coletamos apenas o mínimo necessário para operar a plataforma:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Identificador, nome de usuário, e-mail e avatar do GitHub</li>
            <li>Informações de perfil que você preencher (bio, LinkedIn, stack)</li>
            <li>Conteúdos que você publicar (projetos, candidaturas)</li>
          </ul>

          <h2 className="text-xl font-semibold">2. Finalidades</h2>
          <p>Os dados são usados para:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Autenticar e identificar você na plataforma</li>
            <li>Exibir seu perfil e conteúdos a outros membros</li>
            <li>Permitir candidaturas a programas (ex.: mentoria)</li>
            <li>Garantir segurança e prevenir abusos</li>
          </ul>

          <h2 className="text-xl font-semibold">3. Compartilhamento</h2>
          <p>
            Não vendemos seus dados. Dados de perfil podem ser visíveis para
            outros membros da comunidade (mural de membros, mural de projetos),
            conforme as configurações de visibilidade aplicáveis.
          </p>

          <h2 className="text-xl font-semibold">4. Cookies</h2>
          <p>
            Usamos cookies estritamente necessários para manter sua sessão
            autenticada. Não há cookies de rastreamento de terceiros.
          </p>

          <h2 className="text-xl font-semibold">5. Seus direitos (LGPD)</h2>
          <p>Você tem direito a:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Acessar e corrigir seus dados pessoais</li>
            <li>Solicitar a exclusão da sua conta e dados associados</li>
            <li>Saber com quem seus dados são compartilhados</li>
            <li>Revogar consentimento a qualquer momento</li>
          </ul>

          <h2 className="text-xl font-semibold">6. Retenção</h2>
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa. Após
            exclusão, dados pessoais são removidos em até 30 dias, ressalvadas
            obrigações legais.
          </p>

          <h2 className="text-xl font-semibold">7. Contato do encarregado</h2>
          <p>
            Para exercer seus direitos ou tirar dúvidas, entre em contato pelas
            redes sociais listadas no rodapé.
          </p>
        </section>
      </div>
    </main>
  )
}
