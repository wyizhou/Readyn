// 运动记录对比 — compare 2–4 activities: a metric table (best-per-row medal) plus
// a progress-aligned HR overlay. Pace is hidden across mixed sports (design v9 D).
import { Card } from '../design-system'
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
const rng = (seed: number): (() => number) => {
  let x = seed || 1
  return () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff
    return x / 0x7fffffff
  }
}
// Synthesise a progress-aligned (0–100%) HR series for one activity.
function hrSeries(a: Activity, n = 40): number[] {
  const r = rng(a.id.length * 41 + a.hr)
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    const work = Math.sin(i / 2.2) > -0.1
    out.push(Math.round((a.hr || 130) * (work ? 1.04 : 0.86) + (r() - 0.5) * 5))
  }
  return out
}

interface Row {
  label: string
  text: (a: Activity) => string
  num?: (a: Activity) => number
  dir?: 'max' | 'min'
}

const ROWS: Row[] = [
  { label: '项目', text: (a) => a.sport },
  { label: '日期', text: (a) => a.date },
  { label: '距离', text: (a) => a.dist, num: (a) => distKm(a.dist), dir: 'max' },
  { label: '时长', text: (a) => a.dur, num: (a) => durToSec(a.dur) },
  { label: '负荷', text: (a) => `${a.load} AU${a.loadSrc ? ` · ${a.loadSrc}` : ''}`, num: (a) => a.load, dir: 'max' },
  { label: '平均心率', text: (a) => `${a.hr} bpm`, num: (a) => a.hr, dir: 'min' },
]

function HRSeriesChart({ acts, width = 960, height = 220 }: { acts: Activity[]; width?: number; height?: number }) {
  const series = acts.map(hrSeries)
  const all = series.flat()
  const min = Math.min(...all) * 0.95
  const max = Math.max(...all) * 1.05
  const range = max - min || 1
  const pad = { t: 16, r: 14, b: 22, l: 14 }
  const w = width - pad.l - pad.r
  const h = height - pad.t - pad.b
  const x = (i: number, n: number) => pad.l + (i / (n - 1)) * w
  const y = (v: number) => pad.t + h - ((v - min) / range) * h
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

export interface ActivityCompareProps {
  data: ApexData
  ids: string[]
  onOpenActivity: (a: Activity) => void
}

export function ActivityCompare({ data, ids, onOpenActivity }: ActivityCompareProps) {
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

  const col = `160px repeat(${acts.length}, minmax(0, 1fr))`

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
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
        {ROWS.map((row, ri) => {
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

      {/* progress-aligned HR overlay */}
      <Card title="心率叠加 · 按进度对齐" action={<span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>跨项目仅叠加心率</span>}>
        <HRSeriesChart acts={acts} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--hairline)' }}>
          {acts.map((a, i) => (
            <span key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-muted)' }}>
              <span style={{ width: 12, height: 2, background: PALETTE[i % PALETTE.length] }} />
              {a.name}
            </span>
          ))}
        </div>
      </Card>
    </div>
  )
}
