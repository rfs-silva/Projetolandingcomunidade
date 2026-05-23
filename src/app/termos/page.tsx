import Link from 'next/link'

export const metadata = {
  title: 'Termos de Uso · Comunidade Roraima',
}

export default function TermosPage() {
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
          Termos de Uso
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <section className="prose prose-invert mt-10 max-w-none text-foreground/90 space-y-6">
          <h2 className="text-xl font-semibold">1. Aceitação</h2>
          <p>
            Ao acessar esta plataforma e criar uma conta, você concorda com os
            presentes Termos de Uso. Caso não concorde, não utilize o serviço.
          </p>

          <h2 className="text-xl font-semibold">2. Sobre a comunidade</h2>
          <p>
            A Comunidade Roraima Devs é um espaço colaborativo destinado a
            desenvolvedores, empresas e lideranças do ecossistema de tecnologia
            de Roraima, oferecendo eventos, desafios, mentoria e networking.
          </p>

          <h2 className="text-xl font-semibold">3. Cadastro e conta</h2>
          <p>
            O cadastro é feito via OAuth do GitHub. Você é responsável pela
            veracidade das informações fornecidas no perfil e pela segurança da
            sua conta GitHub.
          </p>

          <h2 className="text-xl font-semibold">4. Conduta esperada</h2>
          <p>
            É proibido publicar conteúdo ofensivo, discriminatório, ilegal ou
            que viole direitos de terceiros. Comportamentos abusivos podem
            levar à suspensão da conta.
          </p>

          <h2 className="text-xl font-semibold">5. Conteúdo do usuário</h2>
          <p>
            Você mantém os direitos sobre os projetos e conteúdos que publica.
            Ao publicar, concede à comunidade uma licença não exclusiva para
            exibi-los na plataforma para fins de divulgação.
          </p>

          <h2 className="text-xl font-semibold">6. Limitações</h2>
          <p>
            A plataforma é fornecida &quot;como está&quot;. Não garantimos
            disponibilidade contínua ou ausência de erros, mas envidamos
            esforços razoáveis para mantê-la operacional.
          </p>

          <h2 className="text-xl font-semibold">7. Alterações</h2>
          <p>
            Estes termos podem ser atualizados. Mudanças relevantes serão
            comunicadas com antecedência razoável.
          </p>

          <h2 className="text-xl font-semibold">8. Contato</h2>
          <p>
            Dúvidas? Entre em contato pelas redes sociais listadas no rodapé.
          </p>
        </section>
      </div>
    </main>
  )
}
