import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Icon } from '../Icon'
import { useSpec } from './SpecContext'

type Placement = 'top' | 'bottom' | 'left' | 'right'

interface RowProps {
  k: string
  v: ReactNode
  mono?: boolean
}

function Row({ k, v, mono }: RowProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '54px 1fr', gap: 10, alignItems: 'start' }}>
      <span
        style={{
          font: 'var(--fw-semibold) 9px/1.4 var(--font-sans)',
          letterSpacing: 'var(--ls-wide)',
          textTransform: 'uppercase',
          color: 'var(--violet-300)',
          paddingTop: 1,
        }}
      >
        {k}
      </span>
      <span
        style={{
          font: `var(--fw-medium) var(--fs-2xs)/1.45 ${mono ? 'var(--font-mono)' : 'var(--font-sans)'}`,
          color: 'var(--text-body)',
          wordBreak: 'break-word',
        }}
      >
        {v}
      </span>
    </div>
  )
}

export interface SpecPinProps {
  n: number | string
  title: string
  field?: ReactNode
  state?: ReactNode
  event?: ReactNode
  api?: ReactNode
  w?: number
  placement?: Placement
}

export function SpecPin({ n, title, field, state, event, api, w = 320, placement = 'bottom' }: SpecPinProps) {
  const on = useSpec()
  const [open, setOpen] = useState(false)
  if (!on) return null

  const pos: CSSProperties =
    placement === 'top'
      ? { bottom: 'calc(100% + 8px)' }
      : placement === 'left'
        ? { right: 'calc(100% + 8px)', top: -4 }
        : placement === 'right'
          ? { left: 'calc(100% + 8px)', top: -4 }
          : { top: 'calc(100% + 8px)' }

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle', margin: '0 2px' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          height: 18,
          padding: '0 6px',
          borderRadius: 'var(--r-pill)',
          background: open ? 'var(--violet-500)' : 'rgba(124,77,255,0.18)',
          border: '1px solid var(--violet-700)',
          cursor: 'help',
          transition: 'background var(--dur-fast)',
        }}
      >
        <Icon name="code-2" size={10} color={open ? '#fff' : 'var(--violet-300)'} />
        <span style={{ font: 'var(--fw-bold) 9px/1 var(--font-mono)', color: open ? '#fff' : 'var(--violet-300)' }}>
          {n}
        </span>
      </span>
      {open && (
        <div
          style={{
            position: 'absolute',
            ...pos,
            left: pos.left ?? 0,
            width: w,
            zIndex: 80,
            padding: 14,
            background: 'var(--surface-raised)',
            border: '1px solid var(--violet-700)',
            borderRadius: 'var(--r-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 9,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              paddingBottom: 8,
              borderBottom: '1px solid var(--hairline)',
            }}
          >
            <Icon name="puzzle" size={13} color="var(--violet-300)" />
            <span style={{ font: 'var(--fw-bold) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-strong)' }}>
              {title}
            </span>
            <span style={{ marginLeft: 'auto', font: 'var(--fw-bold) 9px/1 var(--font-mono)', color: 'var(--violet-300)' }}>
              #{n}
            </span>
          </div>
          {field && <Row k="字段" v={field} mono />}
          {state && <Row k="状态" v={state} />}
          {event && <Row k="交互" v={event} />}
          {api && <Row k="接口" v={api} mono />}
        </div>
      )}
    </span>
  )
}

export interface SpecToggleProps {
  on: boolean
  onToggle: () => void
}

export function SpecToggle({ on, onToggle }: SpecToggleProps) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        height: 40,
        padding: '0 14px',
        borderRadius: 'var(--r-md)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        border: `1px solid ${on ? 'var(--violet-500)' : 'var(--border-subtle)'}`,
        background: on ? 'rgba(124,77,255,0.16)' : 'var(--surface-card)',
        color: on ? 'var(--violet-200)' : 'var(--text-muted)',
        font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-sans)',
        transition: 'all var(--dur-fast)',
      }}
    >
      <Icon name="code-2" size={15} color={on ? 'var(--violet-300)' : 'var(--text-muted)'} />
      实现批注{on ? ' · 开' : ''}
    </button>
  )
}

export function SpecBanner({ on }: { on: boolean }) {
  if (!on) return null
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 28px',
        background: 'rgba(124,77,255,0.10)',
        borderBottom: '1px solid var(--violet-700)',
      }}
    >
      <Icon name="info" size={14} color="var(--violet-300)" />
      <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1.4 var(--font-sans)', color: 'var(--violet-200)' }}>
        实现批注已开启 —— 悬停{' '}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            padding: '1px 5px',
            borderRadius: 'var(--r-pill)',
            background: 'rgba(124,77,255,0.2)',
            font: 'var(--fw-bold) 9px/1.4 var(--font-mono)',
            color: 'var(--violet-200)',
          }}
        >
          ‹/› n
        </span>{' '}
        查看该元素的数据字段、状态与交互说明，供开发参考。
      </span>
    </div>
  )
}
