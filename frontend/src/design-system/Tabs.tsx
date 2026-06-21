import { useState } from 'react'
import type { CSSProperties, HTMLAttributes } from 'react'

export interface TabItem {
  value: string
  label: string
  count?: number
}

export type TabDef = string | TabItem

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs?: TabDef[]
  value?: string
  onChange?: (value: string) => void
  variant?: 'underline' | 'pill'
}

function tabValue(t: TabDef): string {
  return typeof t === 'string' ? t : t.value
}

export function Tabs({ tabs = [], value, onChange, variant = 'underline', style, ...rest }: TabsProps) {
  const [internal, setInternal] = useState<string | undefined>(tabs[0] ? tabValue(tabs[0]) : undefined)
  const active = value !== undefined ? value : internal
  const set = (v: string) => {
    if (value === undefined) setInternal(v)
    onChange?.(v)
  }

  const isPill = variant === 'pill'
  const wrap: CSSProperties = {
    display: 'inline-flex',
    gap: isPill ? 4 : 2,
    padding: isPill ? 4 : 0,
    background: isPill ? 'var(--surface-inset)' : 'transparent',
    borderRadius: isPill ? 'var(--r-md)' : 0,
    borderBottom: isPill ? 'none' : '1px solid var(--border-subtle)',
    ...style,
  }

  return (
    <div role="tablist" style={wrap} {...rest}>
      {tabs.map((t) => {
        const val = tabValue(t)
        const lbl = typeof t === 'string' ? t : t.label
        const count = typeof t === 'object' ? t.count : undefined
        const isActive = val === active
        return (
          <button
            key={val}
            role="tab"
            aria-selected={isActive}
            onClick={() => set(val)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              height: isPill ? 32 : 38,
              padding: isPill ? '0 14px' : '0 4px',
              margin: isPill ? 0 : '0 12px -1px 0',
              border: 'none',
              cursor: 'pointer',
              background: isActive && isPill ? 'var(--surface-raised)' : 'transparent',
              borderRadius: isPill ? 'var(--r-sm)' : 0,
              borderBottom: isPill ? 'none' : `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
              color: isActive ? 'var(--text-strong)' : 'var(--text-muted)',
              font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-sans)',
              transition: 'color var(--dur-fast), border-color var(--dur-fast), background var(--dur-fast)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = 'var(--text-body)'
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            {lbl}
            {count != null && (
              <span
                style={{
                  font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-mono)',
                  color: isActive ? 'var(--accent)' : 'var(--text-faint)',
                  background: isActive ? 'rgba(59,91,255,0.14)' : 'var(--surface-raised)',
                  padding: '2px 6px',
                  borderRadius: 'var(--r-pill)',
                }}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
