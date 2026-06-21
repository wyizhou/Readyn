import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

export interface SwitchProps extends Omit<HTMLAttributes<HTMLLabelElement>, 'onChange'> {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  label?: ReactNode
  size?: 'sm' | 'md'
}

export function Switch({ checked = false, onChange, disabled = false, label, size = 'md', style, ...rest }: SwitchProps) {
  const w = size === 'sm' ? 36 : 44
  const h = size === 'sm' ? 20 : 24
  const knob = h - 6

  const toggle = () => {
    if (!disabled && onChange) onChange(!checked)
  }

  const wrap: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    ...style,
  }

  return (
    <label style={wrap} {...rest}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={toggle}
        style={{
          position: 'relative',
          width: w,
          height: h,
          flex: 'none',
          borderRadius: 'var(--r-pill)',
          border: 'none',
          cursor: 'inherit',
          background: checked ? 'var(--accent)' : 'var(--ink-700)',
          transition: 'background var(--dur-base) var(--ease-out)',
          padding: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: 3,
            width: knob,
            height: knob,
            borderRadius: '50%',
            background: 'var(--white)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
            transform: checked ? `translateX(${w - knob - 6}px)` : 'translateX(0)',
            transition: 'transform var(--dur-base) var(--ease-out)',
          }}
        />
      </button>
      {label && (
        <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-body)' }}>
          {label as ReactNode}
        </span>
      )}
    </label>
  )
}
