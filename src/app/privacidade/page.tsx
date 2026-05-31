import Link from 'next/link'
import { DPO_EMAIL } from '@/server/lib/privacy-contact'

export const metadata = {
  title: 'Política de Privacidade',
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
          Última atualização: {new Date().toLocaleDateString('pt-BR')} ·
          Conforme Lei nº 13.709/2018 (LGPD).
        </p>

        <section className="prose prose-invert mt-10 max-w-none text-foreground/90 space-y-6">
          <h2 className="text-xl font-semibold">1. Quem somos (Controlador)</h2>
          <p>
            A <strong>Comunidade Roraima Fullstack Developers</strong> é a controladora dos
            dados pessoais aqui descritos, nos termos do art. 5º, VI, da LGPD.
            Para qualquer comunicação sobre dados pessoais, use o canal do
            encarregado (DPO) na seção 10.
          </p>

          <h2 className="text-xl font-semibold">
            2. Quais dados coletamos e por quê
          </h2>
          <p>Coletamos somente o mínimo necessário para operar a plataforma:</p>
          <div className="overflow-x-auto rounded-lg border border-subtle">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-card text-left">
                  <th className="px-3 py-2 border-b border-subtle">Dado</th>
                  <th className="px-3 py-2 border-b border-subtle">Origem</th>
                  <th className="px-3 py-2 border-b border-subtle">Finalidade</th>
                  <th className="px-3 py-2 border-b border-subtle">Base legal</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-subtle">
                  <td className="px-3 py-2">ID GitHub, username, e-mail, avatar</td>
                  <td className="px-3 py-2">OAuth GitHub</td>
                  <td className="px-3 py-2">Autenticação e identidade</td>
                  <td className="px-3 py-2">Execução de contrato (art. 7º, V)</td>
                </tr>
                <tr className="border-b border-subtle">
                  <td className="px-3 py-2">
                    Nome de exibição, bio, LinkedIn, localização, stack
                  </td>
                  <td className="px-3 py-2">Você (perfil)</td>
                  <td className="px-3 py-2">Exibir perfil e descoberta entre membros</td>
                  <td className="px-3 py-2">Consentimento (art. 7º, I)</td>
                </tr>
                <tr className="border-b border-subtle">
                  <td className="px-3 py-2">Projetos, tópicos e respostas no fórum</td>
                  <td className="px-3 py-2">Você</td>
                  <td className="px-3 py-2">Divulgação e discussão entre membros</td>
                  <td className="px-3 py-2">Consentimento (art. 7º, I)</td>
                </tr>
                <tr className="border-b border-subtle">
                  <td className="px-3 py-2">
                    Candidaturas a mentoria (objetivo, disponibilidade, stack)
                  </td>
                  <td className="px-3 py-2">Você</td>
                  <td className="px-3 py-2">Análise de pareamento e contato</td>
                  <td className="px-3 py-2">Consentimento (art. 7º, I)</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Data de aceite dos termos</td>
                  <td className="px-3 py-2">Sistema (automático)</td>
                  <td className="px-3 py-2">Comprovação de consentimento</td>
                  <td className="px-3 py-2">Cumprimento legal (art. 7º, II)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold">3. O que NÃO coletamos</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Dados sensíveis (raça, religião, orientação, saúde, biometria)</li>
            <li>Localização precisa via GPS</li>
            <li>Cookies de terceiros (analytics, ads, rastreamento)</li>
            <li>Histórico de navegação fora da plataforma</li>
          </ul>

          <h2 className="text-xl font-semibold">4. Cookies</h2>
          <p>
            Usamos apenas <strong>cookies estritamente necessários</strong>:
            um cookie de sessão (JWT assinado) para manter você autenticado.
            Não usamos cookies de rastreamento, publicidade ou analytics — por
            isso não exibimos banner de consentimento.
          </p>

          <h2 className="text-xl font-semibold">5. Com quem compartilhamos</h2>
          <p>
            <strong>Não vendemos seus dados.</strong> Dados aparecem na
            plataforma conforme as visibilidades:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Perfil</strong> visível apenas para membros autenticados.
            </li>
            <li>
              <strong>Projetos com visibilidade pública</strong> aparecem na
              landing aberta — você escolhe quando publicar.
            </li>
            <li>
              <strong>Tópicos do fórum</strong> são visíveis apenas para
              membros autenticados.
            </li>
            <li>
              Eventos e desafios <strong>públicos</strong> podem ser
              indexados por buscadores.
            </li>
          </ul>
          <p>Subprocessadores operacionais (necessários para a plataforma):</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>GitHub</strong> — apenas para autenticação OAuth
            </li>
            <li>
              <strong>Provedor de hospedagem</strong> — armazena o banco; sem
              acesso humano a dados pessoais sem ordem do controlador
            </li>
          </ul>

          <h2 className="text-xl font-semibold">6. Por quanto tempo guardamos</h2>
          <p>
            Enquanto sua conta estiver ativa. Após exclusão da conta, dados
            pessoais são removidos em até <strong>30 dias</strong>,
            ressalvadas obrigações legais (ex.: registros de acesso por 6
            meses, conforme art. 15 do Marco Civil da Internet).
          </p>

          <h2 className="text-xl font-semibold">
            7. Seus direitos (art. 18 da LGPD)
          </h2>
          <p>Você pode, a qualquer momento e gratuitamente:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Confirmar</strong> que tratamos seus dados — vá em{' '}
              <Link
                href="/dashboard/privacidade"
                className="text-primary hover:underline"
              >
                Painel → Privacidade
              </Link>
              .
            </li>
            <li>
              <strong>Acessar</strong> e <strong>baixar</strong> todos os seus
              dados em formato JSON estruturado (portabilidade).
            </li>
            <li>
              <strong>Corrigir</strong> dados incompletos ou desatualizados
              direto no seu perfil.
            </li>
            <li>
              <strong>Excluir</strong> sua conta a qualquer momento, com
              eliminação dos dados pessoais associados.
            </li>
            <li>
              <strong>Revogar</strong> consentimentos a qualquer tempo (com
              consequência de inviabilizar o uso da plataforma).
            </li>
            <li>
              <strong>Reclamar</strong> à ANPD (
              <a
                href="https://www.gov.br/anpd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                gov.br/anpd
              </a>
              ).
            </li>
          </ul>

          <h2 className="text-xl font-semibold">8. Segurança</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Comunicação por HTTPS</li>
            <li>Senhas: não armazenamos (autenticação via OAuth GitHub)</li>
            <li>Acesso ao banco restrito a administradores autorizados</li>
            <li>
              Cookies de sessão com flags <code>HttpOnly</code> e{' '}
              <code>SameSite</code>
            </li>
          </ul>

          <h2 className="text-xl font-semibold">9. Menores de idade</h2>
          <p>
            A plataforma é destinada a maiores de 16 anos. Não coletamos
            intencionalmente dados de crianças. Se identificarmos conta de
            menor de 16 anos sem consentimento parental, ela será removida.
          </p>

          <h2 className="text-xl font-semibold">10. Encarregado (DPO)</h2>
          <p>
            Para exercer seus direitos, tirar dúvidas ou registrar incidentes
            de segurança, contate:
          </p>
          <p>
            <a
              href={`mailto:${DPO_EMAIL}`}
              className="text-primary hover:underline"
            >
              {DPO_EMAIL}
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            Respondemos solicitações em até 15 dias úteis, conforme art. 19 da
            LGPD.
          </p>

          <h2 className="text-xl font-semibold">11. Alterações nesta política</h2>
          <p>
            Mudanças relevantes serão comunicadas com no mínimo 7 dias de
            antecedência por aviso na plataforma. Continuar usando após
            entrada em vigor representa aceite.
          </p>
        </section>
      </div>
    </main>
  )
}
