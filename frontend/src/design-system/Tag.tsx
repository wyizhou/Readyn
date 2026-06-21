import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void
  icon?: ReactNode
  children?: ReactNode
}

export function Tag({ children, onRemove, icon, style, ...rest }: TagProps) {
  const css: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 26,
    padding: onRemove ? '0 6px 0 10px' : '0 10px',
    borderRadius: 'var(--r-sm)',
    background: 'var(--surface-raised)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-body)',
    font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)',
    whiteSpace: 'nowrap',
    ...style,
  }
  return (
    <span style={css} {...rest}>
      {icon}
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 16,
            height: 16,
            borderRadius: 'var(--r-xs)',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 13,
            lineHeight: 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--surface-hover)'
            e.currentTarget.style.color = 'var(--text-strong)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          ×
        </button>
      )}
    </span>
  )
}
