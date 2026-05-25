'use client'

import { useState, type ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { GithubIcon } from '@/components/icons/brand'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type AuthGateProps = {
  children: ReactNode
  authedHref?: string
  title?: string
  description?: string
}

/**
 * Envolve um CTA ou link interno. Quando o usuário não está autenticado,
 * intercepta o clique e abre um modal pedindo login. Quando autenticado,
 * o conteúdo passa direto via Link para `authedHref`.
 */
export function AuthGate({
  children,
  authedHref = '/dashboard',
  title = 'Conteúdo exclusivo da comunidade',
  description = 'Entre com sua conta GitHub para acessar mentoria, desafios e o mural de membros.',
}: AuthGateProps) {
  const { status } = useSession()
  const [open, setOpen] = useState(false)

  if (status === 'authenticated') {
    return (
      <Link href={authedHref} className="contents">
        {children}
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="contents text-left"
      >
        {children}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary-destaque">
              <Lock size={16} />
              <span className="text-xs uppercase tracking-wider font-semibold">
                Área de membros
              </span>
            </div>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-4">
            <Link href={`/login?callbackUrl=${encodeURIComponent(authedHref)}`}>
              <Button
                type="button"
                icon={<GithubIcon size={18} />}
                iconPosition="left"
                className="w-full h-11"
              >
                Entrar com GitHub
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Continuar navegando sem entrar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
