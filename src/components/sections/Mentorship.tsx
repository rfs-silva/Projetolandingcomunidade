import { AuthGate } from '@/components/auth/AuthGate'
import { Button } from '@/components/ui/button'
import { Braces, Code2, Lightbulb, Smartphone } from 'lucide-react'
import React from 'react'

const Mentorship: React.FC = () => {
  const tracks = [
    { icon: <Braces size={20} />, title: 'Back-end Development' },
    { icon: <Code2 size={20} />, title: 'Front-end Development' },
    { icon: <Smartphone size={20} />, title: 'Mobile Development' },
    { icon: <Lightbulb size={20} />, title: 'Product & Design' },
  ]

  return (
    <section id="mentorship" className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-left">
            Programa de mentoria
          </h2>

          <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6 text-left">
            Através das mentorias da nossa comunidade, você participa de
            encontros individuais focados em seu crescimento, guiados por
            profissionais experientes das principais empresas de tecnologia.
            Esse acompanhamento personalizado é fundamental para acelerar seu
            desenvolvimento e garantir que você aproveite ao máximo tudo o que
            aprendeu.
          </p>

          <ul className="space-y-3 text-muted-foreground text-left">
            <li className="flex items-baseline gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-secondary shrink-0"></span>
              <span>Mentorias individuais: Encontro com mentores;</span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-secondary shrink-0"></span>
              <span>
                Flexibilidade de horários: Horários que se encaixam à sua
                rotina;
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-secondary shrink-0"></span>
              <span>Escolha sua pauta de acordo com os seus objetivos.</span>
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {tracks.map((track, idx) => (
            <div
              key={idx}
              className="bg-card border border-border p-6 rounded-xl h-44 flex flex-col justify-between group hover:border-muted transition-colors"
            >
              <div className="w-10 h-10 bg-background-secondary/50 border border-zinc-700/50 rounded-lg flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                {track.icon}
              </div>
              <h3 className="font-semibold text-foreground">{track.title}</h3>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <AuthGate
            authedHref="/dashboard"
            title="Candidate-se à mentoria"
            description="O programa de mentoria é exclusivo para membros. Entre com sua conta GitHub para se candidatar."
          >
            <Button type="button" className="w-full h-10 sm:w-auto min-w-50">
              Quero ser mentorado
            </Button>
          </AuthGate>

          <AuthGate
            authedHref="/dashboard"
            title="Inscreva-se como mentor"
            description="Só membros podem se inscrever como mentores. Entre com sua conta GitHub para começar."
          >
            <Button
              type="button"
              variant="outline-primary"
              className="w-full h-10 sm:w-auto min-w-50"
            >
              Quero ser mentor
            </Button>
          </AuthGate>
        </div>
      </div>
    </section>
  )
}

export default Mentorship
