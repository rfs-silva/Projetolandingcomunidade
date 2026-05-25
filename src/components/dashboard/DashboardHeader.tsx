import Image from 'next/image'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { signOut } from '@/auth'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/UserAvatar'

type Props = {
  image?: string | null
  displayName: string
  seed: string
}

export function DashboardHeader({ image, displayName, seed }: Props) {
  return (
    <header className="border-b border-subtle">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Comunidade" width={32} height={32} />
          <span className="text-sm font-medium text-foreground">
            Comunidade Roraima
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/profile"
            aria-label="Editar meu perfil"
            className="flex items-center gap-3 rounded-full pr-3 pl-1 py-1 hover:bg-card/60 transition-colors"
          >
            <UserAvatar src={image} name={displayName} seed={seed} />
            <span className="hidden sm:inline text-sm text-muted-foreground">
              {displayName}
            </span>
          </Link>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/' })
            }}
          >
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
  )
}
