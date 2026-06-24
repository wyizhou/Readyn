// Pick 2–4 activities to compare. Opened from the Records toolbar or an activity
// detail (which preselects itself). Confirm routes to the ActivityCompare page.
import { useState } from 'react'
import { Button, IconButton } from '../design-system'
import { Icon } from './Icon'
import type { Activity } from '../lib/types'

const sportColor = (s: string): string =>
  ({
    跑步: 'var(--blue-500)',
    骑行: 'var(--cyan-500)',
    游泳: 'var(--violet-400)',
    力量: 'var(--amber-500)',
    攀岩: 'var(--green-500)',
    徒步: 'var(--violet-500)',
    登山: 'var(--violet-500)',
  })[s] || 'var(--ink-500)'

export interface CompareModalProps {
  activities: Activity[]
  preselect?: string[]
  onClose: () => void
  onConfirm: (ids: string[]) => void
}

export function CompareModal({ activities, preselect = [], onClose, onConfirm }: CompareModalProps) {
  const [sel, setSel] = useState<string[]>(preselect.slice(0, 4))
  const toggle = (id: string) =>
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 4 ? [...s, id] : s))
  const valid = sel.length >= 2 && sel.length <= 4
  const rows = activities.slice(0, 40)

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(7,8,11,0.78)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxHeight: '86vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-lg), var(--inner-top)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 24px', borderBottom: '1px solid var(--hairline)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ font: 'var(--fw-bold) var(--fs-lg)/1.2 var(--font-display)', color: 'var(--text-strong)' }}>对比活动</div>
            <div style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-faint)', marginTop: 4 }}>
              选择 2–4 项活动 · 已选 {sel.length}/4
            </div>
          </div>
          <IconButton label="关闭" variant="ghost" onClick={onClose}>
            <Icon name="x" size={18} />
          </IconButton>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
          {rows.length ? (
            rows.map((a) => {
              const on = sel.includes(a.id)
              const full = !on && sel.length >= 4
              return (
                <button
                  key={a.id}
                  onClick={() => toggle(a.id)}
                  disabled={full}
                  aria-pressed={on}
                  style={{ width: '100%', display: 'grid', gridTemplateColumns: '22px 32px 2fr 1fr 0.9fr 0.9fr', gap: 12, alignItems: 'center', padding: '11px 20px', border: 'none', background: on ? 'var(--surface-raised)' : 'transparent', cursor: full ? 'not-allowed' : 'pointer', textAlign: 'left', opacity: full ? 0.45 : 1 }}
                >
                  <span style={{ width: 18, height: 18, borderRadius: 5, border: `1px solid ${on ? 'var(--accent)' : 'var(--border-strong)'}`, background: on ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {on && <Icon name="check" size={12} color="#fff" />}
                  </span>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: `${sportColor(a.sport)}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={a.icon} size={15} color={sportColor(a.sport)} />
                  </span>
                  <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1.2 var(--font-sans)', color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                  <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-muted)' }}>{a.date}</span>
                  <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-muted)' }}>{a.dist}</span>
                  <span style={{ font: 'var(--fw-bold) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{a.load} AU</span>
                </button>
              )
            })
          ) : (
            <div style={{ padding: '40px 24px', textAlign: 'center', font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-faint)' }}>暂无可对比的活动</div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 24px', borderTop: '1px solid var(--hairline)' }}>
          <span style={{ flex: 1, font: 'var(--fw-regular) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>跨项目对比时配速会自动隐藏，仅叠加心率。</span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            取消
          </Button>
          <Button variant="primary" size="sm" iconLeft={<Icon name="git-compare" size={14} />} disabled={!valid} onClick={() => onConfirm(sel)}>
            开始对比
          </Button>
        </div>
      </div>
    </div>
  )
}
