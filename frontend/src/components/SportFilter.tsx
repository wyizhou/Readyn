// Global sport filter (全部运动 / 单项目). Sits in the topbar on the dashboard,
// records, etc. The core layer always aggregates across all sports; picking a
// single sport filters activities and swaps in that sport's specific cards.
import { Icon } from './Icon'
import type { Sport } from '../lib/types'

export interface SportFilterProps {
  sports: Sport[]
  value: string
  onChange: (id: string) => void
  compact?: boolean
}

export function SportFilter({ sports, value, onChange, compact }: SportFilterProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {sports.map((s) => {
        const on = value === s.id
        const c = s.color || 'var(--blue-400)'
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            title={s.name}
            aria-pressed={on}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 34,
              padding: compact ? '0 10px' : '0 12px',
              borderRadius: 'var(--r-pill)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              border: `1px solid ${on ? c : 'var(--border-subtle)'}`,
              background: on ? `color-mix(in oklab, ${c} 16%, transparent)` : 'var(--surface-card)',
              color: on ? 'var(--text-strong)' : 'var(--text-muted)',
              font: `var(--fw-${on ? 'bold' : 'medium'}) var(--fs-xs)/1 var(--font-sans)`,
              transition: 'all var(--dur-fast)',
            }}
            onMouseEnter={(e) => {
              if (!on) {
                e.currentTarget.style.borderColor = 'var(--border-strong)'
                e.currentTarget.style.color = 'var(--text-body)'
              }
            }}
            onMouseLeave={(e) => {
              if (!on) {
                e.currentTarget.style.borderColor = 'var(--border-subtle)'
                e.currentTarget.style.color = 'var(--text-muted)'
              }
            }}
          >
            <Icon name={s.icon} size={14} color={on ? c : 'var(--text-faint)'} />
            {s.name}
          </button>
        )
      })}
    </div>
  )
}
