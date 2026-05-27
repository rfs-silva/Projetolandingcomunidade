'use client'

import { useState, useTransition } from 'react'
import { signOut } from 'next-auth/react'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CONFIRMATION_PHRASE = 'EXCLUIR MINHA CONTA'

export function DeleteAccountForm() {
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [, startTransition] = useTransition()

  const phraseMatches = confirmation.trim() === CONFIRMATION_PHRASE

  async function onConfirm() {
    if (!phraseMatches) return
    setError(null)
    setPending(true)
    const res = await fetch('/api/me/account', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ confirmation }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setError(body?.error?.message ?? 'Não foi possível excluir.')
      setPending(false)
      return
    }
    // Desloga e leva pra landing com aviso
    startTransition(() => {
      signOut({ callbackUrl: '/?excluido=1' })
    })
  }

  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="text-destructive shrink-0 mt-0.5" />
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Excluir minha conta
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Esta ação apaga sua conta e todos os dados pessoais associados
            (perfil, tags, projetos, candidaturas de mentoria, tópicos e
            respostas do fórum). A ação é <strong>permanente</strong> e não
            pode ser desfeita.
          </p>
        </div>
      </div>

      {!open ? (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          icon={<Trash2 size={14} />}
          iconPosition="left"
          onClick={() => setOpen(true)}
          className="self-start"
        >
          Quero excluir minha conta
        </Button>
      ) : (
        <div className="flex flex-col gap-3 border-t border-destructive/30 pt-4">
          <p className="text-sm text-foreground">
            Para confirmar, digite exatamente:{' '}
            <code className="text-destructive font-mono">{CONFIRMATION_PHRASE}</code>
          </p>
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={CONFIRMATION_PHRASE}
            disabled={pending}
            autoCapitalize="characters"
            className="w-full rounded-lg border border-subtle bg-background px-3 py-2 text-sm font-mono text-foreground focus:border-destructive focus:outline-none focus:ring-2 focus:ring-destructive/30"
          />
          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : null}
          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false)
                setConfirmation('')
                setError(null)
              }}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              icon={pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              iconPosition="left"
              onClick={onConfirm}
              disabled={!phraseMatches || pending}
            >
              {pending ? 'Excluindo...' : 'Excluir permanentemente'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
