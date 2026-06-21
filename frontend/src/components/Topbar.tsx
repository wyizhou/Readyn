import type { ReactNode } from 'react'
import { Icon } from './Icon'

export interface TopbarProps {
  title: ReactNode
  subtitle?: ReactNode
  right?: ReactNode
  onBack?: () => void
}

export function Topbar({ title, subtitle, right, onBack }: TopbarProps) {
  return (
    <header
      style={{
        height: 'var(--topbar-h)',
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 28px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(11,14,19,0.72)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 5,
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            height: 36,
            padding: '0 12px 0 8px',
            marginLeft: -4,
            borderRadius: 'var(--r-md)',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'var(--border-subtle)',
            background: 'var(--surface-card)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-sans)',
            transition: 'all var(--dur-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-strong)'
            e.currentTarget.style.borderColor = 'var(--border-strong)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)'
            e.currentTarget.style.borderColor = 'var(--border-subtle)'
          }}
        >
          <Icon name="arrow-left" size={16} />
          返回
        </button>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
        <h1
          style={{
            margin: 0,
            font: 'var(--fw-bold) var(--fs-h3)/1.1 var(--font-display)',
            letterSpacing: 'var(--ls-tight)',
            color: 'var(--text-strong)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 520,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <span
            style={{
              font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)',
              color: 'var(--text-faint)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 520,
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>{right}</div>
    </header>
  )
}
