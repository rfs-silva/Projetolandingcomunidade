'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Pencil, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/UserAvatar'

type ReplyAuthor = {
  id: string
  displayName: string
  githubUsername: string
  avatarUrl: string | null
}

type Reply = {
  id: string
  body: string
  createdAt: string | Date
  updatedAt: string | Date
  author: ReplyAuthor
}

export function ReplyItem({
  reply,
  canManage,
}: {
  reply: Reply
  canManage: boolean
}) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [body, setBody] = useState(reply.body)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  async function save() {
    setError(null)
    setPending(true)
    const res = await fetch(`/api/me/forum/replies/${reply.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ body: body.trim() }),
    })
    setPending(false)
    if (!res.ok) {
      const json = await res.json().catch(() => null)
      setError(json?.error?.message ?? 'Falha ao salvar.')
      return
    }
    setIsEditing(false)
    startTransition(() => router.refresh())
  }

  async function remove() {
    if (!confirm('Excluir esta resposta?')) return
    setError(null)
    setPending(true)
    const res = await fetch(`/api/me/forum/replies/${reply.id}`, {
      method: 'DELETE',
    })
    setPending(false)
    if (!res.ok) {
      const json = await res.json().catch(() => null)
      setError(json?.error?.message ?? 'Falha ao excluir.')
      return
    }
    startTransition(() => router.refresh())
  }

  const createdAt = new Date(reply.createdAt)
  const updatedAt = new Date(reply.updatedAt)
  const edited = updatedAt.getTime() - createdAt.getTime() > 1000

  return (
    <div className="rounded-xl border border-subtle bg-card p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <UserAvatar
            src={reply.author.avatarUrl}
            name={reply.author.displayName}
            seed={reply.author.githubUsername}
          />
          <div>
            <div className="text-sm font-medium text-foreground">
              {reply.author.displayName}
            </div>
            <div className="text-xs text-muted-foreground">
              {createdAt.toLocaleString('pt-BR')}
              {edited ? <span className="ml-1">· editado</span> : null}
            </div>
          </div>
        </div>
        {canManage && !isEditing ? (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={<Pencil size={12} />}
              iconPosition="left"
              onClick={() => setIsEditing(true)}
            >
              Editar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={pending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              iconPosition="left"
              onClick={remove}
              disabled={pending}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Excluir
            </Button>
          </div>
        ) : null}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-subtle bg-background px-3 py-2 text-sm font-mono text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
          />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={<X size={12} />}
              iconPosition="left"
              onClick={() => {
                setIsEditing(false)
                setBody(reply.body)
                setError(null)
              }}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              icon={pending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              iconPosition="left"
              onClick={save}
              disabled={pending}
            >
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/90 leading-relaxed">
          {reply.body}
        </pre>
      )}

      {error && !isEditing ? <p className="text-xs text-destructive mt-2">{error}</p> : null}
    </div>
  )
}
