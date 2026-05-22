'use client'

import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  ExternalLink,
  Layers,
  LucideProps,
  Monitor,
} from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { CHALLENGES_DATA } from '../../data'

const ChallengeCard: React.FC<{
  number: string
  title: string
  description: string
  tags: {
    icon: React.ForwardRefExoticComponent<
      Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
    > | null
    label: string
  }[]
  imageIndex: number
}> = ({ number, title, description, tags, imageIndex }) => (
  <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full hover:border-muted transition-all duration-300 group">
    <div className="h-40 relative bg-background-secondary">
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      <Image
        width={100}
        height={100}
        priority
        src={`https://picsum.photos/seed/${imageIndex + 90}/600/400`}
        alt={title}
        className="w-full h-full object-cover opacity-60 mix-blend-overlay"
      />
      <div className="absolute inset-0 z-20 flex items-center justify-center gap-4">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={100}
          height={100}
          priority
          className="w-full max-w-16 drop-shadow-lg"
        />
        <div className="flex flex-col text-foreground drop-shadow-lg">
          <span className="font-bold text-xl leading-none">Desafio</span>
          <span className="font-bold text-lg opacity-80">{number}</span>
        </div>
      </div>
    </div>

    <div className="p-5 flex flex-col grow">
      <h3 className="text-lg font-bold text-foreground mb-4 line-clamp-1">
        {title}
      </h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-background-secondary-subtle border border-border text-[10px] uppercase tracking-wider font-semibold text-muted-foreground"
          >
            {tag.icon && <tag.icon size={12} />}
            {tag.label}
          </div>
        ))}
      </div>

      <p className="text-muted-foreground text-sm mb-6 grow line-clamp-3 leading-relaxed">
        {description}
      </p>

      <Button
        type="button"
        icon={
          <ArrowRight
            size={16}
            className="ml-2 transition-transform group-hover/btn:translate-x-1"
          />
        }
        iconPosition="right"
        onClick={() => {}}
        className="mt-auto w-full h-10 bg-[#151f32] hover:bg-[#1e2e4a] text-primary-destaque font-medium py-2.5 rounded-xl flex items-center justify-center text-sm transition-colors group/btn"
      >
        Ver desafio{' '}
      </Button>
    </div>
  </div>
)

const Challenges: React.FC = () => {
  const challenges = CHALLENGES_DATA.map((challenge) => ({
    ...challenge,
    tags: challenge.tags.map((tag) => ({
      icon: getChallengeIcon(tag.iconName),
      label: tag.label,
    })),
  }))

  return (
    <section id="challenges" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Desafios
          </h2>
          <p className="text-lg text-muted-foreground max-w-5xl leading-relaxed">
            Roraima Fullstack Developers é um lugar para desenvolvedores
            aprenderem, compartilharem e crescerem. Nossa comunidade é
            construída por desenvolvedores, para desenvolvedores.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {challenges.map((challenge, idx) => (
            <ChallengeCard key={idx} {...challenge} />
          ))}
        </div>

        <div className="flex justify-center w-full">
          <Button
            type="button"
            icon={<ExternalLink size={16} className="ml-2" />}
            iconPosition="right"
            onClick={() => {}}
            className="bg-primary hover:bg-primary-hover text-foreground px-8 h-12 rounded-xl"
          >
            Ver todos os desafios
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Challenges

const getChallengeIcon = (
  iconName: string
): React.ForwardRefExoticComponent<
  Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
> | null => {
  switch (iconName) {
    case 'Monitor':
      return Monitor
    case 'Layers':
      return Layers
    default:
      return null
  }
}
