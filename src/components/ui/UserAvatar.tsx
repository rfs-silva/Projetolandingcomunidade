'use client'

import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

function getInitials(name?: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function hashToHue(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 360
}

function getGradientStyle(seed: string): React.CSSProperties {
  const hue = hashToHue(seed || 'anon')
  return {
    backgroundImage: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 50) % 360} 70% 42%))`,
    color: '#fff',
  }
}

type UserAvatarProps = {
  name?: string | null
  src?: string | null
  seed?: string | null
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function UserAvatar({
  name,
  src,
  seed,
  size = 'default',
  className,
}: UserAvatarProps) {
  const initials = getInitials(name)
  const fallbackSeed = seed ?? name ?? ''
  const gradient = getGradientStyle(fallbackSeed)

  return (
    <Avatar size={size} className={className}>
      {src ? <AvatarImage src={src} alt={name ?? 'Avatar'} /> : null}
      <AvatarFallback
        className={cn('font-semibold tracking-wide')}
        style={gradient}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
