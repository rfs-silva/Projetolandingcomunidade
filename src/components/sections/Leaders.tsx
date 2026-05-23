import { Github, Linkedin } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import type { LeaderDto } from '@/server/schemas/leader.schema'

type LeadersProps = {
  leaders: LeaderDto[]
}

const Leaders: React.FC<LeadersProps> = ({ leaders }) => {
  if (leaders.length === 0) return null

  return (
    <section id="leaders" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-12 text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Lideranças
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-5xl leading-relaxed">
            Quem organiza, articula e mantém a comunidade viva no dia a dia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaders.map((leader) => (
            <article
              key={leader.name}
              className="bg-card border border-border rounded-xl p-6 flex flex-col items-start gap-4 hover:border-muted transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <UserAvatar
                  size="lg"
                  src={leader.avatarUrl}
                  name={leader.name}
                  seed={leader.githubUsername ?? leader.name}
                />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {leader.name}
                  </h3>
                  <span className="text-xs uppercase tracking-wider text-primary-destaque">
                    {leader.role}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {leader.bio}
              </p>

              {(leader.githubUsername || leader.linkedinUrl) && (
                <div className="flex gap-3 mt-auto pt-2">
                  {leader.githubUsername && (
                    <Link
                      target="_blank"
                      href={`https://github.com/${leader.githubUsername}`}
                      aria-label={`GitHub de ${leader.name}`}
                      className="p-2 rounded-lg bg-background-secondary text-zinc-300 hover:bg-primary hover:text-foreground transition-all"
                    >
                      <Github size={16} />
                    </Link>
                  )}
                  {leader.linkedinUrl && (
                    <Link
                      target="_blank"
                      href={leader.linkedinUrl}
                      aria-label={`LinkedIn de ${leader.name}`}
                      className="p-2 rounded-lg bg-background-secondary text-zinc-300 hover:bg-primary hover:text-foreground transition-all"
                    >
                      <Linkedin size={16} />
                    </Link>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Leaders
