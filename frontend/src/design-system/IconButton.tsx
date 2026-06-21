import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

export type IconButtonSize = 'sm' | 'md' | 'lg'
export type IconButtonVariant = 'ghost' | 'solid' | 'outline'

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  size?: IconButtonSize
  variant?: IconButtonVariant
  active?: boolean
  label?: string
  children?: ReactNode
}

const SIZES: Record<IconButtonSize, number> = { sm: 32, md: 40, lg: 48 }

export function IconButton({
  size = 'md',
  variant = 'ghost',
  active = false,
  disabled = false,
  label,
  children,
  style,
  ...rest
}: IconButtonProps) {
  const dim = SIZES[size] || SIZES.md

  const variants: Record<IconButtonVariant, CSSProperties> = {
    ghost: {
      background: active ? 'var(--surface-raised)' : 'transparent',
      color: active ? 'var(--text-strong)' : 'var(--text-muted)',
      border: '1px solid transparent',
    },
    solid: { background: 'var(--accent)', color: 'var(--white)', border: '1px solid transparent' },
    outline: { background: 'var(--surface-card)', color: 'var(--text-body)', border: '1px solid var(--border-strong)' },
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        borderRadius: 'var(--r-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast)',
        ...(variants[variant] || variants.ghost),
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && variant === 'ghost') {
          e.currentTarget.style.background = 'var(--surface-hover)'
          e.currentTarget.style.color = 'var(--text-strong)'
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'ghost') {
          e.currentTarget.style.background = active ? 'var(--surface-raised)' : 'transparent'
          e.currentTarget.style.color = active ? 'var(--text-strong)' : 'var(--text-muted)'
        }
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
