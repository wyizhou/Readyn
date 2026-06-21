import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

export type Trend = 'up' | 'down' | 'flat'

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode
  value: ReactNode
  unit?: ReactNode
  delta?: ReactNode
  trend?: Trend
  accent?: string
  children?: ReactNode
}

const TREND: Record<Trend, { color: string; glyph: string }> = {
  up: { color: 'var(--green-400)', glyph: '▲' },
  down: { color: 'var(--red-400)', glyph: '▼' },
  flat: { color: 'var(--text-faint)', glyph: '–' },
}

export function StatCard({
  label,
  value,
  unit,
  delta,
  trend = 'flat',
  accent = 'var(--accent)',
  children,
  style,
  ...rest
}: StatCardProps) {
  const t = TREND[trend] || TREND.flat
  const css: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--sp-3)',
    padding: 'var(--sp-5)',
    background: 'var(--surface-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--r-lg)',
    boxShadow: 'var(--inner-top)',
    ...style,
  }
  return (
    <div style={css} {...rest}>
      <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accent }} />
      <span
        style={{
          font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
          color: 'var(--text-muted)',
          letterSpacing: 'var(--ls-label)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span
          style={{
            font: 'var(--fw-bold) var(--fs-display-lg)/1 var(--font-display)',
            color: 'var(--text-strong)',
            letterSpacing: 'var(--ls-tight)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
        {unit && <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-faint)' }}>{unit}</span>}
      </div>
      {delta != null && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-mono)',
            color: t.color,
          }}
        >
          <span style={{ fontSize: 9 }}>{t.glyph}</span>
          {delta}
        </span>
      )}
      {children}
    </div>
  )
}
