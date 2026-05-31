import Link from 'next/link'

export const metadata = {
  title: 'Manifesto · Comunidade Roraima Fullstack Developers',
  description:
    'O que acreditamos, como nos organizamos e o que oferecemos como comunidade.',
}

export default function ManifestoPage() {
  return (
    <main className="min-h-screen bg-background py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Voltar para a página inicial
        </Link>

        <h1 className="mt-6 text-3xl md:text-5xl font-semibold text-foreground tracking-tight">
          Manifesto
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          O que acreditamos, como nos organizamos e o que entregamos.
        </p>

        <section className="prose prose-invert mt-12 max-w-none text-foreground/90 space-y-10">
          <Block title="Quem somos">
            <p>
              Somos a <strong>Comunidade Roraima Fullstack Developers</strong> — desenvolvedores,
              empresas e lideranças que acreditam que tecnologia muda
              trajetórias e que o ecossistema local cresce quando o conhecimento
              circula com generosidade.
            </p>
          </Block>

          <Block title="No que acreditamos">
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Conhecimento se multiplica quando é compartilhado.</strong>{' '}
                Ninguém aprende sozinho, e ninguém cresce sozinho.
              </li>
              <li>
                <strong>Diversidade é vantagem técnica.</strong> Bons produtos
                nascem de times com vivências diferentes.
              </li>
              <li>
                <strong>Resultado por mérito, não por origem.</strong> O que importa
                é o que você entrega — e o que você ajuda os outros a entregarem.
              </li>
              <li>
                <strong>O ecossistema local precisa de protagonismo.</strong>{' '}
                Roraima tem talento; cabe à comunidade dar visibilidade.
              </li>
            </ul>
          </Block>

          <Block title="O que oferecemos">
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Networking</strong> com devs, empresas e lideranças.
              </li>
              <li>
                <strong>Mentoria</strong> entre membros, com acompanhamento real
                de objetivos.
              </li>
              <li>
                <strong>Eventos</strong> remotos e presenciais para aprender e
                criar laços.
              </li>
              <li>
                <strong>Desafios técnicos</strong> para praticar o que importa
                no mercado.
              </li>
              <li>
                <strong>Mural de projetos</strong> para divulgar o que você
                constrói.
              </li>
            </ul>
          </Block>

          <Block title="Como nos organizamos">
            <p>
              A comunidade é mantida por <strong>lideranças voluntárias</strong>{' '}
              que cuidam de agenda, mentoria, parcerias e moderação. Decisões
              estratégicas são abertas — qualquer membro pode propor mudanças.
              Conteúdo institucional vive em arquivos versionados; qualquer
              alteração passa por revisão pública.
            </p>
          </Block>

          <Block title="Compromissos">
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Espaço <strong>seguro e respeitoso</strong> — assédio,
                preconceito e ataques pessoais não têm lugar aqui.
              </li>
              <li>
                <strong>Privacidade</strong> tratada a sério (veja a{' '}
                <Link href="/privacidade" className="text-primary hover:underline">
                  política
                </Link>
                ).
              </li>
              <li>
                Conteúdos exclusivos para membros não significam
                exclusividade financeira — a participação é{' '}
                <strong>gratuita</strong>.
              </li>
            </ul>
          </Block>

          <Block title="Quem pode entrar">
            <p>
              Qualquer pessoa interessada em desenvolvimento de software, em
              qualquer nível, residente em Roraima ou ligada ao ecossistema do
              estado.{' '}
              <Link href="/login" className="text-primary hover:underline">
                Crie sua conta com GitHub
              </Link>{' '}
              e venha somar.
            </p>
          </Block>
        </section>
      </div>
    </main>
  )
}

function Block({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-foreground mb-3">{title}</h2>
      <div className="text-base leading-relaxed text-muted-foreground space-y-3">
        {children}
      </div>
    </section>
  )
}
