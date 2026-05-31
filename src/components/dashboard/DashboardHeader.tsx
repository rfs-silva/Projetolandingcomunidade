import Image from 'next/image'
import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { SignOutButton } from '@/components/auth/SignOutButton'

type Props = {
  image?: string | null
  displayName: string
  seed: string
  role?: 'MEMBER' | 'COMPANY'
  profileHref?: string
}

export function DashboardHeader({
  image,
  displayName,
  seed,
  role = 'MEMBER',
  profileHref = '/dashboard/profile',
}: Props) {
  return (
    <header className="border-b border-subtle">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Comunidade" width={32} height={32} />
            <span className="text-sm font-medium text-foreground">
              Comunidade Roraima Fullstack Developers
            </span>
          </Link>
          {role === 'COMPANY' ? (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary-destaque bg-primary/10 border border-primary/30 px-2 py-0.5 rounded">
              <Building2 size={10} /> Empresa
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={profileHref}
            aria-label={
              role === 'COMPANY' ? 'Painel da empresa' : 'Editar meu perfil'
            }
            className="flex items-center gap-3 rounded-full pr-3 pl-1 py-1 hover:bg-card/60 transition-colors"
          >
            <UserAvatar src={image} name={displayName} seed={seed} />
            <span className="hidden sm:inline text-sm text-muted-foreground">
              {displayName}
            </span>
          </Link>
          <SignOutButton />
        </div>
      </div>
    </header>
  )
}
