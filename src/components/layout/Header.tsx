'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight, ChevronRight, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  const navLinks = [
    { name: 'Início', href: '#home', id: 'home' },
    { name: 'Comunidade', href: '#community', id: 'community' },
    { name: 'Eventos', href: '#events', id: 'events' },
    { name: 'Desafios', href: '#challenges', id: 'challenges' },
    { name: 'Showcase', href: '#showcase', id: 'showcase' },
    { name: 'Mentoria', href: '#mentorship', id: 'mentorship' },
  ]

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 40
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
      setActiveSection(id)
      setIsMobileMenuOpen(false)
      window.history.pushState(null, '', `#${id}`)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)

      let current = ''
      for (const link of navLinks) {
        const section = document.getElementById(link.id)
        if (section) {
          const sectionTop = section.offsetTop
          if (window.scrollY >= sectionTop - 150) {
            current = link.id
          }
        }
      }

      if (window.scrollY < 100) {
        current = 'home'
      }

      if (current) setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <header className="flex items-center justify-center fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 py-4 md:py-6">
        <div
          className={cn(
            'w-full max-w-7xl mx-6 h-auto p-4 flex items-center justify-between rounded-2xl transition-all duration-300 border',
            isScrolled || isMobileMenuOpen
              ? 'bg-header-background backdrop-blur-lg border-subtle'
              : 'bg-transparent border-transparent'
          )}
        >
          <Link
            href="#home"
            onClick={(e) => handleNavClick(e, 'home')}
            className="flex items-center gap-3 group z-50 relative focus:outline-none"
          >
            <Image
              src="/logo-horizontal.svg"
              alt="RR Fullstack Developers"
              height={40}
              width={40}
              priority
              className="h-8 md:h-10 w-auto transition-transform group-hover:scale-105"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.id)}
                className={cn(
                  'px-4 py-2 text-sm font-medium text-center rounded-4xl transition-all focus:outline-none',
                  activeSection === link.id
                    ? 'text-foreground bg-card'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button
              type="button"
              loading={false}
              icon={<ArrowRight size={18} />}
              iconPosition="right"
              variant="default"
              onClick={() => {
                const el = document.getElementById('community')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="text-sm px-5 py-2.5 h-12"
            >
              Entrar na comunidade
            </Button>
          </div>

          <Button
            type="button"
            className="md:hidden text-zinc-300 hover:text-foreground bg-transparent hover:bg-background-secondary p-2 z-50 relative focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </Button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden transition-all duration-500 ease-in-out ${
          isMobileMenuOpen
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible -translate-y-4'
        }`}
      >
        <div className="flex flex-col h-full pt-28 pb-10 px-6 overflow-y-auto">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link, idx) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.id)}
                className={`group flex items-center justify-between py-4 border-b border-subtle text-2xl font-medium transition-all duration-300 ${
                  activeSection === link.id
                    ? 'text-foreground pl-2 border-l-4 border-primary border-b-transparent bg-white/5'
                    : 'text-muted-foreground hover:text-foreground hover:pl-2'
                }`}
                style={{ transitionDelay: `${idx * 50}ms` }}
              >
                <span>{link.name}</span>
                <ChevronRight
                  size={20}
                  className={`transition-transform duration-300 ${
                    activeSection === link.id
                      ? 'text-primary-destaque opacity-100'
                      : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-8 flex flex-col gap-4 animate-fade-in-up">
            <Button
              className="w-full justify-center h-14 text-lg shadow-[0_0_20px_rgba(37,99,235,0.2)]"
              icon={<ChevronRight />}
              iconPosition="right"
              onClick={() => {
                setIsMobileMenuOpen(false)
                setTimeout(() => {
                  const el = document.getElementById('community')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }, 300)
              }}
            >
              Entrar na comunidade
            </Button>

            <p className="text-center text-muted-secondary text-xs mt-4">
              © {new Date().getFullYear()} RR Fullstack Developers
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Header
