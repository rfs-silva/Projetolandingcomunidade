'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, RefreshCw, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Tela de erro global. Não exibe stack, mensagem técnica ou digest do erro
 * para o usuário final. Em dev, o Next.js já mostra o overlay de erro com
 * detalhes — aqui é só a UI exibida quando rodando em produção.
 */
export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Em produção, manda só o nome da error para o console (sem stack,
    // sem mensagem que possa expor estrutura interna). Em dev, log completo
    // ajuda no debug.
    if (process.env.NODE_ENV === 'production') {
      console.error('[app] erro inesperado:', error.name)
    } else {
      console.error('[app] erro inesperado:', error)
    }
  }, [error])

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

        <div className="mx-auto w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive flex items-center justify-center">
          <ShieldAlert size={22} />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Algo deu errado
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tivemos um problema ao processar essa página. Tente novamente em
            alguns instantes ou volte ao início.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="default"
            icon={<RefreshCw size={14} />}
            iconPosition="left"
            onClick={() => reset()}
            className="w-full"
          >
            Tentar novamente
          </Button>
          <Link href="/" className="w-full">
            <Button
              type="button"
              variant="outline-primary"
              icon={<ArrowLeft size={14} />}
              iconPosition="left"
              className="w-full"
            >
              Voltar para o início
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
