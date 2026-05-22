import {
  Calendar,
  Globe,
  Lightbulb,
  MessageCircle,
  ShieldCheck,
  Users,
} from 'lucide-react'
import React from 'react'

const FeatureCard: React.FC<{
  icon: React.ReactNode
  title: string
  description: string
}> = ({ icon, title, description }) => (
  <div className="bg-card border border-border p-6 rounded-xl hover:border-muted transition-all duration-300 group h-full">
    <div className="mb-4 text-foreground group-hover:text-primary-destaque transition-colors duration-300">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-foreground mb-3">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">
      {description}
    </p>
  </div>
)

const About: React.FC = () => {
  const features = [
    {
      icon: <Users size={28} />,
      title: 'Networking',
      description:
        'Conecte-se com outros desenvolvedores para compartilhar conhecimentos e experiências, e fique por dentro das últimas tendências do mercado.',
    },
    {
      icon: <Calendar size={28} />,
      title: 'Eventos',
      description:
        'Participe de eventos exclusivos, como meetups e webinars, para aprender, trocar experiências e expandir sua rede de contatos.',
    },
    {
      icon: <ShieldCheck size={28} />,
      title: 'Programa de mentoria',
      description:
        'Receba apoio de profissionais experientes para aprimorar suas habilidades e acelerar seu crescimento como desenvolvedor.',
    },
    {
      icon: <MessageCircle size={28} />,
      title: 'Grupo de Inglês',
      description:
        'Aprimore suas habilidades de inglês técnico e ganhe confiança para atuar em ambientes internacionais.',
    },
    {
      icon: <Lightbulb size={28} />,
      title: 'Desafios',
      description:
        'Participe de desafios exclusivos para testar suas habilidades, aprender novas tecnologias e construir um portfólio.',
    },
    {
      icon: <Globe size={28} />,
      title: 'Showcase Projects',
      description:
        'Apresente seus projetos para a comunidade e receba feedback construtivo para melhorar ainda mais suas criações.',
    },
  ]

  return (
    <section id="community" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Sobre a comunidade
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl leading-relaxed">
            Nossa missão é criar um espaço colaborativo onde desenvolvedores de
            todos os níveis possam trocar conhecimento, aprender novas
            tecnologias e impulsionar suas carreiras.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
