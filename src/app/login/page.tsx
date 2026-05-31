import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { GithubIcon } from '@/components/icons/brand'
import { auth, signIn } from '@/auth'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Entrar',
}

export const dynamic = 'force-dynamic'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>
}) {
  const { callbackUrl = '/dashboard', error } = await searchParams
  const session = await auth()
  if (session?.user) redirect(callbackUrl)

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-md flex flex-col gap-8 rounded-2xl border border-subtle bg-card p-8 md:p-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.svg"
              alt="Comunidade"
              width={64}
              height={64}
              priority
            />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Entre na comunidade
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Use sua conta do GitHub para acessar mentoria, desafios e mural de
              membros.
            </p>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Não foi possível entrar. Tente novamente em instantes.
          </div>
        ) : null}

        <form
          action={async () => {
            'use server'
            await signIn('github', { redirectTo: callbackUrl })
          }}
        >
          <Button
            type="submit"
            variant="default"
            icon={<GithubIcon size={18} />}
            iconPosition="left"
            className="w-full h-12 text-base"
          >
            Entrar com GitHub
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Ao continuar você concorda com nossos Termos e Política de Privacidade.
        </p>

        <div className="border-t border-subtle pt-6 text-center space-y-1">
          <p className="text-xs text-muted-foreground">
            Empresa sem GitHub?
          </p>
          <div className="flex flex-col gap-1">
            <Link
              href="/empresa/login"
              className="text-sm text-primary-destaque hover:underline"
            >
              Entrar como empresa →
            </Link>
            <Link
              href="/empresa/cadastro"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ou candidatar a empresa
            </Link>
          </div>
        </div>

        <Link
          href="/"
          className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Voltar para a página inicial
        </Link>
      </div>
    </main>
  )
}
