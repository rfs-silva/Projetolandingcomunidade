import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { requireDashboardSession } from '@/server/lib/dashboard-session'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireDashboardSession()

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        image={session.image}
        displayName={session.profile.displayName}
        seed={session.githubUsername}
      />
      {children}
    </div>
  )
}
