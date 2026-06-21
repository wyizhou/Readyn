import type { ReactNode } from 'react'
import { Card, StatCard, Badge, ProgressRing, Sparkline } from '../design-system'
import { Icon } from '../components/Icon'
import { PMCChart, HRVChart, SleepBars, HRZoneBar, Radar, Heatmap, GradePyramid, Donut } from '../components/charts/Charts'
import type { Activity, ApexData, Insight, MetricId } from '../lib/types'

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

function SectionTitle({ icon, children, note }: { icon: string; children: ReactNode; note?: ReactNode }) {
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
      {note && <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-faint)' }}>{note}</span>}
    </div>
  )
}

const INSIGHT_TONES: Record<string, { c: string; bg: string; bd: string }> = {
  caution: { c: 'var(--amber-500)', bg: 'rgba(255,176,32,0.10)', bd: 'rgba(255,176,32,0.32)' },
  positive: { c: 'var(--green-500)', bg: 'rgba(24,201,140,0.10)', bd: 'rgba(24,201,140,0.30)' },
  accent: { c: 'var(--blue-400)', bg: 'rgba(59,91,255,0.10)', bd: 'rgba(59,91,255,0.32)' },
}

function InsightCard({ ins, onAsk }: { ins: Insight; onAsk: (ins: Insight) => void }) {
  const tones = INSIGHT_TONES[ins.tone] ?? INSIGHT_TONES.accent
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 18,
        background: 'var(--surface-card)',
        border: `1px solid ${tones.bd}`,
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--inner-top)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: tones.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
          }}
        >
          <Icon name={ins.icon} size={16} color={tones.c} />
        </span>
        <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1.2 var(--font-sans)', color: 'var(--text-strong)' }}>{ins.title}</span>
        <span
          style={{
            marginLeft: 'auto',
            font: 'var(--fw-semibold) 10px/1 var(--font-sans)',
            letterSpacing: 'var(--ls-wide)',
            textTransform: 'uppercase',
            color: tones.c,
            background: tones.bg,
            padding: '4px 8px',
            borderRadius: 'var(--r-pill)',
            whiteSpace: 'nowrap',
          }}
        >
          {ins.tag}
        </span>
      </div>
      <p
        style={{
          margin: 0,
          font: 'var(--fw-regular) var(--fs-sm)/1.55 var(--font-sans)',
          color: 'var(--text-muted)',
          textWrap: 'pretty',
        }}
      >
        {ins.body}
      </p>
      <button
        onClick={() => onAsk(ins)}
        style={{
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 2,
          padding: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-sans)',
          color: tones.c,
        }}
      >
        向 AI 追问 <Icon name="arrow-right" size={13} color={tones.c} />
      </button>
    </div>
  )
}

export interface DashboardProps {
  data: ApexData
  range: string
  setRange: (r: string) => void
  onOpenAI: () => void
  onAskAI: (ins: Insight) => void
  onOpenActivity: (a: Activity) => void
  onOpenMetric: (id: MetricId) => void
}

interface HeroStat {
  l: string
  v: string | number
  u: string
  d: string
  dc: string
  mid: MetricId
}

export function Dashboard({ data, onAskAI, onOpenActivity, onOpenMetric }: DashboardProps) {
  const t = data.today
  const rColor = t.readiness >= 75 ? 'var(--green-500)' : t.readiness >= 50 ? 'var(--amber-500)' : 'var(--red-500)'
  const hero: HeroStat[] = [
    { l: 'HRV', v: t.hrv, u: 'ms', d: `${t.hrvDelta > 0 ? '+' : ''}${t.hrvDelta}`, dc: t.hrvDelta >= 0 ? 'var(--green-400)' : 'var(--red-400)', mid: 'hrv' },
    { l: '静息心率', v: t.rhr, u: 'bpm', d: `${t.rhrDelta} vs 均`, dc: 'var(--green-400)', mid: 'rhr' },
    { l: '睡眠', v: t.sleep, u: 'hrs', d: `评分 ${t.sleepScore}`, dc: 'var(--text-faint)', mid: 'sleep' },
    { l: 'ACWR', v: t.acwr.toFixed(2), u: '', d: t.acwr > 1.3 ? '偏高' : '区间内', dc: t.acwr > 1.3 ? 'var(--amber-400)' : 'var(--green-400)', mid: 'acwr' },
    { l: '体能 CTL', v: t.ctl.toFixed(0), u: '', d: `形态 ${t.tsb > 0 ? '+' : ''}${t.tsb.toFixed(0)}`, dc: t.tsb >= 0 ? 'var(--green-400)' : 'var(--amber-400)', mid: 'ctl' },
  ]

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
      {/* Hero readiness strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          padding: 24,
          marginBottom: 22,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-md), var(--inner-top)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 'none' }}>
          <ProgressRing value={t.readiness} sublabel="就绪度" size={116} stroke={10} color={rColor} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>今日状态</Label>
            <span
              style={{
                font: 'var(--fw-bold) var(--fs-h2)/1 var(--font-display)',
                letterSpacing: 'var(--ls-tight)',
                color: 'var(--text-strong)',
              }}
            >
              状态均衡
            </span>
            <Badge tone="positive" dot>
              可承接强度
            </Badge>
          </div>
        </div>
        <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--hairline)' }} />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20 }}>
          {hero.map((s) => (
            <button
              key={s.l}
              onClick={() => onOpenMetric(s.mid)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                alignItems: 'flex-start',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: '8px 10px',
                margin: '-8px -10px',
                borderRadius: 'var(--r-md)',
                cursor: 'pointer',
                transition: 'background var(--dur-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Label>{s.l}</Label>
                <Icon name="chevron-right" size={12} color="var(--text-faint)" />
              </span>
              <div style={{ font: 'var(--fw-bold) var(--fs-h2)/1 var(--font-mono)', color: 'var(--text-strong)' }}>
                {s.v}
                <span style={{ fontSize: 12, color: 'var(--text-faint)', marginLeft: 3 }}>{s.u}</span>
              </div>
              <span style={{ font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-mono)', color: s.dc }}>{s.d}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI insights */}
      <SectionTitle icon="sparkles" note="基于近 14 天数据自动生成">
        AI 洞察
      </SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 26 }}>
        {data.insights.map((ins) => (
          <InsightCard key={ins.id} ins={ins} onAsk={onAskAI} />
        ))}
      </div>

      {/* Performance management chart */}
      <SectionTitle icon="activity" note="CTL 体能 · ATL 疲劳 · TSB 状态">
        体能趋势
      </SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1.85fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card
          title="近 6 周 · 体能 / 疲劳 / 状态"
          action={
            <div style={{ display: 'flex', gap: 16 }}>
              {(
                [
                  ['CTL 体能', 'var(--blue-500)', 'solid'],
                  ['ATL 疲劳', 'var(--violet-500)', 'dash'],
                  ['TSB 状态', 'var(--green-500)', 'solid'],
                ] as const
              ).map(([l, c, st]) => (
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
                  <span
                    style={{
                      width: 14,
                      height: st === 'dash' ? 0 : 2,
                      borderTop: st === 'dash' ? `2px dashed ${c}` : 'none',
                      background: st === 'dash' ? 'none' : c,
                    }}
                  />
                  {l}
                </span>
              ))}
            </div>
          }
        >
          <PMCChart data={data.pmc} />
        </Card>
        <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', gap: 16 }}>
          <StatCard label="本周负荷" value={t.weekLoad} unit="AU" delta={`+${t.weekLoadDelta}%`} trend="up">
            <Sparkline data={data.pmc.slice(-7).map((d) => d.load)} />
          </StatCard>
          <StatCard
            label="疲劳 ATL"
            value={t.atl.toFixed(0)}
            delta={t.tsb < 0 ? '高于体能' : '低于体能'}
            trend={t.tsb < 0 ? 'up' : 'down'}
            accent="var(--violet-500)"
          />
          <StatCard
            label="状态 TSB"
            value={`${t.tsb > 0 ? '+' : ''}${t.tsb.toFixed(0)}`}
            delta={t.tsb > 5 ? '新鲜' : t.tsb > -10 ? '中性' : '疲劳'}
            trend="flat"
            accent={t.tsb >= 0 ? 'var(--green-500)' : 'var(--amber-500)'}
          />
        </div>
      </div>

      {/* Recovery: HRV + sleep + HR zones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 26 }}>
        <Card title="HRV 趋势 (RMSSD)" action={<Badge tone="positive" dot>基线抬升</Badge>}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <span
              style={{
                font: 'var(--fw-bold) var(--fs-display-lg)/1 var(--font-display)',
                color: 'var(--text-strong)',
                letterSpacing: 'var(--ls-tight)',
              }}
            >
              {t.hrv}
            </span>
            <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-faint)' }}>ms</span>
            <span style={{ marginLeft: 'auto', font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-mono)', color: 'var(--green-400)' }}>
              ▲ {t.hrvDelta} vs 基线
            </span>
          </div>
          <HRVChart data={data.hrv} />
        </Card>
        <Card title="睡眠结构" action={<span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>近 7 晚</span>}>
          <SleepBars nights={data.sleep} />
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--hairline)', display: 'flex', gap: 14 }}>
            {(
              [
                ['深睡', 'var(--violet-500)'],
                ['REM', 'var(--blue-500)'],
                ['浅睡', 'var(--ink-600)'],
              ] as const
            ).map(([l, c]) => (
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
                <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                {l}
              </span>
            ))}
          </div>
        </Card>
        <Card title="心率区间分布" action={<span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>本周</span>}>
          <HRZoneBar zones={data.hrZones} />
        </Card>
      </div>

      {/* Discipline split + balance + climbing */}
      <SectionTitle icon="layers" note="跑步 · 登山 · 徒步 · 抱石 · 难度">
        多项目结构
      </SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card title="负荷构成">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative', flex: 'none' }}>
              <Donut data={data.disciplineSplit} />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                <span style={{ font: 'var(--fw-bold) var(--fs-h3)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{t.weekLoad}</span>
                <span
                  style={{
                    font: 'var(--fw-semibold) 10px/1 var(--font-sans)',
                    letterSpacing: 'var(--ls-wide)',
                    textTransform: 'uppercase',
                    color: 'var(--text-faint)',
                  }}
                >
                  AU / 周
                </span>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {data.disciplineSplit.map((d) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flex: 'none' }} />
                  <Icon name={d.icon} size={14} color="var(--text-muted)" />
                  <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-body)' }}>{d.name}</span>
                  <span style={{ marginLeft: 'auto', font: 'var(--fw-bold) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-strong)' }}>
                    {d.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card title="能力平衡">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Radar data={data.balance} />
          </div>
        </Card>
        <Card title="抱石完攀金字塔" action={<span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>近 90 天</span>}>
          <GradePyramid rows={data.boulderPyramid} />
          <div
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop: '1px solid var(--hairline)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-muted)' }}>当前极限</span>
            <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--amber-400)' }}>V8 · 难度 5.12a</span>
          </div>
        </Card>
      </div>

      {/* Activity heatmap */}
      <Card
        title="活动热力图"
        action={<span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>近 13 周 · 训练负荷强度</span>}
        style={{ marginBottom: 26 }}
      >
        <Heatmap data={data.heatmap} />
      </Card>

      {/* Recent activities */}
      <SectionTitle icon="route" note="全项目">
        近期活动
      </SectionTitle>
      <Card padding="none">
        <div>
          {data.activities.map((s, i) => (
            <div
              key={s.id}
              onClick={() => onOpenActivity(s)}
              style={{
                display: 'grid',
                gridTemplateColumns: '34px 2.2fr 1fr 0.9fr 0.9fr 0.9fr 1.6fr 22px',
                gap: 14,
                alignItems: 'center',
                padding: '14px 20px',
                cursor: 'pointer',
                borderTop: i ? '1px solid var(--hairline)' : 'none',
                transition: 'background var(--dur-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'var(--surface-inset)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={s.icon} size={16} color="var(--text-muted)" />
              </span>
              <div>
                <div style={{ font: 'var(--fw-semibold) var(--fs-sm)/1.2 var(--font-sans)', color: 'var(--text-strong)' }}>{s.name}</div>
                <div style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-mono)', color: 'var(--text-faint)', marginTop: 3 }}>{s.date}</div>
              </div>
              <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-muted)' }}>{s.sport}</span>
              <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-body)' }}>{s.dist}</span>
              <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-body)' }}>{s.dur}</span>
              <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-strong)' }}>
                {s.load} <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>AU</span>
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
                {s.note}
              </span>
              <Icon name="chevron-right" size={16} color="var(--text-faint)" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
