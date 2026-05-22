'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, Monitor, Users } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { EVENTS, type Event } from '../../data'

const EventCard: React.FC<Event> = ({
  number,
  title,
  description,
  dateFull,
  dateShort,
  type,
  imageIndex,
}) => (
  <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col md:flex-row hover:border-muted transition-all duration-300 group h-full p-4">
    <div className="w-full md:w-45 h-48 md:h-auto relative shrink-0 bg-background-secondary rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      <Image
        src={`https://picsum.photos/seed/${imageIndex}/400/400`}
        alt={title}
        width={100}
        height={100}
        priority
        className="w-full h-full object-cover opacity-50 mix-blend-overlay"
      />

      <div className="absolute inset-0 z-20 p-4 flex flex-col justify-between">
        <div>
          <h4 className="text-foreground font-bold text-lg leading-tight">
            Evento
          </h4>
          <span className="text-muted-foreground text-sm font-bold">
            {number}
          </span>
          <p className="text-[10px] text-zinc-300 mt-2 font-medium">
            {dateFull}
          </p>
        </div>

        <div className="max-h-20 flex justify-center">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={100}
            height={100}
            priority
            className="h-full opacity-80"
          />
        </div>
      </div>
    </div>

    <div className="p-5 flex flex-col justify-between grow">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3 md:line-clamp-2">
          {description}
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-background-secondary border border-zinc-700 text-xs text-zinc-300">
            <Calendar size={12} />
            <span>{dateShort}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-background-secondary border border-zinc-700 text-xs text-zinc-300">
            {type === 'Remoto' ? <Monitor size={12} /> : <Users size={12} />}
            <span>{type}</span>
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={() => {}}
        className="w-full h-10 bg-[#182845] text-primary-destaque hover:text-foreground border border-blue-900/30 hover:border-transparent py-2.5 rounded-lg text-sm font-medium transition-all duration-300"
      >
        Inscreva-se agora
      </Button>
    </div>
  </div>
)

const Events: React.FC = () => {
  return (
    <section id="events" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-12 text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Eventos
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-5xl leading-relaxed">
            Roraima Fullstack Developers é um lugar para desenvolvedores
            aprenderem, compartilharem e crescerem. Nossa comunidade é
            construída por desenvolvedores, para desenvolvedores.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {EVENTS.map((event, idx) => (
            <EventCard key={idx} {...event} />
          ))}
        </div>

        <div className="flex justify-center w-full">
          <Button
            type="button"
            onClick={() => {}}
            className="bg-primary hover:bg-primary-hover text-foreground px-8 h-12 w-full sm:w-auto"
          >
            Ver todos os eventos <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Events
