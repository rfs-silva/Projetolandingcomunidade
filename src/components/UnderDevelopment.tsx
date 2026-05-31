import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Construction } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  title: string
  description?: string
  expectedFeatures?: string[]
  backHref?: string
  backLabel?: string
}

/**
 * Tela padrão para funcionalidades que ainda não estão prontas para produção.
 * Centraliza a mensagem para que o usuário saiba que aquilo vem, não que está
 * quebrado. Usado, por exemplo, quando o login por magic link ainda não foi
 * configurado e o login dev de empresa está desabilitado.
 */
export function UnderDevelopment({
  title,
  description,
  expectedFeatures,
  backHref = '/',
  backLabel = 'Voltar para a página inicial',
}: Props) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-md flex flex-col gap-6 rounded-2xl border border-subtle bg-card p-8 md:p-10 text-center">
        <Link href="/" className="inline-block self-center">
          <Image
            src="/logo.svg"
            alt="Comunidade"
            width={56}
            height={56}
            priority
          />
        </Link>

        <div className="mx-auto w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-center">
          <Construction size={22} />
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-full inline-block mb-3">
            Em desenvolvimento
          </span>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          {description ? (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>

        {expectedFeatures && expectedFeatures.length > 0 ? (
          <ul className="text-left text-sm text-muted-foreground space-y-2 border-t border-subtle pt-5">
            {expectedFeatures.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-primary-destaque" aria-hidden>
                  ·
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <Link href={backHref}>
          <Button
            type="button"
            variant="outline-primary"
            icon={<ArrowLeft size={14} />}
            iconPosition="left"
            className="w-full"
          >
            {backLabel}
          </Button>
        </Link>
      </div>
    </main>
  )
}
