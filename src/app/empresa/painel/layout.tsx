import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { requireDashboardSession } from '@/server/lib/dashboard-session'

export const dynamic = 'force-dynamic'

export default async function CompanyDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireDashboardSession('/empresa/painel')

  // Apenas COMPANY entra aqui. Outros perfis são redirecionados.
  if (session.profile.type !== 'COMPANY') {
    redirect(session.profile.type === 'MEMBER' ? '/dashboard' : '/admin')
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        image={session.image}
        displayName={session.profile.displayName}
        seed={session.githubUsername}
        role="COMPANY"
        profileHref="/empresa/painel"
      />
      {children}
    </div>
  )
}
