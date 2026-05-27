import { AdminShell } from '@/components/admin/AdminShell'
import { requireAdminSession } from '@/server/lib/admin-session'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAdminSession()

  return (
    <AdminShell
      displayName={session.profile.displayName}
      image={session.image}
      seed={session.githubUsername}
    >
      {children}
    </AdminShell>
  )
}
