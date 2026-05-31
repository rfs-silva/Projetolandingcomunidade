import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Você está offline',
}

/**
 * Página servida pelo service worker quando o usuário tenta navegar
 * sem conexão. Mantida estática pra que o pre-cache funcione.
 */
export const dynamic = 'force-static'

export default function OfflinePage() {
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
          <WifiOff size={22} />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Sem conexão
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Não conseguimos carregar esta página agora. Verifique sua internet
            e tente novamente.
          </p>
        </div>

        <Link href="/">
          <Button
            type="button"
            variant="default"
            icon={<ArrowRight size={14} />}
            iconPosition="right"
            className="w-full"
          >
            Tentar abrir a página inicial
          </Button>
        </Link>
      </div>
    </main>
  )
}
