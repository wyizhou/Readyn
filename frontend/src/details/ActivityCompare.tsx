// 运动记录对比 — compare 2–4 activities (design v9 D):
//  1) a legend/selected bar with a 「调整」button to re-open the picker,
//  2) a metric table (best-per-row medal); when every pick is a run it also
//     carries a 平均配速 row (lowest is best),
//  3) a progress-aligned 配速 overlay (runs only) + a 心率 overlay.
// Across mixed sports pace is hidden — only HR overlays (design v9 D).
import { Card, Button } from '../design-system'
import { Icon } from '../components/Icon'
import { ChartXAxis } from '../components/charts/Charts'
import type { Activity, ApexData } from '../lib/types'

const PALETTE = ['var(--blue-500)', 'var(--amber-500)', 'var(--green-500)', 'var(--violet-500)']

const durToSec = (str?: string): number => {
  if (!str) return 0
  const p = String(str).split(':').map(Number)
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + (p[1] || 0)
}
const distKm = (s?: string): number => parseFloat(s ?? '') || 0
const paceFmt = (sec: number): string => {
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
const paceSecPerKm = (a: Activity): number => {
  const km = distKm(a.dist)
  return km ? durToSec(a.dur) / km : Infinity
}
const rng = (seed: number): (() => number) => {
  let x = seed || 1
  return () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff
    return x / 0x7fffffff
  }
}
// Synthesise progress-aligned (0–100%) pace + HR series for one activity.
function seriesFor(a: Activity, n = 40): { pace: number[]; hr: number[] } {
  const km = distKm(a.dist) || 10
  const basePace = durToSec(a.dur) / km || 300
  const r = rng(a.id.length * 97 + Math.round((a.load || 50) * 7))
  const pace: number[] = []
  const hr: number[] = []
  for (let i = 0; i < n; i++) {
    const work = Math.sin(i / 2.4 + (a.load || 0) / 40) > -0.1
    pace.push(basePace * ((work ? 0.9 : 1.18) + (r() - 0.5) * 0.05))
    hr.push(Math.round((a.hr || 140) * (work ? 1.04 : 0.82) + (r() - 0.5) * 5))
  }
  return { pace, hr }
}

interface Row {
  label: string
  text: (a: Activity) => string
  num?: (a: Activity) => number
  dir?: 'max' | 'min'
}

// Progress-aligned overlay of one numeric series per activity. `invert` flips the
// y-axis so that for pace (lower = faster) the better line sits higher.
function OverlayChart({ series, invert, width = 960, height = 220 }: { series: number[][]; invert?: boolean; width?: number; height?: number }) {
  const all = series.flat()
  const min = Math.min(...all) * 0.95
  const max = Math.max(...all) * 1.05
  const range = max - min || 1
  const pad = { t: 16, r: 14, b: 22, l: 14 }
  const w = width - pad.l - pad.r
  const h = height - pad.t - pad.b
  const x = (i: number, n: number) => pad.l + (i / (n - 1)) * w
  const y = (v: number) => {
    const t = (v - min) / range
    return pad.t + h - (invert ? 1 - t : t) * h
  }
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {[0.25, 0.5, 0.75].map((g, i) => (
        <line key={i} x1={pad.l} x2={width - pad.r} y1={pad.t + h - g * h} y2={pad.t + h - g * h} stroke="var(--hairline)" />
      ))}
      {series.map((s, si) => {
        const d = s.map((v, i) => `${i ? 'L' : 'M'}${x(i, s.length).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
        return <path key={si} d={d} fill="none" stroke={PALETTE[si % PALETTE.length]} strokeWidth="2" strokeLinejoin="round" opacity={0.9} />
      })}
      <ChartXAxis labels={['0%', '50%', '100%']} width={width} y={height - 5} padL={pad.l} padR={pad.r} />
    </svg>
  )
}

function OverlayLegend({ acts }: { acts: Activity[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--hairline)' }}>
      {acts.map((a, i) => (
        <span key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-muted)' }}>
          <span style={{ width: 12, height: 2, background: PALETTE[i % PALETTE.length] }} />
          {a.name}
        </span>
      ))}
    </div>
  )
}

export interface ActivityCompareProps {
  data: ApexData
  ids: string[]
  onOpenActivity: (a: Activity) => void
  // Re-open the picker to add/swap records being compared.
  onEdit?: () => void
}

export function ActivityCompare({ data, ids, onOpenActivity, onEdit }: ActivityCompareProps) {
  const all = data.records ?? data.activities
  const acts = ids.map((id) => all.find((a) => a.id === id)).filter((a): a is Activity => Boolean(a))

  if (acts.length < 2) {
    return (
      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
        <div style={{ padding: '48px 24px', textAlign: 'center', font: 'var(--fw-medium) var(--fs-sm)/1.6 var(--font-sans)', color: 'var(--text-faint)' }}>
          需要至少 2 项有效活动才能对比。
        </div>
      </div>
    )
  }

  // Pace comparison only makes sense when every pick is the same (running) sport.
  const allRun = acts.every((a) => a.sport === acts[0].sport) && acts[0].sport === '跑步'

  const rows: Row[] = [
    { label: '项目', text: (a) => a.sport },
    { label: '日期', text: (a) => a.date },
    { label: '距离', text: (a) => a.dist, num: (a) => distKm(a.dist), dir: 'max' },
    { label: '移动时间', text: (a) => a.dur, num: (a) => durToSec(a.dur) },
    ...(allRun
      ? [{ label: '平均配速', text: (a: Activity) => (distKm(a.dist) ? `${paceFmt(paceSecPerKm(a))} /km` : '—'), num: (a: Activity) => paceSecPerKm(a), dir: 'min' as const }]
      : []),
    { label: '平均心率', text: (a) => `${a.hr} bpm`, num: (a) => a.hr, dir: 'min' },
    { label: '负荷', text: (a) => `${a.load} AU${a.loadSrc ? ` · ${a.loadSrc}` : ''}`, num: (a) => a.load, dir: 'max' },
  ]

  // best index per comparable row (medal)
  const bestOf = (row: Row): number => {
    if (!row.num || !row.dir) return -1
    const nums = acts.map(row.num)
    let bi = 0
    for (let i = 1; i < nums.length; i++) {
      if (row.dir === 'max' ? nums[i] > nums[bi] : nums[i] < nums[bi]) bi = i
    }
    return bi
  }

  const curves = acts.map((a) => seriesFor(a))
  const col = `160px repeat(${acts.length}, minmax(0, 1fr))`

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
      {/* legend / selected bar with a 「调整」action to re-open the picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 18, marginBottom: 18, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--inner-top)' }}>
        <Icon name="git-compare" size={18} color="var(--blue-400)" />
        <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>对比 {acts.length} 条记录</span>
        <div style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          {acts.map((a, i) => (
            <span key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 7, font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-muted)' }}>
              <span style={{ width: 12, height: 3, borderRadius: 2, background: PALETTE[i % PALETTE.length] }} />
              {a.name}
            </span>
          ))}
        </div>
        {onEdit && (
          <Button variant="secondary" size="sm" iconLeft={<Icon name="list-plus" size={14} />} onClick={onEdit}>
            调整
          </Button>
        )}
      </div>

      {/* metric comparison table */}
      <Card title="指标对比" style={{ marginBottom: 16 }} padding="none">
        {/* header row: activity names */}
        <div style={{ display: 'grid', gridTemplateColumns: col, gap: 14, alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--hairline)' }}>
          <span />
          {acts.map((a, i) => (
            <button
              key={a.id}
              onClick={() => onOpenActivity(a)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ width: 10, height: 10, borderRadius: 3, background: PALETTE[i % PALETTE.length], flex: 'none' }} />
              <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1.2 var(--font-sans)', color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
            </button>
          ))}
        </div>
        {rows.map((row, ri) => {
          const best = bestOf(row)
          return (
            <div key={row.label} style={{ display: 'grid', gridTemplateColumns: col, gap: 14, alignItems: 'center', padding: '13px 20px', borderTop: ri ? '1px solid var(--hairline)' : 'none' }}>
              <span style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{row.label}</span>
              {acts.map((a, i) => (
                <span key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6, font: `var(--fw-${i === best ? 'bold' : 'medium'}) var(--fs-sm)/1 var(--font-mono)`, color: i === best ? 'var(--text-strong)' : 'var(--text-body)' }}>
                  {row.text(a)}
                  {i === best && <Icon name="award" size={13} color="var(--amber-400)" />}
                </span>
              ))}
            </div>
          )
        })}
      </Card>

      {/* progress-aligned pace overlay — runs only */}
      {allRun && (
        <Card title="配速叠加 · 按进度对齐" style={{ marginBottom: 16 }} action={<span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>越高越快</span>}>
          <OverlayChart series={curves.map((c) => c.pace)} invert />
          <OverlayLegend acts={acts} />
        </Card>
      )}

      {/* progress-aligned HR overlay */}
      <Card title="心率叠加 · 按进度对齐" action={<span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>{allRun ? '按进度对齐' : '跨项目仅叠加心率'}</span>}>
        <OverlayChart series={curves.map((c) => c.hr)} />
        <OverlayLegend acts={acts} />
      </Card>
    </div>
  )
}
