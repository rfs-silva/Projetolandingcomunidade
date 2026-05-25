'use client'

import { AuthGate } from '@/components/auth/AuthGate'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ExternalLink, Github, Globe, Plus, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import type {
  ProjectCategoryDto,
  ProjectDto,
} from '@/server/schemas/project.schema'

type ShowcaseProps = {
  projects: ProjectDto[]
  categories: ProjectCategoryDto[]
}

const Showcase: React.FC<ShowcaseProps> = ({ projects, categories }) => {
  const [activeCategory, setActiveCategory] =
    useState<ProjectCategoryDto>('Todos')

  const filteredProjects =
    activeCategory === 'Todos'
      ? projects
      : projects.filter((project) => project.category === activeCategory)

  return (
    <section id="showcase" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="text-left max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Mural da Comunidade
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Explore projetos incríveis desenvolvidos pelos membros da nossa
              comunidade. Inspire-se, contribua e divulgue seu trabalho para o
              mundo.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <AuthGate
              authedHref="/dashboard/projetos/novo"
              title="Divulgue seu projeto"
              description="O mural de projetos é para membros da comunidade. Entre com sua conta GitHub para publicar."
            >
              <Button
                type="button"
                icon={<Plus size={18} className="mr-2" />}
                iconPosition="left"
                size="lg"
                className="w-full md:w-auto shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-shadow duration-300"
              >
                Divulgar projeto
              </Button>
            </AuthGate>
          </div>
        </div>

        <div className="mb-10 border-b border-border pb-4 overflow-x-auto hide-scrollbar">
          <div className="flex flex-nowrap md:flex-wrap gap-2 min-w-max md:min-w-0 pb-2 md:pb-0">
            {categories.map((category) => (
              <Button
                type="button"
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap bg-transparent',
                  activeCategory === category
                    ? 'bg-primary/10 text-primary-destaque border border-primary/20 hover:bg-background-secondary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background-secondary'
                )}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group bg-card border border-border rounded-xl overflow-hidden hover:border-muted transition-all duration-300 hover:shadow-xl hover:shadow-black/50 flex flex-col h-full"
            >
              <div className="relative h-48 overflow-hidden bg-background-secondary">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10" />
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={100}
                    height={100}
                    priority
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                ) : null}
                <div className="absolute top-3 right-3 z-20">
                  <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-[10px] font-bold text-foreground uppercase rounded border border-white/10 tracking-wider">
                    {project.category}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col grow">
                <div className="flex items-center gap-3 mb-4">
                  {project.authorAvatar ? (
                    <Avatar>
                      <AvatarImage
                        src={project.authorAvatar}
                        alt={project.author}
                      />
                    </Avatar>
                  ) : (
                    <UserAvatar name={project.author} seed={project.author} />
                  )}
                  <span className="text-sm text-muted-foreground font-medium">
                    por <span className="text-zinc-200">{project.author}</span>
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary-destaque transition-colors">
                  {project.title}
                </h3>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-2 grow">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-1 rounded bg-background-secondary/50 text-muted-foreground border border-zinc-700/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/50">
                  <Link
                    target="_blank"
                    href={project.demoUrl}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary/10 text-primary-destaque text-xs font-medium hover:bg-primary hover:text-foreground transition-all"
                  >
                    <Globe size={14} /> Live Demo
                  </Link>
                  <Link
                    target="_blank"
                    href={project.repoUrl}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-background-secondary text-zinc-300 text-xs font-medium hover:bg-zinc-700 hover:text-foreground transition-all"
                  >
                    <Github size={14} /> Código
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
            <Search className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum projeto encontrado nesta categoria.
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Button
            type="button"
            variant="outline-primary"
            size="lg"
            className="px-8 w-full h-10 sm:w-auto"
            icon={<ExternalLink size={16} className="ml-2" />}
            iconPosition="right"
          >
            Ver todos os projetos
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Showcase
