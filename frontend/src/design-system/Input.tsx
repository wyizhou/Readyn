import { useState } from 'react'
import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  iconLeft?: ReactNode
  suffix?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  /** Wrapper style (applied to the outer <label>). */
  style?: CSSProperties
}

export function Input({ label, hint, error, iconLeft, suffix, size = 'md', style, id, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false)
  const height = size === 'lg' ? 48 : size === 'sm' ? 34 : 42
  const inputId =
    id || (typeof label === 'string' ? `apex-in-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)

  return (
    <label htmlFor={inputId} style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', ...style }}>
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
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          height,
          padding: '0 12px',
          background: 'var(--surface-inset)',
          border: `1px solid ${error ? 'var(--critical)' : focused ? 'var(--accent)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--r-md)',
          boxShadow: focused ? '0 0 0 3px var(--focus-ring)' : 'none',
          transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)',
        }}
      >
        {iconLeft && <span style={{ color: 'var(--text-faint)', display: 'inline-flex' }}>{iconLeft}</span>}
        <input
          id={inputId}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--text-strong)',
            font: 'var(--fw-regular) var(--fs-sm)/1 var(--font-sans)',
          }}
          {...rest}
        />
        {suffix && (
          <span style={{ color: 'var(--text-faint)', font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)' }}>
            {suffix}
          </span>
        )}
      </span>
      {(hint || error) && (
        <span
          style={{
            font: 'var(--fw-regular) var(--fs-xs)/1.4 var(--font-sans)',
            color: error ? 'var(--red-400)' : 'var(--text-faint)',
          }}
        >
          {error || hint}
        </span>
      )}
    </label>
  )
}
