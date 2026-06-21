import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

export interface ProgressRingProps extends HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  size?: number
  stroke?: number
  color?: string
  track?: string
  label?: ReactNode
  sublabel?: ReactNode
}

export function ProgressRing({
  value = 0,
  max = 100,
  size = 96,
  stroke = 9,
  color = 'var(--accent)',
  track = 'var(--ink-700)',
  label,
  sublabel,
  style,
  ...rest
}: ProgressRingProps) {
  const pct = Math.max(0, Math.min(1, value / max))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = c * pct
  const css: CSSProperties = { position: 'relative', width: size, height: size, ...style }

  return (
    <div style={css} {...rest}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: 'stroke-dasharray var(--dur-slow) var(--ease-out)' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <span
          style={{
            font: `var(--fw-bold) ${Math.round(size * 0.26)}px/1 var(--font-display)`,
            color: 'var(--text-strong)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {label != null ? label : Math.round(pct * 100)}
        </span>
        {sublabel && (
          <span
            style={{
              font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
              color: 'var(--text-muted)',
              letterSpacing: 'var(--ls-wide)',
              textTransform: 'uppercase',
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}
