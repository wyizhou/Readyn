import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode
  action?: ReactNode
  padding?: CardPadding
  interactive?: boolean
  children?: ReactNode
}

const PAD: Record<CardPadding, string | number> = {
  none: 0,
  sm: 'var(--sp-4)',
  md: 'var(--sp-5)',
  lg: 'var(--sp-6)',
}

export function Card({ title, action, padding = 'md', interactive = false, children, style, ...rest }: CardProps) {
  const pad = PAD[padding] ?? 'var(--sp-5)'
  const css: CSSProperties = {
    background: 'var(--surface-card)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--border-subtle)',
    borderRadius: 'var(--r-lg)',
    boxShadow: 'var(--shadow-md), var(--inner-top)',
    transition: 'border-color var(--dur-base), transform var(--dur-base) var(--ease-out)',
    cursor: interactive ? 'pointer' : 'default',
    ...style,
  }
  return (
    <section
      style={css}
      onMouseEnter={
        interactive
          ? (e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }
          : undefined
      }
      onMouseLeave={
        interactive
          ? (e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
              e.currentTarget.style.transform = 'none'
            }
          : undefined
      }
      {...rest}
    >
      {(title || action) && (
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: `var(--sp-4) ${typeof pad === 'string' ? pad : pad + 'px'} 0`,
          }}
        >
          <h3
            style={{
              margin: 0,
              font: 'var(--fw-semibold) var(--fs-sm)/1.2 var(--font-sans)',
              color: 'var(--text-strong)',
              letterSpacing: '0.01em',
            }}
          >
            {title}
          </h3>
          {action}
        </header>
      )}
      <div style={{ padding: pad }}>{children}</div>
    </section>
  )
}
