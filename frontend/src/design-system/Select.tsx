import type { CSSProperties, SelectHTMLAttributes, ReactNode } from 'react'

export interface SelectOption {
  value: string
  label: string
}

export type SelectOptionDef = string | SelectOption

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: ReactNode
  options?: SelectOptionDef[]
  size?: 'sm' | 'md' | 'lg'
  style?: CSSProperties
}

export function Select({ label, options = [], value, onChange, size = 'md', style, id, ...rest }: SelectProps) {
  const height = size === 'lg' ? 48 : size === 'sm' ? 34 : 42
  const selectId =
    id || (typeof label === 'string' ? `apex-sel-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)

  return (
    <label htmlFor={selectId} style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', ...style }}>
      {label && (
        <span
          style={{
            font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-sans)',
            color: 'var(--text-muted)',
            letterSpacing: 'var(--ls-wide)',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
      )}
      <span style={{ position: 'relative', display: 'flex' }}>
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            width: '100%',
            height,
            padding: '0 36px 0 12px',
            background: 'var(--surface-inset)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--r-md)',
            color: 'var(--text-strong)',
            font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)',
            cursor: 'pointer',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--focus-ring)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-strong)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          {...rest}
        >
          {options.map((o) => {
            const val = typeof o === 'string' ? o : o.value
            const lbl = typeof o === 'string' ? o : o.label
            return (
              <option key={val} value={val} style={{ background: 'var(--ink-850)', color: 'var(--text-strong)' }}>
                {lbl}
              </option>
            )
          })}
        </select>
        <span
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-faint)',
            pointerEvents: 'none',
            fontSize: 12,
          }}
        >
          ▾
        </span>
      </span>
    </label>
  )
}
