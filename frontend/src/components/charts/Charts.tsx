import { useId } from 'react'
import type { BalanceAxis, HeatCell, HrvPoint, HrZone, PmcPoint, PyramidRow, SleepNight } from '../../lib/types'

// Performance Management Chart — CTL (fitness) area, ATL (fatigue) line, TSB (form) baseline
export interface PMCChartProps {
  data: PmcPoint[]
  width?: number
  height?: number
}
export function PMCChart({ data, width = 760, height = 240 }: PMCChartProps) {
  const g = 'pmc' + useId().replace(/:/g, '')
  const pad = { t: 16, r: 10, b: 24, l: 10 }
  const w = width - pad.l - pad.r
  const h = height - pad.t - pad.b
  const vals = data.flatMap((d) => [d.ctl, d.atl])
  const max = Math.max(...vals) * 1.12
  const min = Math.min(0, ...data.map((d) => d.tsb)) * 1.2
  const range = max - min
  const x = (i: number) => pad.l + (i / (data.length - 1)) * w
  const y = (v: number) => pad.t + h - ((v - min) / range) * h
  const zeroY = y(0)
  const path = (key: 'ctl' | 'atl' | 'tsb') =>
    data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(' ')
  const ctlArea = `${path('ctl')} L${x(data.length - 1)},${zeroY} L${x(0)},${zeroY} Z`
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--blue-500)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--blue-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((gl, i) => (
        <line
          key={i}
          x1={pad.l}
          x2={width - pad.r}
          y1={pad.t + h - gl * h}
          y2={pad.t + h - gl * h}
          stroke="var(--hairline)"
          strokeWidth="1"
        />
      ))}
      <line x1={pad.l} x2={width - pad.r} y1={zeroY} y2={zeroY} stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="3 3" />
      <path d={ctlArea} fill={`url(#${g})`} />
      <path d={path('ctl')} fill="none" stroke="var(--blue-500)" strokeWidth="2.5" strokeLinejoin="round" />
      <path d={path('atl')} fill="none" stroke="var(--violet-500)" strokeWidth="2" strokeDasharray="5 3" strokeLinejoin="round" />
      <path d={path('tsb')} fill="none" stroke="var(--green-500)" strokeWidth="2" strokeLinejoin="round" />
      <circle
        cx={x(data.length - 1)}
        cy={y(data[data.length - 1].ctl)}
        r="3.5"
        fill="var(--blue-500)"
        stroke="var(--ink-900)"
        strokeWidth="1.5"
      />
    </svg>
  )
}

// HRV trend — bars under a baseline band line
export interface HRVChartProps {
  data: HrvPoint[]
  width?: number
  height?: number
}
export function HRVChart({ data, width = 360, height = 150 }: HRVChartProps) {
  const pad = { t: 12, r: 6, b: 8, l: 6 }
  const w = width - pad.l - pad.r
  const h = height - pad.t - pad.b
  const max = Math.max(...data.map((d) => d.v)) * 1.1
  const min = Math.min(...data.map((d) => d.v)) * 0.82
  const range = max - min || 1
  const x = (i: number) => pad.l + (i / (data.length - 1)) * w
  const y = (v: number) => pad.t + h - ((v - min) / range) * h
  const baseLine = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.base).toFixed(1)}`).join(' ')
  const bw = (w / data.length) * 0.46
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {data.map((d, i) => {
        const up = d.v >= d.base
        return (
          <rect
            key={i}
            x={x(i) - bw / 2}
            y={y(d.v)}
            width={bw}
            height={pad.t + h - y(d.v)}
            rx="2"
            fill={up ? 'var(--green-500)' : 'var(--amber-500)'}
            opacity={i > data.length - 4 ? 0.95 : 0.5}
          />
        )
      })}
      <path d={baseLine} fill="none" stroke="var(--ink-200)" strokeWidth="1.5" strokeDasharray="4 3" />
    </svg>
  )
}

// Stacked sleep stages (per night), hours
const SLEEP_STAGES: [keyof Pick<SleepNight, 'deep' | 'rem' | 'light' | 'awake'>, string][] = [
  ['deep', 'var(--violet-500)'],
  ['rem', 'var(--blue-500)'],
  ['light', 'var(--ink-600)'],
  ['awake', 'var(--ink-700)'],
]
export interface SleepBarsProps {
  nights: SleepNight[]
  height?: number
}
export function SleepBars({ nights, height = 150 }: SleepBarsProps) {
  const max = Math.max(...nights.map((n) => n.deep + n.rem + n.light + n.awake)) * 1.05
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height }}>
      {nights.map((n, i) => {
        const total = n.deep + n.rem + n.light + n.awake
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              height: '100%',
              justifyContent: 'flex-end',
            }}
          >
            <span style={{ font: 'var(--fw-bold) 11px/1 var(--font-mono)', color: 'var(--text-faint)' }}>{total.toFixed(1)}</span>
            <div style={{ width: '70%', height: `${(total / max) * 100}%`, display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden' }}>
              {SLEEP_STAGES.map(([k, c]) => (
                <div key={k} style={{ height: `${(n[k] / total) * 100}%`, background: c }} />
              ))}
            </div>
            <span style={{ font: 'var(--fw-medium) 10px/1 var(--font-sans)', color: 'var(--text-faint)' }}>{n.d}</span>
          </div>
        )
      })}
    </div>
  )
}

// Horizontal stacked HR-zone bar + legend grid
export function HRZoneBar({ zones }: { zones: HrZone[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', height: 18, borderRadius: 'var(--r-pill)', overflow: 'hidden', gap: 2 }}>
        {zones.map((z) => (
          <div key={z.z} title={`${z.label} ${z.pct}%`} style={{ width: `${z.pct}%`, background: z.color }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
        {zones.map((z) => (
          <div key={z.z} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
                color: 'var(--text-muted)',
                letterSpacing: 'var(--ls-wide)',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: 2, background: z.color }} />
              {z.z}
            </span>
            <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{z.pct}%</span>
            <span style={{ font: 'var(--fw-medium) 10px/1 var(--font-sans)', color: 'var(--text-faint)' }}>{z.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Training balance radar
export function Radar({ data, size = 240 }: { data: BalanceAxis[]; size?: number }) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 34
  const n = data.length
  const ang = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2
  const pt = (i: number, v: number): [number, number] => [
    cx + Math.cos(ang(i)) * r * (v / 100),
    cy + Math.sin(ang(i)) * r * (v / 100),
  ]
  const poly = data.map((d, i) => pt(i, d.v).join(',')).join(' ')
  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      {[0.25, 0.5, 0.75, 1].map((g, gi) => (
        <polygon
          key={gi}
          points={data
            .map((_, i) => [cx + Math.cos(ang(i)) * r * g, cy + Math.sin(ang(i)) * r * g].join(','))
            .join(' ')}
          fill="none"
          stroke="var(--hairline)"
          strokeWidth="1"
        />
      ))}
      {data.map((_, i) => {
        const ex = cx + Math.cos(ang(i)) * r
        const ey = cy + Math.sin(ang(i)) * r
        return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="var(--hairline)" />
      })}
      <polygon points={poly} fill="rgba(59,91,255,0.18)" stroke="var(--blue-500)" strokeWidth="2" strokeLinejoin="round" />
      {data.map((d, i) => {
        const [px, py] = pt(i, d.v)
        return <circle key={i} cx={px} cy={py} r="3" fill="var(--blue-400)" />
      })}
      {data.map((d, i) => {
        const lx = cx + Math.cos(ang(i)) * (r + 20)
        const ly = cy + Math.sin(ang(i)) * (r + 20)
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-sans)"
            fontWeight="600"
            fontSize="10"
            fill="var(--text-muted)"
          >
            {d.axis}
          </text>
        )
      })}
    </svg>
  )
}

// 13-week activity heatmap (7 rows × 13 cols)
const HEAT_SHADES = [
  'var(--ink-800)',
  'rgba(59,91,255,0.28)',
  'rgba(59,91,255,0.5)',
  'rgba(59,91,255,0.74)',
  'var(--blue-400)',
]
export function Heatmap({ data, cols = 13 }: { data: HeatCell[]; cols?: number }) {
  const rows = 7
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: '1fr', gap: 4 }}>
      {Array.from({ length: rows * cols }, (_, idx) => {
        const d = data[idx % data.length]
        const v = Math.min(4, d.v)
        return <div key={idx} title={`负荷 ${v}`} style={{ aspectRatio: '1', borderRadius: 3, background: HEAT_SHADES[v] }} />
      })}
    </div>
  )
}

// Climbing grade pyramid (horizontal bars)
export function GradePyramid({ rows }: { rows: PyramidRow[] }) {
  const max = Math.max(...rows.map((r) => r.sends))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((r) => (
        <div key={r.grade} style={{ display: 'grid', gridTemplateColumns: '34px 1fr 28px', alignItems: 'center', gap: 10 }}>
          <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{r.grade}</span>
          <div style={{ height: 16, background: 'var(--surface-inset)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
            <div style={{ width: `${(r.sends / max) * 100}%`, height: '100%', background: r.color, borderRadius: 'var(--r-sm)' }} />
          </div>
          <span style={{ font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-muted)', textAlign: 'right' }}>
            {r.sends}
          </span>
        </div>
      ))}
    </div>
  )
}

// Donut for discipline split
export interface DonutDatum {
  pct: number
  color: string
}
export function Donut({ data, size = 160, thickness = 22 }: { data: DonutDatum[]; size?: number; thickness?: number }) {
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  // Precompute each segment's length and cumulative offset (no render-time mutation).
  const segments = data.reduce<{ len: number; offset: number; color: string }[]>((segs, d) => {
    const len = (d.pct / 100) * c
    const offset = segs.length ? segs[segs.length - 1].offset + segs[segs.length - 1].len : 0
    segs.push({ len, offset, color: d.color })
    return segs
  }, [])
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-inset)" strokeWidth={thickness} />
      {segments.map((s, i) => (
        <circle
          key={i}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={thickness}
          strokeDasharray={`${s.len} ${c - s.len}`}
          strokeDashoffset={-s.offset}
        />
      ))}
    </svg>
  )
}
