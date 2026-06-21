import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  iconLeft?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

const SIZES: Record<ButtonSize, { padding: string; height: number; font: string }> = {
  sm: { padding: '0 12px', height: 32, font: 'var(--fs-sm)' },
  md: { padding: '0 16px', height: 40, font: 'var(--fs-sm)' },
  lg: { padding: '0 22px', height: 48, font: 'var(--fs-body)' },
}

const VARIANTS: Record<ButtonVariant, CSSProperties> = {
  primary: { background: 'var(--accent)', color: 'var(--text-on-accent)', boxShadow: 'var(--inner-top)' },
  secondary: { background: 'var(--surface-raised)', color: 'var(--text-strong)', borderColor: 'var(--border-strong)' },
  ghost: { background: 'transparent', color: 'var(--text-body)' },
  danger: { background: 'var(--critical)', color: 'var(--white)' },
  gradient: { background: 'var(--grad-brand)', color: 'var(--white)', boxShadow: 'var(--inner-top)' },
}

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  children,
  style,
  ...rest
}: ButtonProps) {
  const s = SIZES[size] || SIZES.md

  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: s.height,
    padding: s.padding,
    width: fullWidth ? '100%' : undefined,
    font: `var(--fw-semibold) ${s.font}/1 var(--font-sans)`,
    letterSpacing: '0.01em',
    borderRadius: 'var(--r-md)',
    // Non-shorthand so a variant can override borderColor alone without React
    // warning about mixing `border` shorthand with `borderColor`.
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition:
      'background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out), border-color var(--dur-fast)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  }

  return (
    <button
      type="button"
      disabled={disabled}
      style={{ ...base, ...(VARIANTS[variant] || VARIANTS.primary), ...style }}
      onMouseEnter={(e) => {
        if (disabled) return
        if (variant === 'primary') e.currentTarget.style.background = 'var(--accent-hover)'
        else if (variant === 'secondary') e.currentTarget.style.background = 'var(--surface-hover)'
        else if (variant === 'ghost') e.currentTarget.style.background = 'var(--surface-hover)'
        else e.currentTarget.style.filter = 'brightness(1.08)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = String((VARIANTS[variant] || VARIANTS.primary).background)
        e.currentTarget.style.filter = 'none'
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  )
}
