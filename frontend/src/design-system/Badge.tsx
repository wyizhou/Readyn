import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'accent' | 'positive' | 'caution' | 'critical' | 'violet'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  dot?: boolean
  children?: ReactNode
}

const TONES: Record<BadgeTone, { bg: string; fg: string; dot: string }> = {
  neutral: { bg: 'rgba(174,183,199,0.12)', fg: 'var(--text-muted)', dot: 'var(--ink-300)' },
  accent: { bg: 'rgba(59,91,255,0.16)', fg: 'var(--blue-300)', dot: 'var(--blue-500)' },
  positive: { bg: 'rgba(24,201,140,0.15)', fg: 'var(--green-400)', dot: 'var(--green-500)' },
  caution: { bg: 'rgba(255,176,32,0.15)', fg: 'var(--amber-400)', dot: 'var(--amber-500)' },
  critical: { bg: 'rgba(255,77,94,0.15)', fg: 'var(--red-400)', dot: 'var(--red-500)' },
  violet: { bg: 'rgba(124,77,255,0.16)', fg: 'var(--violet-300)', dot: 'var(--violet-500)' },
}

export function Badge({ tone = 'neutral', dot = false, children, style, ...rest }: BadgeProps) {
  const t = TONES[tone] || TONES.neutral
  const css: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 22,
    padding: '0 9px',
    borderRadius: 'var(--r-pill)',
    background: t.bg,
    color: t.fg,
    font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
    letterSpacing: 'var(--ls-wide)',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    ...style,
  }
  return (
    <span style={css} {...rest}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot, flex: 'none' }} />}
      {children}
    </span>
  )
}
