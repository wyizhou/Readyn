import { Icon } from './Icon'
import type { Profile } from '../lib/types'

export type ViewId = 'dashboard' | 'records' | 'training' | 'library' | 'weight' | 'connectors' | 'ai'

interface NavItem {
  id: ViewId
  icon: string
  label: string
  sub: string
}

// 5-item nav per the design (app/shell.jsx). 训练日历 / 训练库 are temporarily
// offline (CODING §1.3): their components are kept but removed from navigation.
const NAV: NavItem[] = [
  { id: 'dashboard', icon: 'layout-dashboard', label: '看板', sub: '分析 · 趋势 · 状态' },
  { id: 'records', icon: 'list', label: '运动记录', sub: '全部活动 · 分页' },
  { id: 'weight', icon: 'scale', label: '体重记录', sub: '手动录入 · 趋势' },
  { id: 'connectors', icon: 'cable', label: '连接器', sub: '数据源 · 统一规范' },
  { id: 'ai', icon: 'sparkles', label: 'AI 模块', sub: '运动专家对话' },
]

export interface SidebarProps {
  active: ViewId
  onNav: (id: ViewId) => void
  profile: Profile
  weight: number | string
  onOpenProfile: () => void
}

export function Sidebar({ active, onNav, profile, weight, onOpenProfile }: SidebarProps) {
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
          Readyn
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
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
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
