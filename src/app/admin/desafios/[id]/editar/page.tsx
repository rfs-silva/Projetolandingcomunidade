import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'
import { requireContentCreatorSession } from '@/server/lib/admin-session'
import { adminChallengesService } from '@/server/services/admin-challenges.service'
import { ChallengeForm } from '../../ChallengeForm'

export const metadata = {
  title: 'Admin · Editar desafio',
}

export const dynamic = 'force-dynamic'

export default async function EditChallengePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireContentCreatorSession()
  const { id } = await params
  const challenge = await adminChallengesService.getById(id, {
    userId: session.userId,
    profileType: session.profile.type,
  })

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Link
        href="/admin/desafios"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> Voltar para desafios
      </Link>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
          <Pencil size={20} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Editar desafio
          </h1>
          <p className="text-sm text-muted-foreground">
            {challenge.number} · {challenge.title}
          </p>
        </div>
      </div>

      <ChallengeForm
        initial={{
          id: challenge.id,
          number: challenge.number,
          title: challenge.title,
          description: challenge.description,
          imageIndex: challenge.imageIndex,
          visibility: challenge.visibility,
          points: challenge.points,
          tags: challenge.tags,
        }}
      />
    </div>
  )
}
