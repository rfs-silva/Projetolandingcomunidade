'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { CheckCircle2, X } from 'lucide-react'

/**
 * Banner exibido ao topo da landing quando o usuário acaba de excluir a conta
 * (redirecionado de /dashboard/privacidade com ?excluido=1).
 */
export function AccountDeletedBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (searchParams.get('excluido') === '1') {
      setVisible(true)
    }
  }, [searchParams])

  if (!visible) return null

  function dismiss() {
    setVisible(false)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('excluido')
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] max-w-md w-[calc(100%-2rem)] rounded-xl border border-emerald-500/40 bg-emerald-500/15 backdrop-blur-md px-4 py-3 shadow-xl flex items-start gap-3">
      <CheckCircle2 size={18} className="text-emerald-300 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm text-foreground">
        <strong>Sua conta foi excluída.</strong>
        <p className="text-xs text-muted-foreground mt-0.5">
          Seus dados pessoais foram removidos. Esperamos te ver de volta em
          breve.
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fechar"
        className="text-muted-foreground hover:text-foreground"
      >
        <X size={16} />
      </button>
    </div>
  )
}
