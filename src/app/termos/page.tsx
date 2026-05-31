import Link from 'next/link'
import { DPO_EMAIL } from '@/server/lib/privacy-contact'

export const metadata = {
  title: 'Termos de Uso',
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
            Ao criar uma conta nesta plataforma, você concorda com estes
            Termos de Uso e com a{' '}
            <Link href="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
            . Caso não concorde, encerre o uso e exclua sua conta em{' '}
            <em>Painel → Privacidade</em>.
          </p>

          <h2 className="text-xl font-semibold">2. Sobre a comunidade</h2>
          <p>
            A Comunidade Roraima Fullstack Developers é um espaço colaborativo destinado a
            desenvolvedores, empresas e lideranças do ecossistema de
            tecnologia de Roraima. Oferecemos eventos, desafios, mentoria,
            mural de membros, mural de projetos e fórum.
          </p>

          <h2 className="text-xl font-semibold">3. Cadastro e elegibilidade</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>O cadastro é feito via OAuth do GitHub.</li>
            <li>Você precisa ter pelo menos 16 anos.</li>
            <li>
              Você é responsável pela segurança da sua conta GitHub e por toda
              atividade realizada no seu perfil aqui.
            </li>
            <li>
              Não é permitido criar conta usando identidade de outra pessoa.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">4. Conduta esperada</h2>
          <p>É proibido publicar ou compartilhar:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Conteúdo ofensivo, discriminatório, sexual ou ilegal</li>
            <li>Spam, marketing não autorizado ou correntes</li>
            <li>Conteúdo que viole direitos autorais ou de imagem</li>
            <li>Dados pessoais de terceiros sem autorização</li>
            <li>Vulnerabilidades de segurança fora do canal de DPO</li>
          </ul>
          <p>
            Violações podem resultar em remoção do conteúdo, suspensão ou
            exclusão da conta a critério da liderança.
          </p>

          <h2 className="text-xl font-semibold">5. Conteúdo do usuário</h2>
          <p>
            Você mantém todos os direitos sobre os projetos, tópicos,
            respostas e demais conteúdos que publica. Ao publicar, concede à
            plataforma uma <strong>licença não exclusiva, gratuita e
            revogável</strong> para exibir esse conteúdo dentro da plataforma
            para fins de divulgação à comunidade.
          </p>
          <p>
            Ao excluir um conteúdo ou sua conta, a licença é revogada
            automaticamente. Conteúdo público que tenha sido replicado por
            terceiros (ex.: print, cache de buscadores) escapa do nosso
            controle.
          </p>

          <h2 className="text-xl font-semibold">6. Visibilidade do conteúdo</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Projetos públicos</strong> aparecem na landing aberta — você
              escolhe ao publicar.
            </li>
            <li>
              <strong>Tópicos do fórum</strong>, mural de membros, eventos e
              desafios exclusivos são visíveis apenas para membros logados.
            </li>
            <li>
              O perfil completo só é visível para membros logados.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">7. Papéis e moderação</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Membro</strong> / <strong>Empresa parceira</strong>:
              criados via auto cadastro.
            </li>
            <li>
              <strong>Liderança</strong> / <strong>Fundador</strong>: atribuídos
              manualmente pela organização. Podem moderar conteúdo, gerenciar
              candidaturas de mentoria e cadastrar eventos/desafios.
            </li>
          </ul>

          <h2 className="text-xl font-semibold">8. Tratamento de dados pessoais</h2>
          <p>
            O tratamento de dados pessoais segue a{' '}
            <Link href="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>{' '}
            e a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Você
            pode, a qualquer momento:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Acessar e baixar seus dados em formato JSON</li>
            <li>Corrigir dados no seu perfil</li>
            <li>Excluir sua conta e seus dados pessoais associados</li>
            <li>
              Contatar o encarregado em <code>{DPO_EMAIL}</code>
            </li>
          </ul>

          <h2 className="text-xl font-semibold">9. Limitação de responsabilidade</h2>
          <p>
            A plataforma é fornecida &quot;como está&quot;. Não garantimos
            disponibilidade contínua ou ausência de erros, mas envidamos
            esforços razoáveis para mantê-la operacional. Não nos
            responsabilizamos por:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Conteúdo publicado por outros membros</li>
            <li>Resultados profissionais decorrentes de mentorias</li>
            <li>Indisponibilidade do GitHub OAuth ou da infraestrutura</li>
          </ul>

          <h2 className="text-xl font-semibold">10. Alterações</h2>
          <p>
            Estes termos podem ser atualizados. Mudanças relevantes serão
            comunicadas com pelo menos 7 dias de antecedência através de
            aviso na plataforma. Ao continuar usando, você aceita os novos
            termos.
          </p>

          <h2 className="text-xl font-semibold">11. Foro e lei aplicável</h2>
          <p>
            Estes Termos são regidos pelas leis da República Federativa do
            Brasil. Fica eleito o foro da Comarca de Boa Vista, RR, para
            dirimir quaisquer controvérsias.
          </p>

          <h2 className="text-xl font-semibold">12. Contato</h2>
          <p>
            Dúvidas sobre os termos:{' '}
            <a
              href={`mailto:${DPO_EMAIL}`}
              className="text-primary hover:underline"
            >
              {DPO_EMAIL}
            </a>
            . Veja também as redes sociais no rodapé.
          </p>
        </section>
      </div>
    </main>
  )
}
