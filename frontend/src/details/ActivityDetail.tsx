// Readyn Personal — 活动详情 Activity Detail (full-screen).
import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { Card, Badge, Button } from '../design-system'
import { Icon } from '../components/Icon'
import { SpecPin } from '../components/spec/Spec'
import { HRZoneBar, GradePyramid } from '../components/charts/Charts'
import type {
  Activity,
  ActivityDetail as ActivityDetailData,
  ActivityVerdict,
  ApexData,
  HrZone,
  PyramidRow,
} from '../lib/types'

const sportColor = (s: string): string =>
  ({
    跑步: 'var(--blue-500)',
    登山: 'var(--violet-500)',
    抱石: 'var(--cyan-500)',
    难度: 'var(--green-500)',
    徒步: 'var(--amber-500)',
  })[s] || 'var(--ink-500)'

const sportIcon = (s: string): string =>
  ({ 跑步: 'footprints', 登山: 'mountain', 抱石: 'grip', 难度: 'route', 徒步: 'tent-tree' })[s] || 'circle'

const isClimb = (s: string): boolean => s === '抱石' || s === '难度'

// ---- parsing helpers ----
const durToSec = (str?: string): number => {
  if (!str) return 3600
  const p = String(str).split(':').map(Number)
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + (p[1] || 0)
}
const paceFmt = (sec: number): string => {
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

// deterministic pseudo-random from seed
const rng = (seed: number): (() => number) => {
  let x = seed
  return () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff
    return x / 0x7fffffff
  }
}

interface RunPoint {
  x: number
  pace: number
  hr: number
  elev: number
}
interface RunSplit {
  k: string
  pace: string
  hr: number
  cad: number
  elev: number
  partial?: boolean
}
interface RunData {
  pts: RunPoint[]
  splits: RunSplit[]
  zones: HrZone[]
}

function genRun(act: Activity): RunData {
  const km = parseFloat(act.dist) || 10
  const totalSec = durToSec(act.dur)
  const basePace = totalSec / km // sec/km
  const n = 44
  const r = rng(act.id.length * 97 + Math.round(km * 10))
  const pts: RunPoint[] = []
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * km
    const work = Math.sin(i / 2.4) > -0.1 // interval-ish
    const pace = basePace * ((work ? 0.92 : 1.16) + (r() - 0.5) * 0.04)
    const hr = act.hr * (work ? 1.03 : 0.84) + Math.sin(i / 6) * 3 + (r() - 0.5) * 4
    const elev = 38 + Math.sin(i / 5) * 16 + i * 0.5
    pts.push({ x, pace, hr: Math.round(hr), elev: Math.round(elev) })
  }
  const splits: RunSplit[] = []
  for (let k = 1; k <= Math.floor(km); k++) {
    const work = k % 2 === 1
    const ps = basePace * ((work ? 0.93 : 1.12) + (r() - 0.5) * 0.03)
    splits.push({
      k: `${k}`,
      pace: paceFmt(ps),
      hr: Math.round(act.hr * (work ? 1.02 : 0.86)),
      cad: 178 + Math.round((r() - 0.5) * 8),
      elev: Math.round((r() - 0.5) * 24),
    })
  }
  if (km % 1 > 0.1) splits.push({ k: km.toFixed(1), pace: paceFmt(basePace), hr: act.hr, cad: 180, elev: 6, partial: true })
  // HR zones (seconds) — biased to Z4 for threshold
  const zones: HrZone[] = [
    { z: 'Z1', label: '恢复', pct: 8, color: 'var(--ink-500)' },
    { z: 'Z2', label: '有氧', pct: 21, color: 'var(--blue-500)' },
    { z: 'Z3', label: '节奏', pct: 17, color: 'var(--cyan-500)' },
    { z: 'Z4', label: '阈值', pct: 42, color: 'var(--amber-500)' },
    { z: 'Z5', label: '无氧', pct: 12, color: 'var(--red-500)' },
  ]
  return { pts, splits, zones }
}

interface ClimbHRPoint {
  x: number
  hr: number
}

function genClimbHR(act: Activity, detail: Partial<ActivityDetailData>): ClimbHRPoint[] {
  const totalSec = durToSec(detail.elapsed || act.dur)
  const n = 40
  const r = rng(act.id.length * 53 + 7)
  const pts: ClimbHRPoint[] = []
  for (let i = 0; i < n; i++) {
    const burst = Math.sin(i / 1.6) > 0.4 // effort bursts
    const hr = (detail.avgHR || act.hr) * (burst ? 1.22 : 0.86) + (r() - 0.5) * 6
    pts.push({ x: (i / (n - 1)) * (totalSec / 60), hr: Math.round(hr) })
  }
  return pts
}

// ---- charts ----
interface TripleChartProps {
  pts: RunPoint[]
  width?: number
  height?: number
}
function TripleChart({ pts, width = 1000, height = 230 }: TripleChartProps) {
  const pad = { t: 16, r: 14, b: 22, l: 14 }
  const w = width - pad.l - pad.r
  const h = height - pad.t - pad.b
  const xs = (i: number) => pad.l + (i / (pts.length - 1)) * w
  const norm = (arr: number[]) => {
    const mn = Math.min(...arr)
    const mx = Math.max(...arr)
    return (v: number) => (mx - mn ? (v - mn) / (mx - mn) : 0.5)
  }
  const paceN = norm(pts.map((p) => p.pace))
  const hrN = norm(pts.map((p) => p.hr))
  const elN = norm(pts.map((p) => p.elev))
  const y = (t: number) => pad.t + h - t * h
  const paceLine = pts
    .map((p, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${y(1 - paceN(p.pace)).toFixed(1)}`)
    .join(' ') // invert: faster=up
  const hrLine = pts.map((p, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${y(hrN(p.hr)).toFixed(1)}`).join(' ')
  const elArea = `${pts
    .map((p, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${y(elN(p.elev) * 0.5).toFixed(1)}`)
    .join(' ')} L${xs(pts.length - 1)},${pad.t + h} L${xs(0)},${pad.t + h} Z`
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="elg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ink-500)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--ink-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g, i) => (
        <line key={i} x1={pad.l} x2={width - pad.r} y1={pad.t + h - g * h} y2={pad.t + h - g * h} stroke="var(--hairline)" />
      ))}
      <path d={elArea} fill="url(#elg)" />
      <path d={hrLine} fill="none" stroke="var(--red-500)" strokeWidth="2" strokeLinejoin="round" opacity="0.9" />
      <path d={paceLine} fill="none" stroke="var(--blue-500)" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  )
}

interface SingleHRProps {
  pts: ClimbHRPoint[]
  width?: number
  height?: number
}
function SingleHR({ pts, width = 1000, height = 180 }: SingleHRProps) {
  const pad = { t: 14, r: 14, b: 18, l: 14 }
  const w = width - pad.l - pad.r
  const h = height - pad.t - pad.b
  const xs = (i: number) => pad.l + (i / (pts.length - 1)) * w
  const mn = Math.min(...pts.map((p) => p.hr)) - 6
  const mx = Math.max(...pts.map((p) => p.hr)) + 6
  const y = (v: number) => pad.t + h - ((v - mn) / (mx - mn)) * h
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)},${y(p.hr).toFixed(1)}`).join(' ')
  const area = `${line} L${xs(pts.length - 1)},${pad.t + h} L${xs(0)},${pad.t + h} Z`
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="hrg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--red-500)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--red-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.33, 0.66].map((g, i) => (
        <line key={i} x1={pad.l} x2={width - pad.r} y1={pad.t + h - g * h} y2={pad.t + h - g * h} stroke="var(--hairline)" />
      ))}
      <path d={area} fill="url(#hrg)" />
      <path d={line} fill="none" stroke="var(--red-500)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
        letterSpacing: 'var(--ls-label)',
        textTransform: 'uppercase',
        color: 'var(--text-faint)',
      }}
    >
      {children}
    </span>
  )
}

function Metric({ label, value, unit }: { label: ReactNode; value: ReactNode; unit: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <Label>{label}</Label>
      <div style={{ font: 'var(--fw-bold) var(--fs-h2)/1 var(--font-mono)', color: 'var(--text-strong)' }}>
        {value}
        <span style={{ fontSize: 12, color: 'var(--text-faint)', marginLeft: 3 }}>{unit}</span>
      </div>
    </div>
  )
}

function SectionTitle({ icon, children, pin }: { icon: string; children: ReactNode; pin?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <Icon name={icon} size={16} color="var(--text-muted)" />
      <h2
        style={{
          margin: 0,
          font: 'var(--fw-bold) var(--fs-lg)/1 var(--font-display)',
          letterSpacing: 'var(--ls-tight)',
          color: 'var(--text-strong)',
        }}
      >
        {children}
      </h2>
      {pin}
    </div>
  )
}

type CompareRow = [string, ReactNode, ReactNode, boolean | null]

function PlanCompare({ rows, pin }: { rows: CompareRow[]; pin?: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 18,
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--inner-top)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="git-compare" size={15} color="var(--text-muted)" />
        <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>计划 vs 实际</span>
        {pin}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div />
        <span
          style={{
            font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
            letterSpacing: 'var(--ls-label)',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
            textAlign: 'right',
          }}
        >
          目标
        </span>
        <span
          style={{
            font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
            letterSpacing: 'var(--ls-label)',
            textTransform: 'uppercase',
            color: 'var(--blue-300)',
            textAlign: 'right',
          }}
        >
          实际
        </span>
        {rows.map(([k, t, a, hit]) => (
          <Fragment key={k}>
            <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-muted)' }}>{k}</span>
            <span
              style={{
                font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)',
                color: 'var(--text-faint)',
                textAlign: 'right',
              }}
            >
              {t}
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 6,
                font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)',
                color: 'var(--text-strong)',
              }}
            >
              {a}
              {hit != null && (
                <Icon name={hit ? 'check' : 'minus'} size={13} color={hit ? 'var(--green-500)' : 'var(--amber-500)'} />
              )}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  )
}

function AIReview({ ai, pin }: { ai: ActivityVerdict; pin?: ReactNode }) {
  const tone =
    ({ positive: 'var(--green-500)', accent: 'var(--blue-400)', caution: 'var(--amber-500)' } as Record<string, string>)[
      ai.tone
    ] || 'var(--blue-400)'
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: 20,
        background: 'linear-gradient(150deg, rgba(59,91,255,0.10), rgba(124,77,255,0.08))',
        border: '1px solid rgba(124,77,255,0.3)',
        borderRadius: 'var(--r-lg)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'var(--grad-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="sparkles" size={15} color="#fff" />
        </span>
        <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>
          AI 单次训练点评
        </span>
        <Badge tone={ai.tone === 'positive' ? 'positive' : 'accent'} dot>
          {ai.verdict}
        </Badge>
        {pin}
      </div>
      <p
        style={{
          margin: 0,
          font: 'var(--fw-regular) var(--fs-sm)/1.6 var(--font-sans)',
          color: 'var(--text-body)',
          textWrap: 'pretty',
        }}
      >
        {ai.text}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ai.tags.map((t) => (
          <span
            key={t}
            style={{
              font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
              color: tone,
              background: 'var(--surface-card)',
              border: '1px solid var(--hairline)',
              padding: '6px 10px',
              borderRadius: 'var(--r-pill)',
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

function RoutePlaceholder({ pin }: { pin?: ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        height: 260,
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        background:
          'repeating-linear-gradient(45deg, var(--surface-card), var(--surface-card) 12px, var(--surface-base) 12px, var(--surface-base) 24px)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        <Icon name="map" size={26} color="var(--text-faint)" />
        <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-muted)' }}>
          路线地图占位
        </span>
        <span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>
          接入时渲染 GPS 轨迹 · 海拔剖面 · 公里标记
        </span>
        {pin}
      </div>
    </div>
  )
}

type HeaderChip = [string, ReactNode]

export interface ActivityDetailProps {
  data: ApexData
  act: Activity
  spec: boolean
  onToast: (msg: string) => void
}

export function ActivityDetail({ data, act, onToast }: ActivityDetailProps) {
  const detail: Partial<ActivityDetailData> = data.activityDetails[act.id] ?? {}
  const climb = isClimb(act.sport)
  const c = sportColor(act.sport)

  const chips: (HeaderChip | null)[] = [
    ['calendar', act.date],
    ['radio', detail.device || '设备同步'],
    climb
      ? ['map-pin', detail.gym]
      : ['thermometer', detail.weather ? `${detail.weather.temp}℃ · 湿度 ${detail.weather.hum}%` : '—'],
    !climb && detail.weather ? ['wind', detail.weather.wind] : null,
  ]
  const headerChips = chips.filter((x): x is HeaderChip => Boolean(x))

  const climbCompare: CompareRow[] = [
    ['训练', detail.target ? detail.target.grade ?? '—' : '—', detail.actual ? `极限 ${detail.actual.maxGrade}` : '—', detail.actual && detail.actual.maxGrade != null && detail.actual.maxGrade >= 'V6' ? false : null],
    [
      '负荷 (AU)',
      detail.target ? detail.target.load : '—',
      detail.actual ? detail.actual.load : act.load,
      detail.actual ? detail.actual.load <= (detail.target?.load || 999) : null,
    ],
  ]

  const runCompare: CompareRow[] = [
    ['配速', detail.target ? detail.target.pace ?? '—' : '—', detail.actual ? detail.actual.pace ?? '—' : '—', true],
    ['区间', detail.target ? detail.target.zone ?? '—' : '—', detail.actual ? detail.actual.zone ?? '—' : '—', true],
    ['负荷 (AU)', detail.target ? detail.target.load : '—', detail.actual ? detail.actual.load : act.load, true],
  ]

  //本次难度分布 — aggregate sends into a grade pyramid
  const sendPyramid: PyramidRow[] = (() => {
    const m = (detail.sends || []).reduce<Record<string, number>>((acc, s) => {
      acc[s.grade] = (acc[s.grade] || 0) + 1
      return acc
    }, {})
    const cols: Record<string, string> = { V6: 'var(--red-500)', V5: 'var(--amber-500)', V4: 'var(--cyan-500)' }
    return Object.keys(m)
      .sort()
      .reverse()
      .map((g) => ({ grade: g, sends: m[g], color: cols[g] || 'var(--blue-500)' }))
  })()

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
      {/* summary header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 20,
          padding: 24,
          marginBottom: 18,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-md), var(--inner-top)',
        }}
      >
        <span
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: `${c}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
          }}
        >
          <Icon name={sportIcon(act.sport)} size={26} color={c} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1
              style={{
                margin: 0,
                font: 'var(--fw-bold) var(--fs-h2)/1.05 var(--font-display)',
                letterSpacing: 'var(--ls-tight)',
                color: 'var(--text-strong)',
              }}
            >
              {act.name}
            </h1>
            <SpecPin
              n={1}
              title="活动详情入口"
              field="activityDetails[act.id] · activity.id"
              state="route: detail = {type:'activity', act}"
              event="看板/日历行点击 → onOpenActivity(act)"
              api="GET /api/activities/:id"
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {headerChips.map(([ic, t], i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 10px',
                  background: 'var(--surface-inset)',
                  borderRadius: 'var(--r-pill)',
                  font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)',
                  color: 'var(--text-muted)',
                }}
              >
                <Icon name={ic} size={12} color="var(--text-faint)" />
                {t}
              </span>
            ))}
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
          gap: 16,
          padding: 22,
          marginBottom: 22,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--inner-top)',
        }}
      >
        {climb ? (
          <Fragment>
            <Metric label="时长" value={detail.elapsed || act.dur} unit="" />
            <Metric label="完攀" value={detail.actual ? detail.actual.sends : '—'} unit="条" />
            <Metric label="最高难度" value={detail.actual ? detail.actual.maxGrade : '—'} unit="" />
            <Metric label="负荷" value={act.load} unit="AU" />
            <Metric label="平均心率" value={detail.avgHR || act.hr} unit="bpm" />
            <Metric label="峰值心率" value={detail.peakHR || '—'} unit="bpm" />
          </Fragment>
        ) : (
          <Fragment>
            <Metric label="距离" value={act.dist} unit="" />
            <Metric label="移动时间" value={detail.moving || act.dur} unit="" />
            <Metric
              label="平均配速"
              value={detail.actual && detail.actual.pace ? detail.actual.pace.replace(' /km', '') : '—'}
              unit="/km"
            />
            <Metric label="平均心率" value={act.hr} unit="bpm" />
            <Metric label="负荷 (TSS)" value={act.load} unit="AU" />
            <Metric label="爬升" value={act.name.includes('爬升') || act.sport === '登山' ? '1240' : '86'} unit="m" />
          </Fragment>
        )}
      </div>

      {/* plan compare */}
      <div style={{ marginBottom: 22 }}>
        {climb ? (
          <PlanCompare
            pin={
              <SpecPin
                n={2}
                title="计划对比"
                field="detail.target ↔ detail.actual"
                state="linked: 关联到日历计划课程"
                event="无 · 由关联关系派生"
                api="GET /api/plan/sessions/:date"
              />
            }
            rows={climbCompare}
          />
        ) : (
          <PlanCompare
            pin={
              <SpecPin
                n={2}
                title="计划对比"
                field="detail.target ↔ detail.actual"
                state="linked: 关联到日历计划课程"
                event="无 · 由关联关系派生"
                api="GET /api/plan/sessions/:date"
              />
            }
            rows={runCompare}
          />
        )}
      </div>

      {/* time series */}
      {climb ? (
        <div style={{ marginBottom: 22 }}>
          <SectionTitle
            icon="activity"
            pin={
              <SpecPin
                n={3}
                title="心率时间轴"
                field="series.hr[] (设备逐秒采样)"
                state="同步自连接器"
                event="hover 显示时刻心率"
                api="GET /api/activities/:id/streams?type=hr"
              />
            }
          >
            心率曲线
          </SectionTitle>
          <Card
            title="心率 (整段)"
            action={
              <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: 'var(--red-400)' }}>
                峰值 {detail.peakHR || '—'} bpm
              </span>
            }
          >
            <SingleHR pts={genClimbHR(act, detail)} />
          </Card>
        </div>
      ) : (
        <div style={{ marginBottom: 22 }}>
          <SectionTitle
            icon="line-chart"
            pin={
              <SpecPin
                n={3}
                title="多曲线时间轴"
                field="series.pace[] · series.hr[] · series.elev[]"
                state="同步自连接器 · 按距离重采样"
                event="hover 联动游标 · 图例可切换曲线"
                api="GET /api/activities/:id/streams"
              />
            }
          >
            配速 · 心率 · 海拔
          </SectionTitle>
          <Card
            title="数据曲线"
            action={
              <div style={{ display: 'flex', gap: 14 }}>
                {(
                  [
                    ['配速', 'var(--blue-500)'],
                    ['心率', 'var(--red-500)'],
                    ['海拔', 'var(--ink-500)'],
                  ] as const
                ).map(([l, col]) => (
                  <span
                    key={l}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span style={{ width: 12, height: 2, background: col }} />
                    {l}
                  </span>
                ))}
              </div>
            }
          >
            <TripleChart pts={genRun(act).pts} />
          </Card>
        </div>
      )}

      {/* HR zones + drift */}
      {!climb && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16, marginBottom: 22 }}>
          <Card
            title="心率区间分布"
            action={
              <SpecPin
                n={4}
                title="区间分布"
                field="series.hr → zones[] (按用户 HR 阈值分桶)"
                state="阈值来自设置中心 · 心率区间"
                event="无"
                api="计算自 streams + settings.hrZones"
              />
            }
          >
            <HRZoneBar zones={genRun(act).zones} />
          </Card>
          <Card
            title="心率漂移 (HR Drift)"
            action={
              <SpecPin
                n={5}
                title="HR 漂移"
                field="detail.hrDrift"
                state="派生指标"
                event="点击查看定义"
                api="(后半段HR/前半段HR − 1)"
              />
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span
                  style={{
                    font: 'var(--fw-bold) var(--fs-display-lg)/1 var(--font-display)',
                    color: detail.hrDrift != null && detail.hrDrift <= 5 ? 'var(--green-400)' : 'var(--amber-400)',
                  }}
                >
                  {detail.hrDrift || '—'}
                </span>
                <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-faint)' }}>%</span>
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 'var(--r-pill)',
                  background: 'var(--surface-inset)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', left: 0, width: '50%', top: 0, bottom: 0, background: 'rgba(24,201,140,0.25)' }} />
                <div
                  style={{
                    position: 'absolute',
                    left: `${Math.min(100, ((detail.hrDrift || 0) / 12) * 100)}%`,
                    top: -2,
                    bottom: -2,
                    width: 3,
                    background: detail.hrDrift != null && detail.hrDrift <= 5 ? 'var(--green-400)' : 'var(--amber-400)',
                    borderRadius: 2,
                  }}
                />
              </div>
              <span style={{ font: 'var(--fw-regular) var(--fs-xs)/1.5 var(--font-sans)', color: 'var(--text-faint)' }}>
                &lt; 5% 表示有氧耐受良好，配速可持续；&gt; 8% 提示脱水或强度偏高。
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* splits (run) / sends (climb) */}
      {climb ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1fr', gap: 16, marginBottom: 22 }}>
          <div>
            <SectionTitle
              icon="list-checks"
              pin={
                <SpecPin
                  n={6}
                  title="完攀记录"
                  field="detail.sends[] {grade,line,attempts,status,style}"
                  state="手动录入 / 8a.nu 同步"
                  event="行可编辑 · 状态 flash/send/project"
                  api="GET /api/activities/:id/sends"
                />
              }
            >
              完攀记录
            </SectionTitle>
            <Card padding="none">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '64px 1.4fr 0.7fr 0.9fr 1fr',
                  gap: 12,
                  padding: '12px 18px',
                  borderBottom: '1px solid var(--hairline)',
                }}
              >
                {['难度', '线路', '尝试', '状态', '风格'].map((h) => (
                  <span
                    key={h}
                    style={{
                      font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
                      letterSpacing: 'var(--ls-label)',
                      textTransform: 'uppercase',
                      color: 'var(--text-faint)',
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
              {(detail.sends || []).map((s, i) => {
                const st = (
                  {
                    flash: ['闪攀', 'var(--green-500)'],
                    send: ['完攀', 'var(--blue-400)'],
                    project: ['项目', 'var(--amber-500)'],
                  } as Record<string, [string, string]>
                )[s.status]
                return (
                  <div
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '64px 1.4fr 0.7fr 0.9fr 1fr',
                      gap: 12,
                      alignItems: 'center',
                      padding: '13px 18px',
                      borderTop: i ? '1px solid var(--hairline)' : 'none',
                    }}
                  >
                    <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-strong)' }}>
                      {s.grade}
                    </span>
                    <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-body)' }}>
                      {s.line}
                    </span>
                    <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-muted)' }}>
                      {s.attempts}
                    </span>
                    <span style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', color: st[1] }}>{st[0]}</span>
                    <span style={{ font: 'var(--fw-regular) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>
                      {s.style}
                    </span>
                  </div>
                )
              })}
            </Card>
          </div>
          <div>
            <SectionTitle icon="bar-chart-3">本次难度分布</SectionTitle>
            <Card>
              <GradePyramid rows={sendPyramid} />
            </Card>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 22 }}>
          <SectionTitle
            icon="table-2"
            pin={
              <SpecPin
                n={6}
                title="分段 / 圈速"
                field="series → splits[] (按公里聚合) 或 laps[] (设备圈)"
                state="同步自连接器"
                event="点击行高亮曲线对应段"
                api="GET /api/activities/:id/laps"
              />
            }
          >
            分段 (Splits)
          </SectionTitle>
          <Card padding="none">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '64px 1fr 1fr 1fr 1fr',
                gap: 12,
                padding: '12px 20px',
                borderBottom: '1px solid var(--hairline)',
              }}
            >
              {['公里', '配速', '心率', '步频', '海拔±'].map((h) => (
                <span
                  key={h}
                  style={{
                    font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
                    letterSpacing: 'var(--ls-label)',
                    textTransform: 'uppercase',
                    color: 'var(--text-faint)',
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
            {genRun(act).splits.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '64px 1fr 1fr 1fr 1fr',
                  gap: 12,
                  alignItems: 'center',
                  padding: '12px 20px',
                  borderTop: i ? '1px solid var(--hairline)' : 'none',
                  background: s.partial ? 'var(--surface-base)' : 'transparent',
                }}
              >
                <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{s.k}</span>
                <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--blue-300)' }}>
                  {s.pace}
                </span>
                <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-body)' }}>{s.hr}</span>
                <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-muted)' }}>{s.cad}</span>
                <span
                  style={{
                    font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)',
                    color: s.elev >= 0 ? 'var(--text-muted)' : 'var(--text-faint)',
                  }}
                >
                  {s.elev > 0 ? '+' : ''}
                  {s.elev}m
                </span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* route placeholder (non-climb) */}
      {!climb && (
        <div style={{ marginBottom: 22 }}>
          <SectionTitle
            icon="map"
            pin={
              <SpecPin
                n={7}
                title="路线地图"
                field="series.latlng[] (GPS 轨迹)"
                state="占位 · 接入地图 SDK 渲染"
                event="缩放/平移 · 悬停里程点"
                api="Mapbox/高德 + GET /streams?type=latlng"
              />
            }
          >
            路线
          </SectionTitle>
          <RoutePlaceholder pin={null} />
        </div>
      )}

      {/* AI review */}
      {detail.ai && (
        <AIReview
          ai={detail.ai}
          pin={
            <SpecPin
              n={8}
              title="AI 单次点评"
              field="POST 上下文: 本次streams + 计划 + 近期负荷/HRV"
              state="按需生成 · 可缓存"
              event="生成中 loading · 可追问"
              api="POST /api/ai/session-review {activityId}"
            />
          }
        />
      )}
    </div>
  )
}
