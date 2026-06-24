// 活动详情 Activity Detail (heterogeneous, per-sport). Same frame, sport-specific
// content blocks. Load-source transparency + RPE backfill for HR-less sports.
// Time-series are synthesised client-side from the activity summary until the
// backend serves real streams (GET /activities/:id/streams).
import { Fragment, useState } from 'react'
import type { ReactNode } from 'react'
import { Card, Badge, Button } from '../design-system'
import { Icon } from '../components/Icon'
import { HRZoneBar, GradePyramid, ChartXAxis } from '../components/charts/Charts'
import { SourceBadge } from '../components/SourceBadge'
import { loadSources } from '../lib/taxonomy'
import type { Activity, ActivityVerdict, ApexData, HrZone } from '../lib/types'

const sportColor = (s: string): string =>
  ({
    跑步: 'var(--blue-500)',
    骑行: 'var(--cyan-500)',
    游泳: 'var(--violet-400)',
    力量: 'var(--amber-500)',
    攀岩: 'var(--green-500)',
    抱石: 'var(--green-500)',
    难度: 'var(--green-500)',
    徒步: 'var(--violet-500)',
    登山: 'var(--violet-500)',
  })[s] || 'var(--ink-500)'

const sportIcon = (s: string): string =>
  ({
    跑步: 'footprints',
    骑行: 'bike',
    游泳: 'waves',
    力量: 'dumbbell',
    攀岩: 'grip',
    抱石: 'grip',
    难度: 'route',
    徒步: 'mountain',
    登山: 'mountain',
  })[s] || 'circle'

const durToSec = (str?: string): number => {
  if (!str) return 3600
  const p = String(str).split(':').map(Number)
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + (p[1] || 0)
}
const paceFmt = (sec: number): string => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`
const rng = (seed: number): (() => number) => {
  let x = seed || 1
  return () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff
    return x / 0x7fffffff
  }
}

// ---- detail shape (all optional; empty until the backend fills activityDetails) ----
interface DetailTarget {
  grade?: string
  load?: number
  metric?: string
  pace?: string
  zone?: string
  from?: string
}
interface DetailActual {
  grade?: string
  maxGrade?: string
  sends?: number
  load?: number
  metric?: string
  pace?: string
  zone?: string
}
interface SwimSplit {
  k: string
  pace: string
  swolf?: number
  stroke?: number
}
interface Movement {
  name: string
  sets: string
  weight: string
  rpe: number
  vol: string
}
interface ClimbSendRow {
  grade: string
  line: string
  attempts: number
  status: 'flash' | 'send' | 'project'
  style: string
}
interface DetailAny {
  device?: string
  gym?: string
  pool?: string
  weather?: { temp: number; hum: number; wind?: string }
  elapsed?: string
  moving?: string
  calories?: number | string
  avgHR?: number
  peakHR?: number
  hrDrift?: number
  avgPower?: number
  np?: number
  if?: number
  vi?: number
  ftp?: number
  powerZones?: HrZone[]
  css?: string
  swolf?: number
  splits?: SwimSplit[]
  volume?: string
  rpe?: number
  movements?: Movement[]
  target?: DetailTarget
  actual?: DetailActual
  sends?: ClimbSendRow[]
  ai?: ActivityVerdict
}

type Pt = Record<string, number>
interface LineKey {
  k: string
  color: string
  w?: number
  dash?: string
  op?: number
  invert?: boolean
}

// ---- synthesizers (deterministic from the activity) ----
function genRun(act: Activity): { pts: Pt[]; splits: { k: string; pace: string; hr: number; cad: number; elev: number }[]; zones: HrZone[] } {
  const km = parseFloat(act.dist) || 10
  const totalSec = durToSec(act.dur)
  const basePace = totalSec / km
  const n = 44
  const r = rng(act.id.length * 97 + Math.round(km * 10))
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const work = Math.sin(i / 2.4) > -0.1
    pts.push({
      x: (i / (n - 1)) * km,
      pace: basePace * ((work ? 0.92 : 1.16) + (r() - 0.5) * 0.04),
      hr: Math.round(act.hr * (work ? 1.03 : 0.84) + Math.sin(i / 6) * 3 + (r() - 0.5) * 4),
      elev: Math.round(38 + Math.sin(i / 5) * 16 + i * 0.5),
    })
  }
  const splits = []
  for (let k = 1; k <= Math.floor(km); k++) {
    const work = k % 2 === 1
    splits.push({
      k: `${k}`,
      pace: paceFmt(basePace * ((work ? 0.93 : 1.12) + (r() - 0.5) * 0.03)),
      hr: Math.round(act.hr * (work ? 1.02 : 0.86)),
      cad: 178 + Math.round((r() - 0.5) * 8),
      elev: Math.round((r() - 0.5) * 24),
    })
  }
  const zones: HrZone[] = [
    { z: 'Z1', label: '恢复', pct: 8, color: 'var(--ink-500)' },
    { z: 'Z2', label: '有氧', pct: 21, color: 'var(--blue-500)' },
    { z: 'Z3', label: '节奏', pct: 17, color: 'var(--cyan-500)' },
    { z: 'Z4', label: '阈值', pct: 42, color: 'var(--amber-500)' },
    { z: 'Z5', label: '无氧', pct: 12, color: 'var(--red-500)' },
  ]
  return { pts, splits, zones }
}
function genRide(act: Activity, d: DetailAny): Pt[] {
  const totalSec = durToSec(d.elapsed || act.dur)
  const n = 48
  const r = rng(act.id.length * 71 + 3)
  const base = d.avgPower || 200
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const surge = Math.sin(i / 3) > 0.55
    pts.push({
      x: (i / (n - 1)) * (totalSec / 60),
      power: Math.max(60, Math.round(base * (surge ? 1.45 : 0.9) + (r() - 0.5) * 30)),
      hr: Math.round((act.hr || 140) * (surge ? 1.08 : 0.92) + (r() - 0.5) * 5),
    })
  }
  return pts
}
function genClimbHR(act: Activity, d: DetailAny): Pt[] {
  const totalSec = durToSec(d.elapsed || act.dur)
  const n = 40
  const r = rng(act.id.length * 53 + 7)
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const burst = Math.sin(i / 1.6) > 0.4
    pts.push({ x: (i / (n - 1)) * (totalSec / 60), hr: Math.round((d.avgHR || act.hr || 120) * (burst ? 1.22 : 0.86) + (r() - 0.5) * 6) })
  }
  return pts
}

// ---- charts ----
function LineChart({ pts, keys, width = 1000, height = 220, xUnit }: { pts: Pt[]; keys: LineKey[]; width?: number; height?: number; xUnit?: string }) {
  if (pts.length < 2) return null
  const pad = { t: 16, r: 14, b: 20, l: 14 }
  const w = width - pad.l - pad.r
  const h = height - pad.t - pad.b
  const xs = (i: number) => pad.l + (i / (pts.length - 1)) * w
  const norm = (k: string) => {
    const arr = pts.map((p) => p[k])
    const mn = Math.min(...arr)
    const mx = Math.max(...arr)
    return (v: number) => (mx - mn ? (v - mn) / (mx - mn) : 0.5)
  }
  const y = (t: number) => pad.t + h - t * h
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {[0.25, 0.5, 0.75].map((g, i) => (
        <line key={i} x1={pad.l} x2={width - pad.r} y1={pad.t + h - g * h} y2={pad.t + h - g * h} stroke="var(--hairline)" />
      ))}
      {keys.map((kk) => {
        const nf = norm(kk.k)
        const d = pts.map((p, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${y(kk.invert ? 1 - nf(p[kk.k]) : nf(p[kk.k])).toFixed(1)}`).join(' ')
        return <path key={kk.k} d={d} fill="none" stroke={kk.color} strokeWidth={kk.w || 2} strokeDasharray={kk.dash || 'none'} strokeLinejoin="round" opacity={kk.op || 1} />
      })}
      {xUnit && (
        <ChartXAxis
          labels={[
            `${Math.round(pts[0].x)}`,
            `${Math.round(pts[Math.floor((pts.length - 1) / 2)].x)}`,
            `${Math.round(pts[pts.length - 1].x)} ${xUnit}`,
          ]}
          width={width}
          y={height - 4}
          padL={pad.l}
          padR={pad.r}
        />
      )}
    </svg>
  )
}

// ---- shared bits ----
function Label({ children }: { children: ReactNode }) {
  return <span style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{children}</span>
}
function Metric({ label, value, unit }: { label: string; value: ReactNode; unit?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <Label>{label}</Label>
      <div style={{ font: 'var(--fw-bold) var(--fs-h2)/1 var(--font-mono)', color: 'var(--text-strong)' }}>
        {value}
        {unit ? <span style={{ fontSize: 12, color: 'var(--text-faint)', marginLeft: 3 }}>{unit}</span> : null}
      </div>
    </div>
  )
}
function SectionTitle({ icon, children, right }: { icon: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <Icon name={icon} size={16} color="var(--text-muted)" />
      <h2 style={{ margin: 0, font: 'var(--fw-bold) var(--fs-lg)/1 var(--font-display)', letterSpacing: 'var(--ls-tight)', color: 'var(--text-strong)' }}>{children}</h2>
      {right && <div style={{ marginLeft: 'auto' }}>{right}</div>}
    </div>
  )
}

// Algorithm transparency at the activity level: which model produced this AU,
// plus RPE backfill for HR-less sports (RPE recomputes sRPE = RPE × minutes).
function LoadSourceBar({ act, durSec, seededRpe, onToast }: { act: Activity; durSec: number; seededRpe?: number; onToast: (m: string) => void }) {
  const srcKey = act.loadSrc ?? 'HR-TRIMP'
  const src = loadSources[srcKey] ?? { label: srcKey, icon: 'gauge', desc: '负荷归一来源', color: 'var(--text-faint)' }
  const rpeBased = /RPE/.test(srcKey)
  const [rpe, setRpe] = useState(seededRpe ?? 7)
  const [load, setLoad] = useState(act.load)
  const submitRpe = () => {
    const mins = Math.max(1, Math.round(durSec / 60))
    const next = Math.round(mins * rpe)
    setLoad(next)
    onToast(`已按 RPE ${rpe} 补录负荷（${next} AU）`)
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', marginBottom: 22, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--inner-top)' }}>
      <span style={{ width: 40, height: 40, borderRadius: 10, background: `${src.color}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
        <Icon name={src.icon} size={19} color={src.color} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>负荷来源 · {src.label}</span>
          <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{load} AU</span>
        </div>
        <div style={{ font: 'var(--fw-regular) var(--fs-xs)/1.4 var(--font-sans)', color: 'var(--text-faint)', marginTop: 4 }}>{src.desc}</div>
      </div>
      {rpeBased && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 16, borderLeft: '1px solid var(--hairline)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Label>主观 RPE</Label>
            <span style={{ font: 'var(--fw-bold) var(--fs-h3)/1 var(--font-mono)', color: src.color }}>
              {rpe}
              <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>/10</span>
            </span>
          </div>
          <input type="range" min={1} max={10} step={1} value={rpe} aria-label="RPE" onChange={(e) => setRpe(Number(e.target.value))} style={{ width: 120, accentColor: src.color }} />
          <Button variant="secondary" size="sm" iconLeft={<Icon name="check" size={13} />} onClick={submitRpe}>
            补录
          </Button>
        </div>
      )}
    </div>
  )
}

type CompareRow = [string, ReactNode, ReactNode, boolean | null]
function PlanCompare({ rows }: { rows: CompareRow[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 18, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--inner-top)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="git-compare" size={15} color="var(--text-muted)" />
        <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>计划 vs 实际</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div />
        <span style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)', textAlign: 'right' }}>目标</span>
        <span style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--blue-300)', textAlign: 'right' }}>实际</span>
        {rows.map(([k, t, a, hit]) => (
          <Fragment key={k}>
            <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-muted)' }}>{k}</span>
            <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-faint)', textAlign: 'right' }}>{t}</span>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-strong)' }}>
              {a}
              {hit != null && <Icon name={hit ? 'check' : 'minus'} size={13} color={hit ? 'var(--green-500)' : 'var(--amber-500)'} />}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  )
}

function AIReview({ ai }: { ai: ActivityVerdict }) {
  const tone = ({ positive: 'var(--green-500)', accent: 'var(--blue-400)', caution: 'var(--amber-500)' } as Record<string, string>)[ai.tone] || 'var(--blue-400)'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 20, background: 'linear-gradient(150deg, rgba(59,91,255,0.10), rgba(124,77,255,0.08))', border: '1px solid rgba(124,77,255,0.3)', borderRadius: 'var(--r-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="sparkles" size={15} color="#fff" />
        </span>
        <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>AI 单次训练点评</span>
        <Badge tone={ai.tone === 'positive' ? 'positive' : 'accent'} dot>
          {ai.verdict}
        </Badge>
      </div>
      <p style={{ margin: 0, font: 'var(--fw-regular) var(--fs-sm)/1.6 var(--font-sans)', color: 'var(--text-body)', textWrap: 'pretty' }}>{ai.text}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ai.tags.map((t) => (
          <span key={t} style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', color: tone, background: 'var(--surface-card)', border: '1px solid var(--hairline)', padding: '6px 10px', borderRadius: 'var(--r-pill)' }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

function RoutePlaceholder() {
  return (
    <div style={{ position: 'relative', height: 240, borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: 'repeating-linear-gradient(45deg, var(--surface-card), var(--surface-card) 12px, var(--surface-base) 12px, var(--surface-base) 24px)' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <Icon name="map" size={26} color="var(--text-faint)" />
        <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-muted)' }}>路线地图占位</span>
        <span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>接入时渲染 GPS 轨迹 · 海拔剖面 · 里程标记</span>
      </div>
    </div>
  )
}

interface Col {
  h: string
  w: string
  mono?: boolean
  bold?: boolean
  dim?: boolean
  right?: boolean
}
function Table({ cols, rows }: { cols: Col[]; rows: ReactNode[][] }) {
  const tmpl = cols.map((c) => c.w).join(' ')
  return (
    <Card padding="none">
      <div style={{ display: 'grid', gridTemplateColumns: tmpl, gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--hairline)' }}>
        {cols.map((c) => (
          <span key={c.h} style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)', textAlign: c.right ? 'right' : 'left' }}>
            {c.h}
          </span>
        ))}
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: tmpl, gap: 12, alignItems: 'center', padding: '13px 20px', borderTop: i ? '1px solid var(--hairline)' : 'none' }}>
          {r.map((cell, j) => (
            <span key={j} style={{ font: `var(--fw-${cols[j].bold ? 'bold' : 'medium'}) var(--fs-sm)/1 ${cols[j].mono ? 'var(--font-mono)' : 'var(--font-sans)'}`, color: cols[j].dim ? 'var(--text-muted)' : 'var(--text-strong)', textAlign: cols[j].right ? 'right' : 'left' }}>
              {cell}
            </span>
          ))}
        </div>
      ))}
    </Card>
  )
}

const STATUS_LABEL: Record<string, [string, string]> = {
  flash: ['闪攀', 'var(--green-500)'],
  send: ['完攀', 'var(--blue-400)'],
  project: ['项目', 'var(--amber-500)'],
}

type HeaderChip = [string, string]

export interface ActivityDetailProps {
  data: ApexData
  act: Activity
  spec: boolean
  onToast: (msg: string) => void
}

export function ActivityDetail({ data, act, onToast }: ActivityDetailProps) {
  const detail = (data.activityDetails[act.id] ?? {}) as DetailAny
  const sp = act.sport
  const c = sportColor(sp)
  const isClimb = sp === '攀岩' || sp === '抱石' || sp === '难度'
  const isRide = sp === '骑行'
  const isSwim = sp === '游泳'
  const isStrength = sp === '力量'
  const isRun = sp === '跑步'

  const chips: HeaderChip[] = [
    ['calendar', act.date],
    ['radio', detail.device || '设备同步'],
  ]
  if (isClimb && detail.gym) chips.push(['map-pin', detail.gym])
  else if (isSwim && detail.pool) chips.push(['waves', detail.pool])
  else if (detail.weather) {
    chips.push(['thermometer', `${detail.weather.temp}℃ · 湿度 ${detail.weather.hum}%`])
    if (detail.weather.wind) chips.push(['wind', detail.weather.wind])
  }

  let metrics: [string, ReactNode, string][]
  if (isRide)
    metrics = [
      ['距离', act.dist, ''],
      ['移动时间', detail.moving || act.dur, ''],
      ['平均功率', detail.avgPower ?? '—', 'W'],
      ['标准化功率', detail.np ?? '—', 'W'],
      ['IF', detail.if ?? '—', ''],
      ['负荷', act.load, 'AU'],
    ]
  else if (isSwim)
    metrics = [
      ['距离', act.dist, ''],
      ['时长', detail.elapsed || act.dur, ''],
      ['CSS 配速', detail.css ?? '—', ''],
      ['SWOLF', detail.swolf ?? '—', ''],
      ['平均心率', detail.avgHR || act.hr, 'bpm'],
      ['负荷', act.load, 'AU'],
    ]
  else if (isStrength)
    metrics = [
      ['时长', detail.elapsed || act.dur, ''],
      ['总容量', detail.volume ?? '—', ''],
      ['平均 RPE', detail.rpe ?? '—', '/10'],
      ['平均心率', detail.avgHR || act.hr, 'bpm'],
      ['卡路里', detail.calories ?? '—', ''],
      ['负荷', act.load, 'AU'],
    ]
  else if (isClimb)
    metrics = [
      ['时长', detail.elapsed || act.dur, ''],
      ['完攀', detail.actual?.sends ?? '—', '条'],
      ['最高难度', detail.actual?.maxGrade ?? '—', ''],
      ['负荷', act.load, 'AU'],
      ['平均心率', detail.avgHR || act.hr, 'bpm'],
      ['峰值心率', detail.peakHR ?? '—', 'bpm'],
    ]
  else
    metrics = [
      ['距离', act.dist, ''],
      ['移动时间', detail.moving || act.dur, ''],
      ['平均配速', detail.actual?.pace ? detail.actual.pace.replace(' /km', '') : '—', '/km'],
      ['平均心率', act.hr, 'bpm'],
      ['负荷 (TSS)', act.load, 'AU'],
      ['爬升', sp === '徒步' || sp === '登山' ? '1240' : '86', 'm'],
    ]

  // plan vs actual rows
  let compareRows: CompareRow[] | null = null
  if (detail.target) {
    if (isClimb)
      compareRows = [
        ['训练', detail.target.grade ?? '—', detail.actual ? `极限 ${detail.actual.maxGrade}` : '—', null],
        ['负荷 (AU)', detail.target.load ?? '—', detail.actual?.load ?? act.load, detail.actual ? (detail.actual.load ?? 0) <= (detail.target.load ?? 999) : null],
      ]
    else if (detail.target.metric)
      compareRows = [
        ['指标', detail.target.metric, detail.actual?.metric ?? '—', true],
        ['负荷 (AU)', detail.target.load ?? '—', detail.actual?.load ?? act.load, detail.actual ? (detail.actual.load ?? 0) <= (detail.target.load ?? 0) + 5 : null],
      ]
    else
      compareRows = [
        ['配速', detail.target.pace ?? '—', detail.actual?.pace ?? '—', true],
        ['区间', detail.target.zone ?? '—', detail.actual?.zone ?? '—', true],
        ['负荷 (AU)', detail.target.load ?? '—', detail.actual?.load ?? act.load, true],
      ]
  }

  const run = isRun ? genRun(act) : null
  const sends = detail.sends ?? []

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, padding: 24, marginBottom: 18, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md), var(--inner-top)' }}>
        <span style={{ width: 56, height: 56, borderRadius: 14, background: `${c}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <Icon name={sportIcon(sp)} size={26} color={c} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0, font: 'var(--fw-bold) var(--fs-h2)/1.05 var(--font-display)', letterSpacing: 'var(--ls-tight)', color: 'var(--text-strong)' }}>{act.name}</h1>
            <span style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', color: c, background: `${c}1a`, padding: '5px 9px', borderRadius: 'var(--r-pill)' }}>{sp}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, alignItems: 'center' }}>
            {chips.map(([ic, t], i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'var(--surface-inset)', borderRadius: 'var(--r-pill)', font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-muted)' }}>
                <Icon name={ic} size={12} color="var(--text-faint)" />
                {t}
              </span>
            ))}
            <SourceBadge source={detail.device && detail.device.includes('手动') ? 'readyn' : 'garmin'} size="xs" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" size="sm" iconLeft={<Icon name="git-compare" size={14} />} onClick={() => onToast('已加入对比')}>
            对比
          </Button>
          <Button variant="secondary" size="sm" iconLeft={<Icon name="share-2" size={14} />} onClick={() => onToast(`已导出「${act.name}」`)}>
            导出
          </Button>
        </div>
      </div>

      {/* key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 16, padding: 22, marginBottom: 22, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--inner-top)' }}>
        {metrics.map(([l, v, u]) => (
          <Metric key={l} label={l} value={v} unit={u} />
        ))}
      </div>

      {/* load source + RPE */}
      <LoadSourceBar act={act} durSec={durToSec(detail.elapsed || act.dur)} seededRpe={detail.rpe} onToast={onToast} />

      {/* plan vs actual */}
      {compareRows && (
        <div style={{ marginBottom: 22 }}>
          <PlanCompare rows={compareRows} />
        </div>
      )}

      {/* ---- sport-specific blocks ---- */}
      {isRun && run && (
        <Fragment>
          <div style={{ marginBottom: 22 }}>
            <SectionTitle icon="line-chart">配速 · 心率 · 海拔</SectionTitle>
            <Card
              title="数据曲线"
              action={
                <div style={{ display: 'flex', gap: 14 }}>
                  {([['配速', 'var(--blue-500)'], ['心率', 'var(--red-500)']] as const).map(([l, col]) => (
                    <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-muted)' }}>
                      <span style={{ width: 12, height: 2, background: col }} />
                      {l}
                    </span>
                  ))}
                </div>
              }
            >
              <LineChart pts={run.pts} keys={[{ k: 'pace', color: 'var(--blue-500)', w: 2.5, invert: true }, { k: 'hr', color: 'var(--red-500)', w: 2, op: 0.9 }]} xUnit="km" />
            </Card>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(0, 1fr)', gap: 16, marginBottom: 22 }}>
            <Card title="心率区间分布">
              <HRZoneBar zones={run.zones} />
            </Card>
            <Card title="心率漂移">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                <span style={{ font: 'var(--fw-bold) var(--fs-display-lg)/1 var(--font-display)', color: (detail.hrDrift || 5) <= 5 ? 'var(--green-400)' : 'var(--amber-400)' }}>{detail.hrDrift ?? '—'}</span>
                <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-faint)' }}>%</span>
              </div>
              <span style={{ font: 'var(--fw-regular) var(--fs-xs)/1.5 var(--font-sans)', color: 'var(--text-faint)' }}>&lt; 5% 有氧耐受良好，配速可持续；&gt; 8% 提示脱水或强度偏高。</span>
            </Card>
          </div>
          <div style={{ marginBottom: 22 }}>
            <SectionTitle icon="table-2">分段 (Splits)</SectionTitle>
            <Table
              cols={[
                { h: '公里', w: '64px', mono: true, bold: true },
                { h: '配速', w: '1fr', mono: true },
                { h: '心率', w: '1fr', mono: true, dim: true },
                { h: '步频', w: '1fr', mono: true, dim: true },
                { h: '海拔±', w: '1fr', mono: true, dim: true },
              ]}
              rows={run.splits.map((s) => [s.k, s.pace, s.hr, s.cad, `${s.elev > 0 ? '+' : ''}${s.elev}m`])}
            />
          </div>
          <div style={{ marginBottom: 22 }}>
            <SectionTitle icon="map">路线</SectionTitle>
            <RoutePlaceholder />
          </div>
        </Fragment>
      )}

      {isRide && (
        <Fragment>
          <div style={{ marginBottom: 22 }}>
            <SectionTitle icon="zap">功率 · 心率</SectionTitle>
            <Card title="功率曲线">
              <LineChart pts={genRide(act, detail)} keys={[{ k: 'power', color: 'var(--amber-500)', w: 2.5 }, { k: 'hr', color: 'var(--red-500)', w: 2, op: 0.85 }]} xUnit="min" />
            </Card>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.7fr)', gap: 16, marginBottom: 22 }}>
            <Card title="功率指标">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {([['NP 标准化功率', `${detail.np ?? '—'} W`], ['IF 强度因子', detail.if ?? '—'], ['VI 变异指数', detail.vi ?? '—'], ['FTP', `${detail.ftp ?? '—'} W`]] as const).map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Label>{l}</Label>
                    <span style={{ font: 'var(--fw-bold) var(--fs-lg)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="功率区间分布">
              {detail.powerZones?.length ? <HRZoneBar zones={detail.powerZones} /> : <span style={{ font: 'var(--fw-regular) var(--fs-xs)/1.5 var(--font-sans)', color: 'var(--text-faint)' }}>接入功率流后显示功率区间分布。</span>}
            </Card>
          </div>
        </Fragment>
      )}

      {isSwim && (
        <Fragment>
          <div style={{ marginBottom: 22 }}>
            <SectionTitle icon="waves">分段 · SWOLF</SectionTitle>
            {detail.splits?.length ? (
              <Table
                cols={[
                  { h: '分段', w: '1fr', mono: true, bold: true },
                  { h: '配速 /100m', w: '1fr', mono: true },
                  { h: 'SWOLF', w: '1fr', mono: true, dim: true },
                  { h: '划水次数', w: '1fr', mono: true, dim: true },
                ]}
                rows={detail.splits.map((s) => [s.k, s.pace, s.swolf ?? '—', s.stroke ?? '—'])}
              />
            ) : (
              <Card>
                <span style={{ font: 'var(--fw-regular) var(--fs-xs)/1.5 var(--font-sans)', color: 'var(--text-faint)' }}>接入泳池圈数据后显示每段配速与 SWOLF。</span>
              </Card>
            )}
          </div>
          <Card title="效率说明" style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', gap: 10, padding: 14, background: 'var(--surface-inset)', borderRadius: 'var(--r-md)' }}>
              <Icon name="info" size={15} color="var(--blue-400)" />
              <span style={{ font: 'var(--fw-regular) var(--fs-xs)/1.55 var(--font-sans)', color: 'var(--text-muted)' }}>SWOLF = 单程用时(秒) + 划水次数，越低代表划水效率越高。CSS（临界泳速）是游泳的乳酸阈，用于设定间歇配速。</span>
            </div>
          </Card>
        </Fragment>
      )}

      {isStrength && (
        <div style={{ marginBottom: 22 }}>
          <SectionTitle icon="dumbbell">动作 · 组次 · 容量</SectionTitle>
          {detail.movements?.length ? (
            <Table
              cols={[
                { h: '动作', w: '1.6fr', bold: true },
                { h: '组×次', w: '1fr', mono: true },
                { h: '重量', w: '1fr', mono: true, dim: true },
                { h: 'RPE', w: '0.7fr', mono: true, dim: true },
                { h: '容量', w: '1fr', mono: true, right: true },
              ]}
              rows={detail.movements.map((m) => [m.name, m.sets, m.weight, m.rpe, m.vol])}
            />
          ) : (
            <Card>
              <span style={{ font: 'var(--fw-regular) var(--fs-xs)/1.5 var(--font-sans)', color: 'var(--text-faint)' }}>录入或同步动作后显示组次、重量、RPE 与容量。</span>
            </Card>
          )}
        </div>
      )}

      {isClimb && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.9fr) minmax(0, 1fr)', gap: 16, marginBottom: 22 }}>
          <div>
            <SectionTitle icon="list-checks">完攀记录</SectionTitle>
            {sends.length ? (
              <Card padding="none">
                <div style={{ display: 'grid', gridTemplateColumns: '64px 1.4fr 0.7fr 0.9fr 1fr', gap: 12, padding: '12px 18px', borderBottom: '1px solid var(--hairline)' }}>
                  {['难度', '线路', '尝试', '状态', '风格'].map((h) => (
                    <span key={h} style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
                      {h}
                    </span>
                  ))}
                </div>
                {sends.map((s, i) => {
                  const st = STATUS_LABEL[s.status] ?? ['—', 'var(--text-faint)']
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '64px 1.4fr 0.7fr 0.9fr 1fr', gap: 12, alignItems: 'center', padding: '13px 18px', borderTop: i ? '1px solid var(--hairline)' : 'none' }}>
                      <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{s.grade}</span>
                      <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-body)' }}>{s.line}</span>
                      <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-muted)' }}>{s.attempts}</span>
                      <span style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', color: st[1] }}>{st[0]}</span>
                      <span style={{ font: 'var(--fw-regular) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>{s.style}</span>
                    </div>
                  )
                })}
              </Card>
            ) : (
              <Card>
                <span style={{ font: 'var(--fw-regular) var(--fs-xs)/1.5 var(--font-sans)', color: 'var(--text-faint)' }}>记录或从 8a.nu 同步完攀后显示难度/线路/尝试/状态。</span>
              </Card>
            )}
          </div>
          <div>
            <SectionTitle icon="bar-chart-3">本次难度分布</SectionTitle>
            <Card>
              <GradePyramid
                rows={(() => {
                  const m: Record<string, number> = {}
                  sends.forEach((s) => {
                    m[s.grade] = (m[s.grade] || 0) + 1
                  })
                  const cols: Record<string, string> = { V6: 'var(--red-500)', V5: 'var(--amber-500)', V4: 'var(--cyan-500)' }
                  return Object.keys(m)
                    .sort()
                    .reverse()
                    .map((g) => ({ grade: g, sends: m[g], color: cols[g] || 'var(--blue-500)' }))
                })()}
              />
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="heart-pulse" size={14} color="var(--red-400)" />
                <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-muted)' }}>峰值心率</span>
                <span style={{ marginLeft: 'auto', font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{detail.peakHR ?? '—'} bpm</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {isClimb && !sends.length && (
        <div style={{ marginBottom: 22 }}>
          <Card title="心率 (整段)">
            <LineChart pts={genClimbHR(act, detail)} keys={[{ k: 'hr', color: 'var(--red-500)', w: 2 }]} height={180} xUnit="min" />
          </Card>
        </div>
      )}

      {/* AI review */}
      {detail.ai && <AIReview ai={detail.ai} />}
    </div>
  )
}
