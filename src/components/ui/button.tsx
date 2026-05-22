'use client'

import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import * as React from 'react'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none cursor-pointer disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:border-primary-hover',
        'outline-primary':
          'border bg-background shadow-xs hover:text-primary-destaque hover:border-primary-destaque text-primary-hover border-primary-hover',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        xs: 'h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-xs': 'size-6 rounded-md',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
    loadingText?: string
    spinnerPosition?: 'left' | 'right'
    icon?: React.ReactNode
    iconPosition?: 'left' | 'right'
  }

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  loading = false,
  loadingText = 'Carregando...',
  spinnerPosition = 'left',
  icon,
  iconPosition = 'left',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'

  const ref = React.useRef<HTMLButtonElement>(null)
  const [width, setWidth] = React.useState<number>()

  const hasIcon = Boolean(icon)
  const isIconOnly = !children && (hasIcon || loading)

  React.useLayoutEffect(() => {
    if (!ref.current) return
    if (!loading) {
      setWidth(ref.current.offsetWidth)
    }
  }, [loading, children])

  const renderIcon = () => {
    if (loading) {
      return <Loader2 className="animate-spin" size={18} />
    }

    if (hasIcon && React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement)
    }

    return null
  }

  const content = (
    <span
      className={cn(
        'inline-flex items-center gap-2 transition-opacity',
        loading && 'opacity-90'
      )}
    >
      {(iconPosition === 'left' && !loading) ||
      (loading && spinnerPosition === 'left')
        ? renderIcon()
        : null}

      {!isIconOnly && (loading ? loadingText : children)}

      {(iconPosition === 'right' && !loading) ||
      (loading && spinnerPosition === 'right')
        ? renderIcon()
        : null}
    </span>
  )

  return (
    <Comp
      ref={ref}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-live="polite"
      aria-label={
        isIconOnly
          ? (props['aria-label'] ??
            (typeof children === 'string' ? children : 'Button'))
          : props['aria-label']
      }
      className={cn(buttonVariants({ variant, size, className }))}
      style={loading && width ? { width } : undefined}
      {...props}
    >
      {content}
    </Comp>
  )
}

export { Button, buttonVariants }
