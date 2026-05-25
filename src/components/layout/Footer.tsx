'use client'

import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
} from '@/components/icons/brand'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const socialMediaLinks = [
  {
    name: 'LinkedIn',
    icon: LinkedinIcon,
    url: 'https://www.linkedin.com/company/roraimafullstack',
  },
  { name: 'Twitter', icon: TwitterIcon, url: '#' },
  {
    name: 'GitHub',
    icon: GithubIcon,
    url: 'https://github.com/roraimafullstackdevs',
  },
  {
    name: 'Instagram',
    icon: InstagramIcon,
    url: 'https://www.instagram.com/roraimafullstackdevs/',
  },
  {
    name: 'Facebook',
    icon: FacebookIcon,
    url: 'https://www.facebook.com/share/1C6DU2paFr/',
  },
]

const Footer: React.FC = () => {
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-background border-t border-subtle py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
        <div className="mb-8 md:mb-10">
          <Link
            href="#home"
            onClick={scrollToTop}
            className="flex flex-col items-center gap-2 cursor-pointer group hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.svg"
              alt="Comunidade Roraima Devs"
              width={48}
              height={48}
              priority
              className="h-12 w-12 transition-transform group-hover:scale-110 duration-500"
            />
            <div className="flex flex-col items-center mt-2">
              <span className="font-bold text-[10px] tracking-widest text-muted-secondary group-hover:text-zinc-300 transition-colors">
                COMUNIDADE
              </span>
              <span className="font-bold text-[10px] tracking-widest text-primary group-hover:text-primary-destaque transition-colors">
                RORAIMA DEVS
              </span>
            </div>
          </Link>
        </div>

        <div className="flex gap-4 md:gap-6 mb-8 md:mb-12 flex-wrap justify-center">
          {socialMediaLinks.map((social, i) => {
            const Icon = social.icon

            return (
              <Link
                key={i}
                href={social.url}
                className="p-2.5 bg-background-secondary text-zinc-300 rounded-full hover:bg-primary hover:text-foreground transition-all hover:scale-110 duration-300 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              >
                <Icon size={20} />
                <span className="sr-only">{social.name}</span>
              </Link>
            )
          })}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 text-center">
          <p className="text-muted text-xs md:text-sm">
            © {new Date().getFullYear()} Comunidade Roraima Devs.
          </p>
          <span className="hidden md:block text-zinc-800">•</span>
          <p className="text-muted text-xs md:text-sm">
            Desenvolvido com ❤️ em Roraima.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs md:text-sm">
          <Link
            href="/manifesto"
            className="text-muted-secondary hover:text-foreground transition-colors"
          >
            Manifesto
          </Link>
          <span className="text-zinc-800">•</span>
          <Link
            href="/termos"
            className="text-muted-secondary hover:text-foreground transition-colors"
          >
            Termos de Uso
          </Link>
          <span className="text-zinc-800">•</span>
          <Link
            href="/privacidade"
            className="text-muted-secondary hover:text-foreground transition-colors"
          >
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
