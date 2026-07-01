// Data-source transparency layer (a core product differentiator):
//  - SourceBadge: a small labelled chip — Garmin 直供 / Trainalyze 自算 / 混合来源.
//  - HowInfo: an ⓘ trigger revealing a "how is this calculated" popover
//    (definition + formula + params + provenance). User-visible — NOT gated by
//    any spec/annotation toggle.
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { sourceMeta } from '../lib/taxonomy'
import type { SourceKey } from '../lib/types'

export interface SourceBadgeProps {
  source: SourceKey
  size?: 'xs' | 'sm'
}

export function SourceBadge({ source, size = 'sm' }: SourceBadgeProps) {
  const m = sourceMeta[source]
  if (!m) return null
  const fs = size === 'xs' ? '9px' : 'var(--fs-2xs)'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: size === 'xs' ? '3px 7px' : '4px 9px',
        borderRadius: 'var(--r-pill)',
        background: m.bg,
        border: `1px solid ${m.color}`,
        flex: 'none',
      }}
    >
      <Icon name={m.icon} size={size === 'xs' ? 10 : 12} color={m.color} />
      <span
        style={{
          font: `var(--fw-bold) ${fs}/1 var(--font-sans)`,
          letterSpacing: 'var(--ls-wide)',
          color: m.color,
          whiteSpace: 'nowrap',
        }}
      >
        {m.label}
      </span>
    </span>
  )
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '54px 1fr', gap: 10, alignItems: 'start' }}>
      <span
        style={{
          font: 'var(--fw-semibold) 9px/1.4 var(--font-sans)',
          letterSpacing: 'var(--ls-wide)',
          textTransform: 'uppercase',
          color: 'var(--text-faint)',
          paddingTop: 1,
        }}
      >
        {k}
      </span>
      <span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1.45 var(--font-sans)', color: 'var(--text-body)' }}>{v}</span>
    </div>
  )
}

export interface HowInfoProps {
  source?: SourceKey
  title: string
  definition?: string
  formula?: string
  params?: ReactNode
  family?: ReactNode
  placement?: 'bottom' | 'top' | 'left'
  w?: number
}

export function HowInfo({ source, title, definition, formula, params, family, placement = 'bottom', w = 320 }: HowInfoProps) {
  const [open, setOpen] = useState(false)
  const m = source ? sourceMeta[source] : undefined
  const pos =
    placement === 'top'
      ? { bottom: 'calc(100% + 8px)', right: 0 }
      : placement === 'left'
        ? { right: 'calc(100% + 8px)', top: -4 }
        : { top: 'calc(100% + 8px)', right: 0 }
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="如何计算"
        aria-expanded={open}
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: 'none',
          cursor: 'help',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: open ? 'var(--surface-raised)' : 'transparent',
          color: 'var(--text-faint)',
          flex: 'none',
        }}
      >
        <Icon name="info" size={14} color={open ? 'var(--blue-300)' : 'var(--text-faint)'} />
      </button>
      {open && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            ...pos,
            width: w,
            zIndex: 80,
            padding: 16,
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--r-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 11,
            textAlign: 'left',
            cursor: 'default',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1.2 var(--font-sans)', color: 'var(--text-strong)' }}>{title}</span>
            {m && source && (
              <span style={{ marginLeft: 'auto' }}>
                <SourceBadge source={source} size="xs" />
              </span>
            )}
          </div>
          {definition && (
            <p style={{ margin: 0, font: 'var(--fw-regular) var(--fs-xs)/1.55 var(--font-sans)', color: 'var(--text-muted)', textWrap: 'pretty' }}>
              {definition}
            </p>
          )}
          {formula && (
            <div
              style={{
                padding: '9px 11px',
                background: 'var(--bg-app)',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--r-sm)',
                font: 'var(--fw-medium) var(--fs-xs)/1.4 var(--font-mono)',
                color: 'var(--blue-300)',
                overflowX: 'auto',
              }}
            >
              {formula}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 9, borderTop: '1px solid var(--hairline)' }}>
            {family && <Row k="算法家族" v={family} />}
            {params && <Row k="参数" v={params} />}
            {m && <Row k="出处" v={m.desc} />}
          </div>
        </div>
      )}
    </span>
  )
}
