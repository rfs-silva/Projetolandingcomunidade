import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { requireAdminSession } from '@/server/lib/admin-session'
import { companiesService } from '@/server/services/companies.service'
import { companyApplicationStatusSchema } from '@/server/schemas/company.schema'
import { CompanyApplicationsList } from './CompanyApplicationsList'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Empresas',
}

export const dynamic = 'force-dynamic'

const FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'APPROVED', label: 'Aprovadas' },
  { value: 'REJECTED', label: 'Recusadas' },
]

export default async function AdminEmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  await requireAdminSession()
  const params = await searchParams
  const parsed = params.status
    ? companyApplicationStatusSchema.safeParse(params.status)
    : null
  const activeStatus = parsed?.success ? parsed.data : undefined

  const [items, pendingTotal] = await Promise.all([
    companiesService.listAdmin({ status: activeStatus }),
    companiesService.countPending(),
  ])

  function filterHref(value: string) {
    return value ? `/admin/empresas?status=${value}` : '/admin/empresas'
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-destaque">
          <Building2 size={20} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Candidaturas de empresa
          </h1>
          <p className="text-sm text-muted-foreground">
            Empresas que se candidataram via{' '}
            <code className="text-xs">/empresa/cadastro</code>. Aprovar cria a
            conta tipo COMPANY.
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-subtle pb-4">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-2">
          Filtro
        </span>
        {FILTERS.map((opt) => {
          const isActive = (activeStatus ?? '') === opt.value
          const isPendingChip = opt.value === 'PENDING'
          return (
            <Link
              key={opt.value || 'all'}
              href={filterHref(opt.value)}
              className={cn(
                'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary-destaque border-primary/30'
                  : 'bg-background-secondary text-muted-foreground border-subtle hover:text-foreground',
              )}
            >
              {opt.label}
              {isPendingChip && pendingTotal > 0 ? (
                <span className="text-[10px] font-semibold text-amber-300">
                  {pendingTotal}
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>

      <CompanyApplicationsList
        items={items.map((i) => ({
          id: i.id,
          companyName: i.companyName,
          contactName: i.contactName,
          email: i.email,
          website: i.website,
          linkedinUrl: i.linkedinUrl,
          description: i.description,
          status: i.status,
          reviewerNote: i.reviewerNote,
          reviewedAt: i.reviewedAt ? i.reviewedAt.toISOString() : null,
          createdAt: i.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
