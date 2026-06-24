import { useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { Card, Badge, Button } from '../design-system'
import { Icon } from '../components/Icon'
import { ChartXAxis } from '../components/charts/Charts'
import type { Profile, WeightEntry } from '../lib/types'
import { bmi as bmiOf } from '../lib/format'

const bmiCat = (b: number): { label: string; c: string } =>
  b < 18.5
    ? { label: '偏瘦', c: 'var(--amber-400)' }
    : b < 24
      ? { label: '正常', c: 'var(--green-500)' }
      : b < 28
        ? { label: '偏重', c: 'var(--amber-500)' }
        : { label: '偏高', c: 'var(--red-500)' }

function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span
        style={{
          font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
          letterSpacing: 'var(--ls-label)',
          textTransform: 'uppercase',
          color: 'var(--text-faint)',
        }}
      >
        {label}
      </span>
      {children}
    </div>
  )
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        height: 40,
        padding: '0 12px',
        background: 'var(--surface-inset)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-md)',
        color: 'var(--text-body)',
        font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)',
        outline: 'none',
        width: '100%',
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
    />
  )
}

interface WeightChartProps {
  entries: WeightEntry[]
  target: number
  width?: number
  height?: number
}

function WeightChart({ entries, target, width = 900, height = 220 }: WeightChartProps) {
  const pad = { t: 18, r: 16, b: 26, l: 36 }
  const w = width - pad.l - pad.r
  const h = height - pad.t - pad.b
  const vals = entries.map((e) => e.kg).concat([target])
  const max = Math.max(...vals) + 0.6
  const min = Math.min(...vals) - 0.6
  const range = max - min || 1
  const x = (i: number) => pad.l + (entries.length === 1 ? w / 2 : (i / (entries.length - 1)) * w)
  const y = (v: number) => pad.t + h - ((v - min) / range) * h
  const line = entries.map((e, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(e.kg).toFixed(1)}`).join(' ')
  const area = `${line} L${x(entries.length - 1)},${pad.t + h} L${x(0)},${pad.t + h} Z`
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--blue-500)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--blue-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((g, i) => {
        const v = min + range * g
        const yy = y(v)
        return (
          <g key={i}>
            <line x1={pad.l} x2={width - pad.r} y1={yy} y2={yy} stroke="var(--hairline)" />
            <text x={8} y={yy + 3} fontFamily="var(--font-mono)" fontSize="10" fill="var(--text-faint)">
              {v.toFixed(1)}
            </text>
          </g>
        )
      })}
      <line
        x1={pad.l}
        x2={width - pad.r}
        y1={y(target)}
        y2={y(target)}
        stroke="var(--green-500)"
        strokeWidth="1.5"
        strokeDasharray="5 4"
      />
      <text
        x={width - pad.r}
        y={y(target) - 6}
        textAnchor="end"
        fontFamily="var(--font-mono)"
        fontSize="10"
        fill="var(--green-400)"
      >
        目标 {target}kg
      </text>
      <path d={area} fill="url(#wgrad)" />
      <path
        d={line}
        fill="none"
        stroke="var(--blue-500)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {entries.map((e, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(e.kg)}
          r={i === entries.length - 1 ? 4 : 2.5}
          fill="var(--blue-400)"
          stroke="var(--surface-card)"
          strokeWidth="1.5"
        />
      ))}
      <ChartXAxis
        labels={
          entries.length <= 1
            ? entries.map((e) => e.date.slice(5))
            : [entries[0].date.slice(5), entries[Math.floor((entries.length - 1) / 2)].date.slice(5), entries[entries.length - 1].date.slice(5)]
        }
        width={width}
        y={height - 8}
        padL={pad.l}
        padR={pad.r}
      />
    </svg>
  )
}

export interface WeightModuleProps {
  weightLog: WeightEntry[]
  profile: Profile
  onAdd: (entry: WeightEntry) => void
  today: string
}

interface Tile {
  l: string
  v: string
  u: string
  d: string
  c: string
}

export function WeightModule({ weightLog, profile, onAdd, today }: WeightModuleProps) {
  const cur = weightLog[0]
  const prev = weightLog[1]
  const curKg = cur ? cur.kg : 0
  const delta = prev && cur ? +(cur.kg - prev.kg).toFixed(1) : 0
  const toGoal = cur ? +(cur.kg - profile.targetWeight).toFixed(1) : 0
  const b = cur ? bmiOf(curKg, profile.height) : 0
  const cat = bmiCat(b)
  const [date, setDate] = useState(today)
  const [kg, setKg] = useState('')
  const [note, setNote] = useState('')
  const submit = () => {
    const v = parseFloat(kg)
    if (!v) return
    onAdd({ date, kg: v, note: note || undefined })
    setKg('')
    setNote('')
  }

  const tiles: Tile[] = [
    {
      l: '当前体重',
      v: cur ? `${cur.kg}` : '—',
      u: 'kg',
      d: cur ? `${delta > 0 ? '+' : ''}${delta} 较上次` : '暂无记录',
      c: delta <= 0 ? 'var(--green-400)' : 'var(--amber-400)',
    },
    { l: 'BMI', v: b ? `${b}` : '—', u: cat.label, d: '正常区间 18.5–24', c: cat.c },
    {
      l: '距目标',
      v: `${toGoal > 0 ? toGoal : 0}`,
      u: 'kg',
      d: !cur ? '设定目标体重' : toGoal > 0 ? `目标 ${profile.targetWeight}kg` : '已达成',
      c: toGoal > 0 ? 'var(--blue-300)' : 'var(--green-400)',
    },
    {
      l: '体脂率',
      v: cur?.fat ? `${cur.fat}` : '—',
      u: '%',
      d: cur?.fat ? '最近一次' : '暂无记录',
      c: 'var(--violet-300)',
    },
  ]

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 18 }}>
        {tiles.map((tile) => (
          <div
            key={tile.l}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 9,
              padding: 18,
              background: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--inner-top)',
            }}
          >
            <span
              style={{
                font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
                letterSpacing: 'var(--ls-label)',
                textTransform: 'uppercase',
                color: 'var(--text-faint)',
              }}
            >
              {tile.l}
            </span>
            <div style={{ font: 'var(--fw-bold) var(--fs-h1)/1 var(--font-mono)', color: 'var(--text-strong)' }}>
              {tile.v}
              <span style={{ fontSize: 13, color: 'var(--text-faint)', marginLeft: 4 }}>{tile.u}</span>
            </div>
            <span style={{ font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-mono)', color: tile.c }}>{tile.d}</span>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 18 }}>
        <Card
          title="体重趋势"
          action={
            <span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>
              近 8 周 · 绿线为目标体重
            </span>
          }
        >
          <WeightChart entries={[...weightLog].reverse()} target={profile.targetWeight} />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16 }}>
        {/* add form */}
        <Card title="记录新体重">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="日期">
              <TextInput type="text" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="体重 (kg)">
              <input
                type="number"
                step="0.1"
                value={kg}
                onChange={(e) => setKg(e.target.value)}
                placeholder="例如 65.6"
                style={{
                  height: 40,
                  padding: '0 12px',
                  background: 'var(--surface-inset)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--r-md)',
                  color: 'var(--text-body)',
                  font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)',
                  outline: 'none',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit()
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              />
            </Field>
            <Field label="备注 (可选)">
              <TextInput
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="晨起空腹 / 训练后…"
              />
            </Field>
            <Button variant="primary" fullWidth iconLeft={<Icon name="plus" size={16} />} onClick={submit}>
              记录体重
            </Button>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                font: 'var(--fw-medium) var(--fs-xs)/1.4 var(--font-sans)',
                color: 'var(--text-faint)',
              }}
            >
              <Icon name="link" size={13} color="var(--text-faint)" />
              录入后会同步更新「个人资料」中的当前体重与 BMI。
            </div>
          </div>
        </Card>

        {/* history */}
        <Card title="历史记录" action={<Badge tone="neutral">{weightLog.length} 条</Badge>} padding="none">
          <div style={{ maxHeight: 360, overflow: 'auto' }}>
            {weightLog.map((e, i) => {
              const older = weightLog[i + 1]
              const ch = older ? +(e.kg - older.kg).toFixed(1) : null
              return (
                <div
                  key={e.date + i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 0.8fr 0.8fr 1.4fr',
                    gap: 12,
                    alignItems: 'center',
                    padding: '13px 20px',
                    borderTop: i ? '1px solid var(--hairline)' : 'none',
                  }}
                >
                  <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-body)' }}>
                    {e.date}
                  </span>
                  <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-strong)' }}>
                    {e.kg}{' '}
                    <span style={{ fontSize: 10, color: 'var(--text-faint)', fontWeight: 500 }}>kg</span>
                  </span>
                  <span
                    style={{
                      font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-mono)',
                      color:
                        ch == null
                          ? 'var(--text-faint)'
                          : ch < 0
                            ? 'var(--green-400)'
                            : ch > 0
                              ? 'var(--amber-400)'
                              : 'var(--text-faint)',
                    }}
                  >
                    {ch == null ? '—' : `${ch > 0 ? '+' : ''}${ch}`}
                  </span>
                  <span
                    style={{
                      font: 'var(--fw-regular) var(--fs-xs)/1.3 var(--font-sans)',
                      color: 'var(--text-faint)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {e.note || (e.fat ? `体脂 ${e.fat}%` : '手动录入')}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
