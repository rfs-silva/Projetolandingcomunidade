'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, Shield } from 'lucide-react'
import type { ReactNode } from 'react'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
  adminOnly?: boolean
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Visão geral', adminOnly: true },
  { href: '/admin/submissoes', label: 'Submissões', adminOnly: true },
  { href: '/admin/empresas', label: 'Empresas', adminOnly: true },
  { href: '/admin/mentoria', label: 'Mentoria', adminOnly: true },
  { href: '/admin/forum', label: 'Fórum', adminOnly: true },
  { href: '/admin/usuarios', label: 'Usuários', adminOnly: true },
  { href: '/admin/eventos', label: 'Eventos' },
  { href: '/admin/desafios', label: 'Desafios' },
]

export function AdminShell({
  children,
  displayName,
  image,
  seed,
  role,
}: {
  children: ReactNode
  displayName: string
  image?: string | null
  seed: string
  role: 'ADMIN' | 'COMPANY'
}) {
  const pathname = usePathname()
  const items = NAV.filter((item) => role === 'ADMIN' || !item.adminOnly)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-subtle bg-card/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Comunidade" width={28} height={28} />
              <span className="text-sm font-medium text-foreground">
                Comunidade Roraima Fullstack Developers
              </span>
            </Link>
            {role === 'ADMIN' ? (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                <Shield size={10} /> Admin
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary-destaque bg-primary/10 border border-primary/30 px-2 py-0.5 rounded">
                <Building2 size={10} /> Empresa
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← Voltar ao painel
            </Link>
            <UserAvatar src={image} name={displayName} seed={seed} />
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
        <nav className="md:sticky md:top-20 self-start">
          <ul className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible hide-scrollbar">
            {items.map((item) => {
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
