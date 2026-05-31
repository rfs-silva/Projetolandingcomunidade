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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Image
              src="/logo.svg"
              alt="Comunidade"
              width={32}
              height={32}
              className="shrink-0"
            />
            <span className="text-sm font-medium text-foreground truncate hidden sm:inline">
              Comunidade Roraima Fullstack Developers
            </span>
            <span className="text-sm font-medium text-foreground sm:hidden">
              CRFD
            </span>
          </Link>
          {role === 'COMPANY' ? (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary-destaque bg-primary/10 border border-primary/30 px-2 py-0.5 rounded shrink-0">
              <Building2 size={10} /> Empresa
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            href={profileHref}
            aria-label={
              role === 'COMPANY' ? 'Painel da empresa' : 'Editar meu perfil'
            }
            className="flex items-center gap-2 sm:gap-3 rounded-full pr-1 sm:pr-3 pl-1 py-1 hover:bg-card/60 transition-colors"
          >
            <UserAvatar src={image} name={displayName} seed={seed} />
            <span className="hidden md:inline text-sm text-muted-foreground truncate max-w-[160px]">
              {displayName}
            </span>
          </Link>
          <SignOutButton />
        </div>
      </div>
    </header>
  )
}
