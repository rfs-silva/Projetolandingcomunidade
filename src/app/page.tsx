import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AccountDeletedBanner } from '@/components/AccountDeletedBanner'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import About from '@/components/sections/About'
import Challenges from '@/components/sections/Challenges'
import Events from '@/components/sections/Events'
import Hero from '@/components/sections/Hero'
import Leaders from '@/components/sections/Leaders'
import Mentorship from '@/components/sections/Mentorship'
import Showcase from '@/components/sections/Showcase'
import { eventsService } from '@/server/services/events.service'
import { challengesService } from '@/server/services/challenges.service'
import { projectsService } from '@/server/services/projects.service'
import { leadersService } from '@/server/services/leaders.service'

export const metadata: Metadata = {
  title: 'Comunidade Roraima Devs',
  description:
    'Comunidade de desenvolvedores em Roraima. Networking, eventos, desafios e mentoria para crescer na carreira tech.',
  keywords:
    'comunidade de desenvolvedores, Roraima, networking, eventos tech, desafios de programação, mentoria, dev',
}

// Render dinâmico por requisição. Os datasets são pequenos
// e o Prisma reaproveita a conexão via singleton.
export const dynamic = 'force-dynamic'

export default async function Home() {
  const [events, challenges, projects, leaders] = await Promise.all([
    eventsService.list({}),
    challengesService.list(),
    projectsService.list({}),
    leadersService.list(),
  ])
  const categories = projectsService.listCategories()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-foreground overflow-x-hidden">
      <Suspense fallback={null}>
        <AccountDeletedBanner />
      </Suspense>
      <Header />
      <main className="grow">
        <Hero />
        <About />
        <Leaders leaders={leaders} />
        <Events events={events} />
        <Challenges challenges={challenges} />
        <Showcase projects={projects} categories={categories} />
        <Mentorship />
      </main>
      <Footer />
    </div>
  )
}
