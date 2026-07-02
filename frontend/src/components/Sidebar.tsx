import { Icon } from './Icon'
import type { Profile } from '../lib/types'

export type ViewId = 'dashboard' | 'records' | 'health' | 'training' | 'library' | 'connectors' | 'ai'
export type HealthSection = 'sleep' | 'weight'

interface NavItem {
  id: ViewId
  icon: string
  label: string
  sub: string
}

// Open Design v0.1.0: 5 top-level items; health is the only item with a submenu.
const NAV: NavItem[] = [
  { id: 'dashboard', icon: 'layout-dashboard', label: '01 总览', sub: '负荷总览' },
  { id: 'records', icon: 'list', label: '02 活动', sub: '活动记录' },
  { id: 'health', icon: 'heart-pulse', label: '03 健康', sub: '睡眠 · 体重' },
  { id: 'connectors', icon: 'cable', label: '04 连接', sub: 'Garmin 数据源' },
  { id: 'ai', icon: 'sparkles', label: '05 教练', sub: 'AI 教练' },
]

export interface SidebarProps {
  active: ViewId
  onNav: (id: ViewId) => void
  activeHealth: HealthSection
  onHealthNav: (section: HealthSection) => void
  profile: Profile
  weight: number | string
  onOpenProfile: () => void
}

const healthItems: { id: HealthSection; label: string }[] = [
  { id: 'sleep', label: '睡眠' },
  { id: 'weight', label: '体重' },
]

export function Sidebar({ active, onNav, activeHealth, onHealthNav, profile, weight, onOpenProfile }: SidebarProps) {
  return (
    <aside
      style={{
        width: 'var(--sidebar-w)',
        flex: 'none',
        background: 'var(--surface-base)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 22px' }}>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'var(--grad-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <Icon name="hexagon" size={17} color="#fff" />
        </span>
        <span
          style={{
            font: 'var(--fw-black) 19px/1 var(--font-display)',
            letterSpacing: '0.04em',
            color: 'var(--text-strong)',
          }}
        >
          Trainalyze
        </span>
        <span
          style={{
            marginLeft: 'auto',
            font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
            letterSpacing: 'var(--ls-label)',
            textTransform: 'uppercase',
            color: 'var(--violet-300)',
          }}
        >
          个人版
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map((n) => {
          const on = active === n.id
          return (
            <div key={n.id}>
              <button
                onClick={() => onNav(n.id)}
                aria-expanded={n.id === 'health' ? on : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  minHeight: 48,
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: 'var(--r-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: on ? 'var(--surface-raised)' : 'transparent',
                  color: on ? 'var(--text-strong)' : 'var(--text-muted)',
                  position: 'relative',
                  transition: 'background var(--dur-fast), color var(--dur-fast)',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  if (!on) {
                    e.currentTarget.style.background = 'var(--surface-hover)'
                    e.currentTarget.style.color = 'var(--text-body)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!on) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-muted)'
                  }
                }}
              >
                {on && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 11,
                      bottom: 11,
                      width: 3,
                      borderRadius: 2,
                      background: 'var(--accent)',
                    }}
                  />
                )}
                <Icon name={n.icon} size={18} />
                <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                  <span style={{ font: `var(--fw-${on ? 'bold' : 'semibold'}) var(--fs-sm)/1 var(--font-sans)`, whiteSpace: 'nowrap' }}>
                    {n.label}
                  </span>
                  <span style={{ font: 'var(--fw-medium) 10px/1.3 var(--font-sans)', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                    {n.sub}
                  </span>
                </span>
              </button>
              {n.id === 'health' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 0 4px 41px' }}>
                  {healthItems.map((item) => {
                    const subOn = active === 'health' && activeHealth === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => onHealthNav(item.id)}
                        style={{
                          height: 30,
                          border: 'none',
                          borderRadius: 'var(--r-sm)',
                          background: subOn ? 'var(--surface-hover)' : 'transparent',
                          color: subOn ? 'var(--text-strong)' : 'var(--text-faint)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          padding: '0 10px',
                          font: `var(--fw-${subOn ? 'bold' : 'medium'}) var(--fs-xs)/1 var(--font-sans)`,
                        }}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <button
        onClick={onOpenProfile}
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          padding: '16px 8px 0',
          borderTop: '1px solid var(--hairline)',
          marginBottom: -6,
          background: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
          borderRadius: 0,
          transition: 'opacity var(--dur-fast)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.78')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--grad-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-display)',
            color: '#fff',
            flex: 'none',
          }}
        >
          {profile.name.replace(/\s/g, '').slice(0, 1)}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
          <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>
            {profile.name}
          </span>
          <span
            style={{
              font: 'var(--fw-medium) 10px/1 var(--font-mono)',
              color: 'var(--text-faint)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {profile.height}cm · {weight}kg
          </span>
        </div>
        <Icon name="settings" size={16} color="var(--text-faint)" style={{ marginLeft: 'auto' }} />
      </button>
    </aside>
  )
}
