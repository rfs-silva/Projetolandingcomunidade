import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import About from '@/components/sections/About'
import Challenges from '@/components/sections/Challenges'
import Events from '@/components/sections/Events'
import Hero from '@/components/sections/Hero'
import Mentorship from '@/components/sections/Mentorship'
import Showcase from '@/components/sections/Showcase'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RR Fullstack Developers - Comunidade de Desenvolvedores em Roraima',
  description:
    'Comunidade de desenvolvedores fullstack em Roraima. Networking, eventos, desafios e mentoria para crescer na carreira tech.',
  keywords:
    'desenvolvimento fullstack, comunidade de desenvolvedores, Roraima, networking, eventos tech, desafios de programação, mentoria para desenvolvedores',
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-foreground overflow-x-hidden">
      <Header />
      <main className="grow">
        <Hero />
        <About />
        <Events />
        <Challenges />
        <Showcase />
        <Mentorship />
      </main>
      <Footer />
    </div>
  )
}
