'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

const Hero: React.FC = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-12 bg-background overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [bg-size:24px_24px] opacity-20 pointer-events-none"></div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-150 md:max-w-250 h-75 md:h-100 bg-blue-900/20 blur-[80px] md:blur-[120px] pointer-events-none rounded-full"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-6 md:gap-8">
        {/* Area da logo */}
        <div className="mb-2 md:mb-4 animate-fade-in-up">
          <div className="relative flex flex-col items-center">
            <Image
              src="/logo.svg"
              alt="RR Fullstack Developers"
              width={128}
              height={128}
              priority
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mb-4 drop-shadow-2xl"
            />
          </div>
        </div>

        <h1 className="font-bold font-afacad tracking-tight text-foreground leading-[1.1] animate-fade-in-up delay-100 w-full">
          <span className="block text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-zinc-100 md:whitespace-nowrap">
            Faça parte da comunidade
          </span>
          <span className="block text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-foreground mt-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] md:whitespace-nowrap">
            RR Fullstack Devs
          </span>
        </h1>

        <p className="text-base sm:text-xl md:text-3xl text-muted-foreground max-w-xs sm:max-w-2xl leading-tight animate-fade-in-up delay-200 mx-auto">
          Aprenda, compartilhe conhecimento e conecte-se com as principais
          referências em tecnologia de Roraima.
        </p>

        <div className="pt-4 sm:pt-6 w-full flex justify-center animate-fade-in-up delay-300">
          <Button
            type="button"
            className="w-full sm:w-auto h-12 px-8 text-base shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-shadow duration-300"
            icon={<ArrowRight size={18} />}
            iconPosition="right"
            onClick={() =>
              document
                .getElementById('community')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Entrar na comunidade
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Hero
