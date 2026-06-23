// Standard empty-state template — icon + one line + connect CTA. Shown by each
// module until a data source (real Garmin login) is connected. Connection state
// is driven by the real login result, not a demo toggle.
import { Icon } from './Icon'

export interface EmptyStateProps {
  icon?: string
  title: string
  desc?: string
  actionLabel?: string
  onAction?: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  compact?: boolean
  inline?: boolean
}

export function EmptyState({
  icon = 'plug-zap',
  title,
  desc,
  actionLabel = '连接佳明',
  onAction,
  secondaryLabel,
  onSecondary,
  compact,
  inline,
}: EmptyStateProps) {
  const pad = compact ? '32px 24px' : '64px 32px'
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: pad,
        textAlign: 'center',
        background: inline ? 'transparent' : 'var(--surface-card)',
        border: inline ? 'none' : '1px dashed var(--border-strong)',
        borderRadius: 'var(--r-lg)',
      }}
    >
      <span
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'var(--surface-inset)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
        }}
      >
        <Icon name={icon} size={26} color="var(--text-faint)" />
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxWidth: 380 }}>
        <span style={{ font: 'var(--fw-bold) var(--fs-md)/1.3 var(--font-display)', color: 'var(--text-strong)' }}>{title}</span>
        {desc && (
          <span style={{ font: 'var(--fw-regular) var(--fs-sm)/1.55 var(--font-sans)', color: 'var(--text-faint)', textWrap: 'pretty' }}>
            {desc}
          </span>
        )}
      </div>
      {(onAction || onSecondary) && (
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          {onAction && (
            <button
              onClick={onAction}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                height: 40,
                padding: '0 18px',
                borderRadius: 'var(--r-md)',
                border: 'none',
                cursor: 'pointer',
                background: 'var(--grad-brand)',
                color: '#fff',
                font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <Icon name="link" size={15} color="#fff" />
              {actionLabel}
            </button>
          )}
          {onSecondary && (
            <button
              onClick={onSecondary}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                height: 40,
                padding: '0 16px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                background: 'var(--surface-card)',
                color: 'var(--text-muted)',
                font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-sans)',
              }}
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
