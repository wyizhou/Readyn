// Readyn Personal — 指标深潜 Metric Detail (full-screen).
import { Card, Badge } from '../design-system'
import type { BadgeTone } from '../design-system'
import { Icon } from '../components/Icon'
import { SpecPin } from '../components/spec/Spec'
import type { ApexData, MetricId } from '../lib/types'

// deterministic pseudo-random from seed
function rng(seed: number): () => number {
  let x = seed
  return () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff
    return x / 0x7fffffff
  }
}

function synth(center: number, n: number, amp: number, seed: number): number[] {
  const r = rng(seed)
  const out: number[] = []
  let v = center
  for (let i = 0; i < n; i++) {
    v += (center - v) * 0.18 + (r() - 0.5) * amp
    out.push(v)
  }
  return out
}

function seriesFor(id: MetricId, data: ApexData): number[] {
  if (id === 'hrv') return data.hrv.map((d) => d.v)
  if (id === 'ctl') return data.pmc.map((d) => d.ctl)
  if (id === 'tsb') return data.pmc.map((d) => d.tsb)
  if (id === 'acwr') return synth(1.18, 42, 0.06, 11).map((v) => +v.toFixed(2))
  if (id === 'rhr') return synth(47, 28, 1.6, 23).map((v) => Math.round(v))
  if (id === 'sleep') return synth(82, 28, 6, 31).map((v) => Math.round(v))
  return synth(50, 28, 5, 7)
}

interface TrendChartProps {
  series: number[]
  color: string
  width?: number
  height?: number
}

function TrendChart({ series, color, width = 1000, height = 240 }: TrendChartProps) {
  const pad = { t: 18, r: 40, b: 22, l: 14 }
  const w = width - pad.l - pad.r
  const h = height - pad.t - pad.b
  const max = Math.max(...series)
  const min = Math.min(...series)
  const range = max - min || 1
  const x = (i: number) => pad.l + (i / (series.length - 1)) * w
  const y = (v: number) => pad.t + h - ((v - min) / range) * h
  const line = series.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = `${line} L${x(series.length - 1)},${pad.t + h} L${x(0)},${pad.t + h} Z`
  const avg = series.reduce((a, b) => a + b, 0) / series.length
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="mtg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.26" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((g, i) => {
        const v = min + range * g
        return (
          <g key={i}>
            <line x1={pad.l} x2={width - pad.r} y1={pad.t + h - g * h} y2={pad.t + h - g * h} stroke="var(--hairline)" />
            <text
              x={width - pad.r + 6}
              y={pad.t + h - g * h + 3}
              fontFamily="var(--font-mono)"
              fontSize="10"
              fill="var(--text-faint)"
            >
              {+v.toFixed(range < 3 ? 2 : 0)}
            </text>
          </g>
        )
      })}
      <line
        x1={pad.l}
        x2={width - pad.r}
        y1={y(avg)}
        y2={y(avg)}
        stroke="var(--text-faint)"
        strokeWidth="1"
        strokeDasharray="4 3"
        opacity="0.6"
      />
      <path d={area} fill="url(#mtg)" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      <circle
        cx={x(series.length - 1)}
        cy={y(series[series.length - 1])}
        r="4"
        fill={color}
        stroke="var(--surface-card)"
        strokeWidth="1.5"
      />
    </svg>
  )
}

const toneMap: Record<string, BadgeTone> = { positive: 'positive', caution: 'caution', critical: 'critical' }

export interface MetricDetailProps {
  data: ApexData
  id: MetricId
  onOpenMetric: (id: MetricId) => void
}

export function MetricDetail({ data, id, onOpenMetric }: MetricDetailProps) {
  const m = data.metrics[id]
  if (!m) return null
  const series = seriesFor(id, data)

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
      {/* header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          padding: 24,
          marginBottom: 18,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-md), var(--inner-top)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
              letterSpacing: 'var(--ls-label)',
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
            }}
          >
            {m.name}
            <SpecPin
              n={1}
              title="指标深潜入口"
              field={`metrics.${id}.value · series`}
              state="route: detail = {type:'metric', id}"
              event="看板指标块点击 → onOpenMetric(id)"
              api="GET /api/metrics/:id?range=42d"
            />
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span
              style={{
                font: 'var(--fw-black) var(--fs-display-lg)/0.9 var(--font-display)',
                letterSpacing: 'var(--ls-tight)',
                color: 'var(--text-strong)',
              }}
            >
              {m.value}
            </span>
            <span style={{ font: 'var(--fw-medium) var(--fs-lg)/1 var(--font-mono)', color: 'var(--text-faint)' }}>
              {m.unit}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge tone={toneMap[m.statusTone] || 'accent'} dot>
              {m.status}
            </Badge>
            <span
              style={{
                font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-mono)',
                color:
                  m.deltaTone === 'pos'
                    ? 'var(--green-400)'
                    : m.deltaTone === 'neg'
                      ? 'var(--amber-400)'
                      : 'var(--text-faint)',
              }}
            >
              {m.delta}
            </span>
          </div>
        </div>
        <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--hairline)' }} />
        <p
          style={{
            flex: 1,
            margin: 0,
            font: 'var(--fw-regular) var(--fs-sm)/1.6 var(--font-sans)',
            color: 'var(--text-muted)',
            textWrap: 'pretty',
          }}
        >
          {m.definition}
        </p>
      </div>

      {/* trend + interpretation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1fr', gap: 16, marginBottom: 22 }}>
        <Card
          title="趋势"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <SpecPin
                n={2}
                title="趋势序列"
                field={`series[] (${id === 'hrv' ? '28d' : id === 'ctl' || id === 'acwr' || id === 'tsb' ? '42d' : '28d'})`}
                state="同步/计算自连接器数据"
                event="切换时间范围 7/28/赛季"
                api="GET /api/metrics/:id/series"
              />
              <div style={{ display: 'flex', gap: 6 }}>
                {['7d', '28d', '赛季'].map((r, i) => (
                  <span
                    key={r}
                    style={{
                      font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
                      color: i === 1 ? 'var(--text-strong)' : 'var(--text-faint)',
                      background: i === 1 ? 'var(--surface-raised)' : 'transparent',
                      padding: '5px 9px',
                      borderRadius: 'var(--r-pill)',
                    }}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          }
        >
          <TrendChart series={series} color={m.color} />
        </Card>

        <Card
          title="解读区间"
          action={
            <SpecPin
              n={3}
              title="区间分级"
              field={`metrics.${id}.bands[]`}
              state="active 由 value 落点判定"
              event="无"
              api="阈值可在设置中心覆盖"
            />
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {m.bands.map((b) => (
              <div
                key={b.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 'var(--r-md)',
                  background: b.active ? 'var(--surface-raised)' : 'var(--surface-inset)',
                  border: `1px solid ${b.active ? b.color : 'transparent'}`,
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: 3, background: b.color, flex: 'none' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span
                    style={{
                      font: `var(--fw-${b.active ? 'bold' : 'semibold'}) var(--fs-sm)/1 var(--font-sans)`,
                      color: b.active ? 'var(--text-strong)' : 'var(--text-muted)',
                    }}
                  >
                    {b.label}
                  </span>
                  <span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-mono)', color: 'var(--text-faint)' }}>
                    {b.range}
                  </span>
                </div>
                {b.active && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
                      color: b.color,
                    }}
                  >
                    当前
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* formula + factors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16, marginBottom: 22 }}>
        <Card
          title="计算方式"
          action={
            <SpecPin
              n={4}
              title="计算公式"
              field="派生指标 · 服务端计算"
              state="—"
              event="无"
              api="后端聚合 streams/负荷 后写入"
            />
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                padding: '16px 18px',
                background: 'var(--bg-app)',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--r-md)',
                font: 'var(--fw-medium) var(--fs-sm)/1.5 var(--font-mono)',
                color: 'var(--blue-300)',
                textAlign: 'center',
                overflowX: 'auto',
              }}
            >
              {m.formula}
            </div>
            <span style={{ font: 'var(--fw-regular) var(--fs-xs)/1.5 var(--font-sans)', color: 'var(--text-faint)' }}>
              该指标由后端依据连接器同步的原始数据统一计算，确保不同设备来源口径一致。
            </span>
          </div>
        </Card>

        <Card
          title="影响因素"
          action={
            <SpecPin
              n={5}
              title="关联因素"
              field={`metrics.${id}.factors[]`}
              state="正向/负向贡献"
              event="点击因素跳转其指标"
              api="相关性分析 · 后端"
            />
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {m.factors.map((f) => (
              <div
                key={f.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: 'var(--surface-inset)',
                  borderRadius: 'var(--r-md)',
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: f.impact === 'pos' ? 'rgba(24,201,140,0.14)' : 'rgba(255,176,32,0.14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 'none',
                  }}
                >
                  <Icon
                    name={f.impact === 'pos' ? 'trending-up' : 'trending-down'}
                    size={14}
                    color={f.impact === 'pos' ? 'var(--green-500)' : 'var(--amber-500)'}
                  />
                </span>
                <span style={{ flex: 1, font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-body)' }}>
                  {f.label}
                </span>
                <span style={{ font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-muted)' }}>
                  {f.v}
                </span>
                <span
                  style={{
                    font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
                    color: f.impact === 'pos' ? 'var(--green-400)' : 'var(--amber-400)',
                    width: 32,
                    textAlign: 'right',
                  }}
                >
                  {f.impact === 'pos' ? '正向' : '负向'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI interpretation */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          padding: 20,
          marginBottom: 22,
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
          <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>AI 解读</span>
          <SpecPin
            n={6}
            title="AI 指标解读"
            field="POST 上下文: 该指标序列 + 关联指标 + 个人资料"
            state="按需生成 · 可缓存"
            event="可追问 → AI 对话"
            api="POST /api/ai/metric-insight {metricId}"
          />
        </div>
        <p
          style={{
            margin: 0,
            font: 'var(--fw-regular) var(--fs-sm)/1.6 var(--font-sans)',
            color: 'var(--text-body)',
            textWrap: 'pretty',
          }}
        >
          {m.ai.text}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {m.ai.tags.map((t) => (
            <span
              key={t}
              style={{
                font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
                color: m.color,
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

      {/* related metrics */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span
          style={{
            font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
            letterSpacing: 'var(--ls-label)',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
          }}
        >
          相关指标
        </span>
        {m.related.map((rid) => {
          const mid = rid as MetricId
          const rm = data.metrics[mid]
          return (
            <button
              key={rid}
              onClick={() => onOpenMetric(mid)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 13px',
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-pill)',
                cursor: 'pointer',
                transition: 'all var(--dur-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <span style={{ width: 7, height: 7, borderRadius: 2, background: rm.color }} />
              <span style={{ font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-body)' }}>
                {rm.short}
              </span>
              <span style={{ font: 'var(--fw-bold) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-strong)' }}>
                {rm.value}
                {rm.unit}
              </span>
              <Icon name="arrow-right" size={12} color="var(--text-faint)" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
