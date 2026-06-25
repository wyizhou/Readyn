// Read-only topbar connection indicator (design v9). Mirrors the design's
// ConnToggle visuals, but is NOT a manual demo switch — per CODING §1.2 the
// state is driven by the real Garmin login result, so this renders a static
// status pill (● 已连接佳明(CN) / 未连接) rather than an interactive control.
export function ConnStatus({ connected }: { connected: boolean }) {
  return (
    <span
      role="status"
      aria-label={connected ? '已连接佳明(CN)' : '未连接'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        height: 40,
        padding: '0 13px',
        borderRadius: 'var(--r-md)',
        whiteSpace: 'nowrap',
        border: `1px solid ${connected ? 'rgba(24,201,140,0.4)' : 'var(--border-subtle)'}`,
        background: connected ? 'rgba(24,201,140,0.10)' : 'var(--surface-card)',
        color: connected ? 'var(--green-400)' : 'var(--text-muted)',
        font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-sans)',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: connected ? 'var(--green-500)' : 'var(--ink-500)',
        }}
      />
      {connected ? '已连接佳明(CN)' : '未连接'}
    </span>
  )
}
