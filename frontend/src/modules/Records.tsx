// 运动记录 Records — the full activity list, newest-first, paginated. Pulls from
// data.records (falls back to data.activities). Each row shows load + loadSrc and
// opens the activity detail. Empty state until a data source is connected.
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Card, Button } from '../design-system'
import { Icon } from '../components/Icon'
import { EmptyState } from '../components/EmptyState'
import { emptyCopy } from '../lib/taxonomy'
import { pageNums } from '../lib/paginate'
import type { Activity, ApexData } from '../lib/types'

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

const PAGE_SIZES = [10, 20, 50]
const COLS = '36px 2fr 0.9fr 1fr 0.9fr 0.8fr 1fr 22px'

function PageBtn({ disabled, onClick, children, label }: { disabled?: boolean; onClick: () => void; children: ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        width: 34,
        height: 34,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--r-md)',
        border: '1px solid var(--border-subtle)',
        background: 'var(--surface-card)',
        color: disabled ? 'var(--text-faint)' : 'var(--text-muted)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  )
}

export interface RecordsProps {
  data: ApexData
  connected: boolean
  onConnect: () => void
  onOpenActivity: (a: Activity) => void
  onCompare?: () => void
}

export function Records({ data, connected, onConnect, onOpenActivity, onCompare }: RecordsProps) {
  const [size, setSize] = useState(10)
  const [page, setPage] = useState(1)
  const all = data.records ?? data.activities

  if (!connected) {
    const e = emptyCopy.records
    return (
      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
        <EmptyState icon={e.icon} title={e.title} desc={e.desc} onAction={onConnect} />
      </div>
    )
  }

  const total = all.length
  const pages = Math.max(1, Math.ceil(total / size))
  const cur = Math.min(page, pages)
  const start = (cur - 1) * size
  const rows = all.slice(start, start + size)
  const setPageSize = (n: number) => {
    setSize(n)
    setPage(1)
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
      {/* toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-muted)' }}>
          共 <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>{total}</b> 条记录
        </span>
        {onCompare && total >= 2 && (
          <Button variant="secondary" size="sm" iconLeft={<Icon name="git-compare" size={14} />} onClick={onCompare}>
            对比
          </Button>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>每页</span>
          <div style={{ display: 'inline-flex', gap: 3, padding: 3, background: 'var(--surface-inset)', borderRadius: 'var(--r-md)' }}>
            {PAGE_SIZES.map((n) => {
              const on = size === n
              return (
                <button
                  key={n}
                  onClick={() => setPageSize(n)}
                  aria-pressed={on}
                  style={{ padding: '6px 12px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', background: on ? 'var(--surface-raised)' : 'transparent', color: on ? 'var(--text-strong)' : 'var(--text-muted)', font: `var(--fw-${on ? 'bold' : 'medium'}) var(--fs-xs)/1 var(--font-mono)`, boxShadow: on ? 'var(--shadow-sm)' : 'none' }}
                >
                  {n}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* table */}
      {total ? (
        <Card padding="none">
          <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: 14, alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--hairline)' }}>
            {['', '活动', '项目', '日期', '距离', '时长', '负荷', ''].map((h, i) => (
              <span key={i} style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
                {h}
              </span>
            ))}
          </div>
          {rows.map((s, i) => (
            <div
              key={s.id}
              onClick={() => onOpenActivity(s)}
              style={{ display: 'grid', gridTemplateColumns: COLS, gap: 14, alignItems: 'center', padding: '13px 20px', cursor: 'pointer', borderTop: i ? '1px solid var(--hairline)' : 'none', transition: 'background var(--dur-fast)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ width: 32, height: 32, borderRadius: 8, background: `${sportColor(s.sport)}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={s.icon} size={16} color={sportColor(s.sport)} />
              </span>
              <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1.2 var(--font-sans)', color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-muted)' }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, background: sportColor(s.sport) }} />
                {s.sport}
              </span>
              <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-muted)' }}>{s.date}</span>
              <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-body)' }}>{s.dist}</span>
              <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-body)' }}>{s.dur}</span>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{s.load}</span>
                <span style={{ font: 'var(--fw-medium) 9px/1 var(--font-sans)', color: 'var(--text-faint)' }}>AU{s.loadSrc ? ` · ${s.loadSrc}` : ''}</span>
              </span>
              <Icon name="chevron-right" size={16} color="var(--text-faint)" />
            </div>
          ))}
        </Card>
      ) : (
        <EmptyState compact inline icon={emptyCopy.records.icon} title="暂无运动记录" desc="完成首次同步后，你的全部活动会按时间倒序列在这里。" />
      )}

      {/* pagination */}
      {total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, justifyContent: 'flex-end' }}>
          <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-faint)', marginRight: 'auto' }}>
            第 {start + 1}–{Math.min(start + size, total)} 条 · 共 {pages} 页
          </span>
          <PageBtn label="首页" disabled={cur === 1} onClick={() => setPage(1)}>
            <Icon name="chevrons-left" size={15} />
          </PageBtn>
          <PageBtn label="上一页" disabled={cur === 1} onClick={() => setPage(cur - 1)}>
            <Icon name="chevron-left" size={15} />
          </PageBtn>
          {pageNums(cur, pages).map((p, i) =>
            p === '…' ? (
              <span key={'g' + i} style={{ width: 20, textAlign: 'center', font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-faint)' }}>
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                aria-current={p === cur}
                style={{ minWidth: 34, height: 34, padding: '0 8px', borderRadius: 'var(--r-md)', cursor: 'pointer', border: `1px solid ${p === cur ? 'var(--accent)' : 'var(--border-subtle)'}`, background: p === cur ? 'rgba(59,91,255,0.12)' : 'var(--surface-card)', color: p === cur ? 'var(--text-strong)' : 'var(--text-muted)', font: `var(--fw-${p === cur ? 'bold' : 'medium'}) var(--fs-xs)/1 var(--font-mono)` }}
              >
                {p}
              </button>
            ),
          )}
          <PageBtn label="下一页" disabled={cur === pages} onClick={() => setPage(cur + 1)}>
            <Icon name="chevron-right" size={15} />
          </PageBtn>
          <PageBtn label="末页" disabled={cur === pages} onClick={() => setPage(pages)}>
            <Icon name="chevrons-right" size={15} />
          </PageBtn>
        </div>
      )}
    </div>
  )
}
