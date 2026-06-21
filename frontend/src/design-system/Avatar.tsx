import type { CSSProperties, HTMLAttributes } from 'react'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarStatus = 'online' | 'resting' | 'offline'

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name?: string
  src?: string
  size?: AvatarSize
  status?: AvatarStatus
  ring?: boolean
}

const SIZES: Record<AvatarSize, number> = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 }

function initials(name = ''): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?'
}

export function Avatar({ name = '', src, size = 'md', status, ring = false, style, ...rest }: AvatarProps) {
  const dim = SIZES[size] || SIZES.md
  const fontSize = Math.round(dim * 0.36)
  const statusColor = status
    ? { online: 'var(--green-500)', resting: 'var(--amber-500)', offline: 'var(--ink-500)' }[status]
    : undefined

  const wrap: CSSProperties = { position: 'relative', display: 'inline-flex', flex: 'none', ...style }

  return (
    <span style={wrap} {...rest}>
      <span
        style={{
          width: dim,
          height: dim,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: src ? 'var(--surface-raised)' : 'var(--grad-brand)',
          color: 'var(--white)',
          font: `var(--fw-bold) ${fontSize}px/1 var(--font-sans)`,
          letterSpacing: '0.02em',
          boxShadow: ring ? '0 0 0 2px var(--bg-app), 0 0 0 4px var(--accent)' : 'var(--inner-top)',
        }}
      >
        {src ? (
          <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          initials(name)
        )}
      </span>
      {status && (
        <span
          style={{
            position: 'absolute',
            right: -1,
            bottom: -1,
            width: Math.max(8, dim * 0.26),
            height: Math.max(8, dim * 0.26),
            borderRadius: '50%',
            background: statusColor,
            border: '2px solid var(--bg-app)',
          }}
        />
      )}
    </span>
  )
}
