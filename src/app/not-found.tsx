import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Página não encontrada',
}

export default function NotFoundPage() {
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

        <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 text-primary-destaque flex items-center justify-center">
          <Compass size={22} />
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Erro 404
          </span>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">
            Página não encontrada
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            O endereço que você acessou não existe ou foi movido.
          </p>
        </div>

        <Link href="/">
          <Button
            type="button"
            variant="default"
            icon={<ArrowLeft size={14} />}
            iconPosition="left"
            className="w-full"
          >
            Voltar para o início
          </Button>
        </Link>
      </div>
    </main>
  )
}
