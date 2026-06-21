import { useMemo, useState } from 'react'
import { Card, Badge, Button } from '../design-system'
import { Icon } from '../components/Icon'
import { SpecPin } from '../components/spec/Spec'
import type { ApexData, LibraryPlan } from '../lib/types'

const sportColor = (s: string): string =>
  ({
    跑步: 'var(--blue-500)',
    登山: 'var(--violet-500)',
    抱石: 'var(--cyan-500)',
    难度: 'var(--green-500)',
    徒步: 'var(--amber-500)',
    休息: 'var(--ink-500)',
  })[s] || 'var(--ink-500)'
const sportIcon = (s: string): string =>
  ({ 跑步: 'footprints', 登山: 'mountain', 抱石: 'grip', 难度: 'route', 徒步: 'tent-tree', 休息: 'moon' })[s] || 'circle'

const rng = (seed: number): (() => number) => {
  let x = seed
  return () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff
    return x / 0x7fffffff
  }
}

interface PlanDayCell {
  d: string
  t: string
  s: string
  load: number
}
interface PlanWeek {
  label: string
  phase: string
  deload: boolean
  load: number
  days: PlanDayCell[]
}

// synthesize weeks from plan meta with a periodized load curve (build → deload every 4th)
function buildWeeks(plan: LibraryPlan): PlanWeek[] {
  const n = plan.weeks
  const sports = plan.sports
  const hasRun = sports.includes('跑步')
  const hasClimb = sports.includes('抱石') || sports.includes('难度')
  const hasMtn = sports.includes('登山')
  const climbSport = sports.includes('抱石') ? '抱石' : '难度'
  const runHard = ['阈值间歇 6×1km', '节奏跑 8km', 'Yasso 800']
  const day = (d: string, t: string, s: string, load: number): PlanDayCell => ({ d, t, s, load })
  const phaseName = (i: number): string => {
    const isDeload = (i + 1) % 4 === 0
    if (isDeload) return '减载周'
    const p = i / n
    return p < 0.4 ? '积累' : p < 0.75 ? '强化' : '巅峰'
  }
  const weeks: PlanWeek[] = []
  for (let i = 0; i < n; i++) {
    // rng kept for parity with the prototype's deterministic seeding
    rng((plan.id.length + 1) * 131 + i * 17)
    const isDeload = (i + 1) % 4 === 0
    const mult = isDeload ? 0.6 : 0.82 + Math.min(0.5, i * 0.05)
    const days = [
      day('周一', hasRun ? runHard[i % 3] : '力量', '跑步', Math.round(92 * mult)),
      day('周二', hasClimb ? (i % 2 ? '指力板训练' : '抱石极限尝试') : '轻松有氧', climbSport, Math.round(76 * mult)),
      day('周三', '轻松有氧 Z2', '跑步', Math.round(46 * mult)),
      day('周四', '主动恢复 + 柔韧', '徒步', Math.round(28 * mult)),
      day('周五', hasClimb ? '耐力路线 4×4' : '节奏跑', hasClimb ? '难度' : '跑步', Math.round(56 * mult)),
      day('周六', hasMtn ? '长距离爬升' : '长距离慢跑', hasMtn ? '登山' : '跑步', Math.round((isDeload ? 80 : 132) * (isDeload ? 1 : 1))),
      day('周日', '完全休息', '休息', 0),
    ]
    const load = days.reduce((a, x) => a + x.load, 0)
    weeks.push({ label: `第 ${i + 1} 周`, phase: phaseName(i), deload: isDeload, load, days })
  }
  return weeks
}

function LoadBars({ weeks, active, onPick }: { weeks: PlanWeek[]; active: number; onPick: (i: number) => void }) {
  const max = Math.max(...weeks.map((w) => w.load))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130 }}>
      {weeks.map((w, i) => (
        <button
          key={i}
          onClick={() => onPick(i)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 7,
            height: '100%',
            justifyContent: 'flex-end',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <span style={{ font: 'var(--fw-bold) 10px/1 var(--font-mono)', color: i === active ? 'var(--text-strong)' : 'var(--text-faint)' }}>
            {w.load}
          </span>
          <div
            style={{
              width: '64%',
              height: `${(w.load / max) * 100}%`,
              borderRadius: 4,
              background: w.deload ? 'var(--amber-500)' : i === active ? 'var(--blue-400)' : 'var(--blue-700)',
              transition: 'background var(--dur-fast)',
              minHeight: 4,
            }}
          />
          <span
            style={{
              font: `var(--fw-${i === active ? 'bold' : 'medium'}) 10px/1 var(--font-sans)`,
              color: i === active ? 'var(--text-body)' : 'var(--text-faint)',
            }}
          >
            W{i + 1}
          </span>
        </button>
      ))}
    </div>
  )
}

function DayCell({ d }: { d: PlanDayCell }) {
  const rest = d.s === '休息'
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 9,
        padding: 12,
        minHeight: 130,
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-md)',
        boxShadow: 'var(--inner-top)',
      }}
    >
      <span style={{ font: 'var(--fw-bold) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-muted)' }}>{d.d}</span>
      {rest ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            color: 'var(--text-faint)',
          }}
        >
          <Icon name="moon" size={16} color="var(--ink-400)" />
          <span style={{ font: 'var(--fw-medium) 10px/1 var(--font-sans)' }}>休息</span>
        </div>
      ) : (
        <>
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: `${sportColor(d.s)}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={sportIcon(d.s)} size={13} color={sportColor(d.s)} />
          </span>
          <span style={{ font: 'var(--fw-semibold) 11px/1.35 var(--font-sans)', color: 'var(--text-body)', textWrap: 'pretty' }}>{d.t}</span>
          <span style={{ marginTop: 'auto', font: 'var(--fw-bold) 10px/1 var(--font-mono)', color: 'var(--text-strong)' }}>
            {d.load} <span style={{ color: 'var(--text-faint)', fontWeight: 500 }}>AU</span>
          </span>
        </>
      )}
    </div>
  )
}

interface MixEntry {
  s: string
  pct: number
}

export interface PlanDetailProps {
  data: ApexData
  plan: LibraryPlan
  onApply: () => void
}

export function PlanDetail({ plan, onApply }: PlanDetailProps) {
  const weeks = useMemo(() => buildWeeks(plan), [plan])
  const [wk, setWk] = useState(0)
  const week = weeks[wk]
  const mix: MixEntry[] = useMemo(() => {
    const m = weeks.reduce<Record<string, number>>((acc, w) => {
      w.days.forEach((d) => {
        if (d.s !== '休息') acc[d.s] = (acc[d.s] || 0) + d.load
      })
      return acc
    }, {})
    const tot = Object.values(m).reduce((a, b) => a + b, 0)
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .map(([s, v]) => ({ s, pct: Math.round((v / tot) * 100) }))
  }, [weeks])

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
      {/* header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 18,
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
            width: 52,
            height: 52,
            borderRadius: 13,
            background: 'var(--grad-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <Icon name="route" size={24} color="#fff" />
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
              {plan.name}
            </h1>
            {plan.source === 'AI' ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  font: 'var(--fw-semibold) 10px/1 var(--font-sans)',
                  color: 'var(--violet-300)',
                  background: 'rgba(124,77,255,0.16)',
                  padding: '5px 9px',
                  borderRadius: 'var(--r-pill)',
                }}
              >
                <Icon name="sparkles" size={11} color="var(--violet-300)" />
                AI 生成
              </span>
            ) : (
              <Badge tone="neutral">手动</Badge>
            )}
            <SpecPin
              n={1}
              title="计划详情入口"
              field="library.plans[i] · plan.id · weeks(派生)"
              state="route: detail = {type:'plan', plan}"
              event="训练库计划卡点击 → onOpenPlan(plan)"
              api="GET /api/plans/:id"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-muted)' }}>目标 · {plan.goal}</span>
            <span style={{ display: 'flex', gap: 4 }}>
              {plan.sports.map((s) => (
                <span
                  key={s}
                  title={s}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    background: `${sportColor(s)}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name={sportIcon(s)} size={12} color={sportColor(s)} />
                </span>
              ))}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 22 }}>
            {(
              [
                ['周期', `${plan.weeks} 周`],
                ['总负荷', `${plan.load} AU`],
                ['课程', `${plan.sessions} 节`],
              ] as const
            ).map(([l, v]) => (
              <div key={l} style={{ textAlign: 'right' }}>
                <div
                  style={{
                    font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
                    letterSpacing: 'var(--ls-label)',
                    textTransform: 'uppercase',
                    color: 'var(--text-faint)',
                  }}
                >
                  {l}
                </div>
                <div style={{ marginTop: 5, font: 'var(--fw-bold) var(--fs-h3)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" size="sm" iconLeft={<Icon name="copy" size={14} />}>
              复制
            </Button>
            <Button variant="gradient" size="sm" iconLeft={<Icon name="calendar-check" size={14} />} onClick={onApply}>
              应用到日历
            </Button>
          </div>
        </div>
      </div>

      {/* load progression */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1fr', gap: 16, marginBottom: 22 }}>
        <Card
          title="周负荷曲线"
          action={
            <SpecPin
              n={2}
              title="周期化曲线"
              field="weeks[].load (周期化生成)"
              state="减载周 = 每 4 周 · amber"
              event="点击柱 → 切换该周"
              api="计算自 plan + 模板负荷"
            />
          }
        >
          <LoadBars weeks={weeks} active={wk} onPick={setWk} />
          <div style={{ marginTop: 12, display: 'flex', gap: 16, paddingTop: 12, borderTop: '1px solid var(--hairline)' }}>
            {(
              [
                ['积累/强化', 'var(--blue-700)'],
                ['当前周', 'var(--blue-400)'],
                ['减载周', 'var(--amber-500)'],
              ] as const
            ).map(([l, c]) => (
              <span
                key={l}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)',
                  color: 'var(--text-faint)',
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                {l}
              </span>
            ))}
          </div>
        </Card>
        <Card
          title="项目构成"
          action={<SpecPin n={3} title="项目占比" field="Σ weeks[].days[].load by sport" state="—" event="无" api="—" />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mix.map((d) => (
              <div key={d.s} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name={sportIcon(d.s)} size={13} color={sportColor(d.s)} />
                  <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-body)' }}>{d.s}</span>
                  <span style={{ marginLeft: 'auto', font: 'var(--fw-bold) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-strong)' }}>
                    {d.pct}%
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 'var(--r-pill)', background: 'var(--surface-inset)', overflow: 'hidden' }}>
                  <div style={{ width: `${d.pct}%`, height: '100%', background: sportColor(d.s), borderRadius: 'var(--r-pill)' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* week detail */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <Icon name="calendar-range" size={16} color="var(--text-muted)" />
        <h2
          style={{
            margin: 0,
            font: 'var(--fw-bold) var(--fs-lg)/1 var(--font-display)',
            letterSpacing: 'var(--ls-tight)',
            color: 'var(--text-strong)',
          }}
        >
          周计划展开
        </h2>
        <SpecPin
          n={4}
          title="周/日结构"
          field="weeks[wk].days[7] {d,t,s,load}"
          state="可编辑 · 应用后写入日历"
          event="切换周 tab · 拖拽课程"
          api="GET /api/plans/:id/weeks/:n"
        />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {weeks.map((w, i) => (
            <button
              key={i}
              onClick={() => setWk(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 'var(--r-pill)',
                cursor: 'pointer',
                border: `1px solid ${i === wk ? 'var(--accent)' : 'var(--border-subtle)'}`,
                background: i === wk ? 'rgba(59,91,255,0.10)' : 'var(--surface-card)',
                font: `var(--fw-${i === wk ? 'bold' : 'medium'}) var(--fs-xs)/1 var(--font-sans)`,
                color: i === wk ? 'var(--text-strong)' : 'var(--text-muted)',
              }}
            >
              第 {i + 1} 周
              {w.deload && <span style={{ font: 'var(--fw-semibold) 9px/1 var(--font-sans)', color: 'var(--amber-400)' }}>减载</span>}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <Badge tone={week.deload ? 'caution' : 'accent'} dot>
          {week.phase}
        </Badge>
        <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-muted)' }}>
          本周负荷 <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>{week.load} AU</b>
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginBottom: 22 }}>
        {week.days.map((d, i) => (
          <DayCell key={i} d={d} />
        ))}
      </div>

      {/* AI rationale for AI plans */}
      {plan.source === 'AI' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
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
            <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>AI 编排说明</span>
            <SpecPin
              n={5}
              title="AI 计划生成"
              field="plan.aiContext (生成时的对话+历史)"
              state="保存自 AI 训练模块"
              event="可在 AI 训练继续调整"
              api="POST /api/ai/plan {goal, history}"
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
            本计划以「{plan.goal}」为目标，采用 3 周积累 + 1 周减载的周期化结构；跑步承担有氧主负荷，攀岩穿插于恢复充分的窗口，全程 ACWR
            控制在 0.8–1.3。减载周整体负荷下调约 40%，用于吸收前序刺激并保护伤病风险。
          </p>
        </div>
      )}
    </div>
  )
}
