import { Calendar, Inbox, Target } from 'lucide-react'
import { requireAdminSession } from '@/server/lib/admin-session'
import { adminEventsService } from '@/server/services/admin-events.service'
import { adminChallengesService } from '@/server/services/admin-challenges.service'
import { prisma } from '@/server/lib/prisma'
import { ApprovalList } from './ApprovalList'

export const metadata = {
  title: 'Aprovações',
}

export const dynamic = 'force-dynamic'

async function loadOwners(ids: (string | null)[]) {
  const userIds = Array.from(
    new Set(ids.filter((id): id is string => Boolean(id))),
  )
  if (userIds.length === 0) return new Map<string, string>()
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      githubUsername: true,
      email: true,
      profile: { select: { displayName: true } },
    },
  })
  return new Map(
    users.map((u) => [
      u.id,
      u.profile?.displayName ?? u.githubUsername ?? u.email ?? 'Sem nome',
    ]),
  )
}

export default async function AdminApprovalsPage() {
  const session = await requireAdminSession()
  const actor = { userId: session.userId, profileType: session.profile.type }

  const [pendingEvents, pendingChallenges] = await Promise.all([
    adminEventsService.list(actor, 'PENDING_APPROVAL'),
    adminChallengesService.list(actor, 'PENDING_APPROVAL'),
  ])

  const ownerNames = await loadOwners([
    ...pendingEvents.map((e) => e.createdById),
    ...pendingChallenges.map((c) => c.createdById),
  ])

  const eventsForList = pendingEvents.map((e) => ({
    id: e.id,
    number: e.number,
    title: e.title,
    description: e.description,
    metaLine: `${e.dateFull} · ${e.type} · ${e.points} pts`,
    ownerName: e.createdById ? ownerNames.get(e.createdById) ?? '—' : '—',
    kind: 'event' as const,
  }))
  const challengesForList = pendingChallenges.map((c) => ({
    id: c.id,
    number: c.number,
    title: c.title,
    description: c.description,
    metaLine: `${c.points} pts por aprovação`,
    ownerName: c.createdById ? ownerNames.get(c.createdById) ?? '—' : '—',
    kind: 'challenge' as const,
  }))

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
          <Inbox size={20} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Aprovações
          </h1>
          <p className="text-sm text-muted-foreground">
            Propostas de empresas aguardando revisão da liderança.
          </p>
        </div>
      </header>

      <section>
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 inline-flex items-center gap-2">
          <Calendar size={12} /> Eventos pendentes ({eventsForList.length})
        </h2>
        <ApprovalList items={eventsForList} />
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 inline-flex items-center gap-2">
          <Target size={12} /> Desafios pendentes ({challengesForList.length})
        </h2>
        <ApprovalList items={challengesForList} />
      </section>
    </div>
  )
}
