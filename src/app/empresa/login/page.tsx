import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { AuthError } from 'next-auth'
import { AlertTriangle, ArrowRight, Building2 } from 'lucide-react'
import { auth, signIn } from '@/auth'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Entrar como empresa',
}

export const dynamic = 'force-dynamic'

export default async function CompanyLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const session = await auth()
  if (session?.user) redirect('/empresa/painel')

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-md flex flex-col gap-6 rounded-2xl border border-subtle bg-card p-8 md:p-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.svg"
              alt="Comunidade"
              width={56}
              height={56}
              priority
            />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary-destaque bg-primary/10 border border-primary/30 px-2 py-1 rounded-full mb-3">
              <Building2 size={12} /> Acesso de empresa
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              Entrar como empresa
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Use o email cadastrado na candidatura aprovada pela liderança.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-xs text-amber-200 flex gap-2">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>
            <strong>Login provisório.</strong> Em breve, esse acesso vai exigir
            verificação via link enviado por email.
          </span>
        </div>

        {error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Email não encontrado ou conta não aprovada como empresa.
          </div>
        ) : null}

        <form
          action={async (formData: FormData) => {
            'use server'
            const email = String(formData.get('email') ?? '').trim()
            try {
              await signIn('company-email', {
                email,
                redirectTo: '/empresa/painel',
              })
            } catch (err) {
              // signIn dispara NEXT_REDIRECT em caso de sucesso. Esse erro
              // tem que propagar pro Next.js efetivar o redirect. Só tratamos
              // erros do Auth.js (credenciais inválidas, etc.).
              if (err instanceof AuthError) {
                redirect('/empresa/login?error=1')
              }
              throw err
            }
          }}
          className="flex flex-col gap-4"
        >
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">
              Email da empresa
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="contato@empresa.com.br"
              className="w-full rounded-xl border border-subtle bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <Button
            type="submit"
            variant="default"
            icon={<ArrowRight size={16} />}
            iconPosition="right"
            className="w-full h-11"
          >
            Entrar
          </Button>
        </form>

        <div className="border-t border-subtle pt-5 text-center text-xs text-muted-foreground">
          Ainda não tem candidatura aprovada?{' '}
          <Link
            href="/empresa/cadastro"
            className="text-primary-destaque hover:underline"
          >
            Candidatar empresa
          </Link>
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
