'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Shield } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Visão geral' },
  { href: '/admin/mentoria', label: 'Mentoria' },
  { href: '/admin/forum', label: 'Fórum' },
  { href: '/admin/usuarios', label: 'Usuários' },
  { href: '/admin/eventos', label: 'Eventos' },
  { href: '/admin/desafios', label: 'Desafios' },
]

export function AdminShell({
  children,
  displayName,
  image,
  seed,
  signOutAction,
}: {
  children: ReactNode
  displayName: string
  image?: string | null
  seed: string
  signOutAction: () => Promise<void>
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-subtle bg-card/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Comunidade" width={28} height={28} />
              <span className="text-sm font-medium text-foreground">
                Comunidade Roraima
              </span>
            </Link>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
              <Shield size={10} /> Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← Voltar ao painel
            </Link>
            <UserAvatar src={image} name={displayName} seed={seed} />
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                icon={<LogOut size={16} />}
                iconPosition="left"
              >
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
        <nav className="md:sticky md:top-20 self-start">
          <ul className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {NAV.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href)
              return (
                <li key={item.href} className="shrink-0">
                  <Link
                    href={item.href}
                    className={cn(
                      'block px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                      isActive
                        ? 'bg-primary/10 text-primary-destaque border border-primary/30'
                        : 'text-muted-foreground hover:text-foreground hover:bg-card',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
