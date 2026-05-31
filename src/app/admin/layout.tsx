import { AdminShell } from '@/components/admin/AdminShell'
import {
  isAdminType,
  requireContentCreatorSession,
} from '@/server/lib/admin-session'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireContentCreatorSession()
  const role = isAdminType(session.profile.type) ? 'ADMIN' : 'COMPANY'

  return (
    <AdminShell
      displayName={session.profile.displayName}
      image={session.image}
      seed={session.githubUsername}
      role={role}
    >
      {children}
    </AdminShell>
  )
}
