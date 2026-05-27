'use client'

import { signOut } from 'next-auth/react'
import { Loader2, LogOut } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Logout client-side: dispara `signOut` do `next-auth/react`, que invalida o
 * cookie no servidor E notifica o SessionProvider local. Sem isso, a UI
 * continua mostrando o nome do usuário até o próximo F5.
 */
export function SignOutButton({
  callbackUrl = '/',
}: {
  callbackUrl?: string
}) {
  const [pending, setPending] = useState(false)

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      icon={
        pending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <LogOut size={16} />
        )
      }
      iconPosition="left"
      onClick={() => {
        setPending(true)
        signOut({ callbackUrl })
      }}
    >
      Sair
    </Button>
  )
}
