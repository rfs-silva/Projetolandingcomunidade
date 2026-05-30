import { adminProgressService } from '@/server/services/admin-progress.service'
import { requireAdminSession } from '@/server/lib/admin-session'
import { SubmissionsList } from './SubmissionsList'

export const metadata = {
  title: 'Submissões · Admin',
}

export const dynamic = 'force-dynamic'

export default async function AdminSubmissoesPage() {
  await requireAdminSession()
  const items = await adminProgressService.listPendingSubmissions()

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
          Submissões pendentes
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Avalie as submissões de desafios. Ao aprovar, o usuário ganha os
          pontos do desafio.
        </p>
      </header>

      <SubmissionsList
        items={items.map((i) => ({
          id: i.id,
          challengeNumber: i.challengeNumber,
          challengeTitle: i.challengeTitle,
          points: i.points,
          user: i.user,
          submissionUrl: i.submissionUrl,
          submissionNote: i.submissionNote,
          submittedAt: i.submittedAt ? i.submittedAt.toISOString() : null,
        }))}
      />
    </div>
  )
}
