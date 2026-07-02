import type { ReactNode } from 'react'
import { Card, Badge, ProgressRing, Sparkline } from '../design-system'
import { Icon } from '../components/Icon'
import { PMCChart, HRVChart, SleepBars, HRZoneBar, Radar, GradePyramid, Donut } from '../components/charts/Charts'
import { SourceBadge, HowInfo } from '../components/SourceBadge'
import { EmptyState } from '../components/EmptyState'
import { sports, sportByKey, emptyCopy } from '../lib/taxonomy'
import type { ApexData, Insight, MetricDeepDive, MetricId, SourceKey } from '../lib/types'

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

function SectionTitle({ icon, children, note, right, id }: { icon: string; children: ReactNode; note?: ReactNode; right?: ReactNode; id?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <Icon name={icon} size={16} color="var(--text-muted)" />
      <h2
        id={id}
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
      {right && <div style={{ marginLeft: 'auto' }}>{right}</div>}
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
      <p style={{ margin: 0, font: 'var(--fw-regular) var(--fs-sm)/1.55 var(--font-sans)', color: 'var(--text-muted)', textWrap: 'pretty' }}>
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

interface LoadMetricInfo {
  source?: SourceKey
  title: string
  definition?: string
  formula?: string
  params?: ReactNode
  family?: ReactNode
}

interface HeroMetric {
  label: string
  value: string | number
  unit: string
  delta: string
  deltaColor: string
  metricId?: MetricId
  info?: LoadMetricInfo
}

function metricInfoFromDeepDive(m?: MetricDeepDive): LoadMetricInfo | undefined {
  if (!m) return undefined
  return {
    source: m.source,
    title: m.name,
    definition: m.definition,
    formula: m.formula,
    params: m.params,
    family: m.family,
  }
}

// Hero metric tile — value opens the deep dive; ⓘ opens "how calculated".
function HeroTile({ metric, info, onOpenMetric }: { metric: HeroMetric; info?: LoadMetricInfo; onOpenMetric: (id: string) => void }) {
  const value = (
    <>
      {metric.value}
      <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{metric.unit}</span>
      {metric.metricId && <Icon name="chevron-right" size={13} color="var(--text-faint)" />}
    </>
  )

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', padding: '8px 10px', margin: '-8px -10px', borderRadius: 'var(--r-md)', transition: 'background var(--dur-fast)' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Label>{metric.label}</Label>
        {info && (
          <HowInfo source={info.source} title={info.title} definition={info.definition} formula={info.formula} params={info.params} family={info.family} />
        )}
      </span>
      {metric.metricId ? (
        <button
          onClick={() => onOpenMetric(metric.metricId as MetricId)}
          style={{ display: 'flex', alignItems: 'baseline', gap: 3, background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'var(--fw-bold) var(--fs-h2)/1 var(--font-mono)', color: 'var(--text-strong)' }}
        >
          {value}
        </button>
      ) : (
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 3, font: 'var(--fw-bold) var(--fs-h2)/1 var(--font-mono)', color: 'var(--text-strong)' }}>
          {value}
        </span>
      )}
      <span style={{ font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-mono)', color: metric.deltaColor }}>{metric.delta}</span>
    </div>
  )
}

function EvidenceRow({ title, desc, status, tone }: { title: string; desc: string; status: string; tone: 'neutral' | 'accent' | 'positive' | 'caution' }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start', padding: '12px 0', borderTop: '1px solid var(--hairline)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ font: 'var(--fw-semibold) var(--fs-xs)/1.2 var(--font-sans)', color: 'var(--text-strong)' }}>{title}</span>
        <span style={{ font: 'var(--fw-regular) var(--fs-2xs)/1.5 var(--font-sans)', color: 'var(--text-faint)', textWrap: 'pretty' }}>{desc}</span>
      </div>
      <Badge tone={tone}>{status}</Badge>
    </div>
  )
}

function FormulaRow({ code, title, desc, value }: { code: string; title: string; desc: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '42px 1fr auto', gap: 10, alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--hairline)' }}>
      <span style={{ font: 'var(--fw-bold) var(--fs-xs)/1 var(--font-mono)', color: 'var(--blue-300)' }}>{code}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ font: 'var(--fw-semibold) var(--fs-xs)/1.2 var(--font-sans)', color: 'var(--text-strong)' }}>{title}</span>
        <span style={{ font: 'var(--fw-regular) var(--fs-2xs)/1.5 var(--font-sans)', color: 'var(--text-faint)', textWrap: 'pretty' }}>{desc}</span>
      </div>
      <span style={{ font: 'var(--fw-bold) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-muted)' }}>{value}</span>
    </div>
  )
}

// Sport-specific card — de-headlines climbing; content driven by the sport filter.
function SportSpecificCard({
  sport,
  data,
  onOpenMetric,
  onPickSport,
}: {
  sport: string
  data: ApexData
  onOpenMetric: (id: string) => void
  onPickSport: (id: string) => void
}) {
  const metrics = data.metrics as Record<string, MetricDeepDive | undefined>
  if (sport === 'climb') {
    return (
      <Card
        title="攀岩难度金字塔"
        action={
          <button
            onClick={() => onOpenMetric('climbpyramid')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--green-400)' }}
          >
            展开 <Icon name="arrow-right" size={12} color="var(--green-400)" />
          </button>
        }
      >
        {data.boulderPyramid.length ? (
          <GradePyramid rows={data.boulderPyramid} />
        ) : (
          <EmptyState compact inline icon={emptyCopy.metric.icon} title="暂无攀岩完攀记录" desc="连接数据源并记录完攀后，这里展示难度金字塔。" />
        )}
      </Card>
    )
  }
  const specMid = sport === 'run' ? 'vo2max_run' : sport === 'ride' ? 'ftp' : sport === 'swim' ? 'css' : null
  const m = specMid ? metrics[specMid] : undefined
  if (specMid && m) {
    return (
      <Card title={`专项 · ${sportByKey[sport]?.name ?? ''}`} action={m.source ? <SourceBadge source={m.source} size="xs" /> : undefined}>
        <button
          onClick={() => onOpenMetric(specMid)}
          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <Label>{m.name}</Label>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ font: 'var(--fw-black) var(--fs-display-lg)/0.9 var(--font-display)', color: 'var(--text-strong)' }}>{m.value}</span>
            <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-faint)' }}>{m.unit}</span>
          </div>
          <Badge tone="positive" dot>
            {m.status}
          </Badge>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4, font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-sans)', color: 'var(--blue-300)' }}>
            查看专项详情 <Icon name="arrow-right" size={12} color="var(--blue-300)" />
          </span>
        </button>
      </Card>
    )
  }
  if (specMid && !m) {
    return (
      <Card title={`专项 · ${sportByKey[sport]?.name ?? ''}`}>
        <EmptyState compact inline icon={emptyCopy.metric.icon} title="暂无专项数据" desc="连接佳明并完成同步后，这里展示该项目的专属指标。" />
      </Card>
    )
  }
  // sport === 'all': prompt to pick a sport — keeps climbing out of the headline.
  return (
    <Card title="专项指标">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, font: 'var(--fw-regular) var(--fs-xs)/1.55 var(--font-sans)', color: 'var(--text-faint)' }}>
          VO₂max、FTP、CSS、攀岩金字塔等为项目专属指标。选择一个项目查看：
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {sports
            .filter((s) => s.id !== 'all' && (s.specific || []).length)
            .map((s) => (
              <button
                key={s.id}
                onClick={() => onPickSport(s.id)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 'var(--r-pill)', cursor: 'pointer', border: '1px solid var(--border-subtle)', background: 'var(--surface-inset)', font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-body)' }}
              >
                <Icon name={s.icon} size={13} color={s.color} />
                {s.name}
              </button>
            ))}
        </div>
      </div>
    </Card>
  )
}

function NextWorkoutCard({ data }: { data: ApexData }) {
  const w = data.workout
  const hasWorkout = Boolean(w.title.trim())

  return (
    <Card title="下一次训练建议" action={<SourceBadge source="trainalyze" size="xs" />} aria-label="下一次训练建议">
      {hasWorkout ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ font: 'var(--fw-bold) var(--fs-h3)/1.15 var(--font-display)', color: 'var(--text-strong)' }}>{w.title}</span>
            <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>{w.when || '计划时间待定'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
            {[
              ['项目', w.sport || '—'],
              ['时长', w.duration || '—'],
              ['目标负荷', w.load ? `${w.load} AU` : '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: 12, background: 'var(--surface-inset)', borderRadius: 'var(--r-md)' }}>
                <Label>{k}</Label>
                <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1.2 var(--font-sans)', color: 'var(--text-body)' }}>{v}</span>
              </div>
            ))}
          </div>
          {w.target && <Badge tone="accent">{w.target}</Badge>}
          {w.rationale && (
            <p style={{ margin: 0, font: 'var(--fw-regular) var(--fs-sm)/1.6 var(--font-sans)', color: 'var(--text-muted)', textWrap: 'pretty' }}>{w.rationale}</p>
          )}
        </div>
      ) : (
        <EmptyState compact inline icon="calendar-check" title="暂无下一次训练建议" desc="应用训练计划后，这里展示下一次课程；当前不生成假建议。" />
      )}
    </Card>
  )
}

export interface DashboardProps {
  data: ApexData
  sport: string
  setSport: (id: string) => void
  connected: boolean
  onConnect: () => void
  onOpenAI: () => void
  onAskAI: (ins: Insight) => void
  onOpenMetric: (id: string) => void
}

export function Dashboard({ data, sport, setSport, connected, onConnect, onAskAI, onOpenMetric }: DashboardProps) {
  const t = data.today

  // ---- empty state (no data source connected) ----
  if (!connected) {
    const e = emptyCopy.dashboard
    return (
      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
        <EmptyState icon={e.icon} title={e.title} desc={e.desc} onAction={onConnect} secondaryLabel="了解数据来源" onSecondary={onConnect} />
        <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          {(
            [
              ['Fatigue / ATL', 'activity'],
              ['Fitness / CTL', 'trending-up'],
              ['Stress Balance / TSB', 'gauge'],
              ['Workload Ratio / A:C', 'layers'],
              ['Easy TRIMP', 'calendar-check'],
              ['下一次训练建议', 'calendar-check'],
            ] as const
          ).map(([l, ic]) => (
            <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', opacity: 0.7 }}>
              <Icon name={ic} size={18} color="var(--text-faint)" />
              <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1.2 var(--font-sans)', color: 'var(--text-muted)' }}>{l}</span>
              <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>连接后显示</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const rColor = t.readiness >= 75 ? 'var(--green-500)' : t.readiness >= 50 ? 'var(--amber-500)' : 'var(--red-500)'
  const hero: HeroMetric[] = [
    {
      label: 'Fatigue / ATL',
      value: t.atl.toFixed(0),
      unit: '',
      delta: '7 天 EWMA',
      deltaColor: 'var(--violet-300)',
      info: {
        source: 'trainalyze',
        title: 'Fatigue / ATL',
        definition: '基于每日全运动归一负荷计算的短期疲劳指标。',
        formula: 'ATL = 7d EWMA(load)',
        params: '7 天窗口',
        family: 'PMC',
      },
    },
    {
      label: 'Fitness / CTL',
      value: t.ctl.toFixed(0),
      unit: '',
      delta: '42 天 EWMA',
      deltaColor: 'var(--blue-300)',
      metricId: 'ctl',
    },
    {
      label: 'Stress Balance / TSB',
      value: `${t.tsb > 0 ? '+' : ''}${t.tsb.toFixed(0)}`,
      unit: '',
      delta: t.tsb >= 0 ? '压力较低' : '疲劳累积',
      deltaColor: t.tsb >= 0 ? 'var(--green-400)' : 'var(--amber-400)',
      metricId: 'tsb',
    },
    {
      label: 'Workload Ratio / A:C',
      value: t.acwr.toFixed(2),
      unit: '',
      delta: t.acwr > 1.3 ? '偏高' : '区间内',
      deltaColor: t.acwr > 1.3 ? 'var(--amber-400)' : 'var(--green-400)',
      metricId: 'acwr',
    },
    {
      label: 'Easy TRIMP',
      value: '—',
      unit: '',
      delta: '待算法字段',
      deltaColor: 'var(--text-faint)',
      info: {
        source: 'trainalyze',
        title: 'Easy TRIMP',
        definition: '用于估算下一日可承受的轻松负荷上限。当前前端数据契约还没有真实字段，因此不显示推测值。',
        formula: '待后端提供真实 Easy TRIMP 字段',
        params: 'N/A',
        family: 'PMC',
      },
    },
  ]

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
      {/* Hero readiness strip */}
      <div role="region" aria-label="负荷指标" style={{ display: 'flex', alignItems: 'center', gap: 28, padding: 24, marginBottom: 22, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md), var(--inner-top)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 'none' }}>
          <ProgressRing value={t.readiness} sublabel="就绪度" size={116} stroke={10} color={rColor} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Label>今日状态</Label>
              <SourceBadge source="garmin" size="xs" />
            </span>
            <span style={{ font: 'var(--fw-bold) var(--fs-h2)/1 var(--font-display)', letterSpacing: 'var(--ls-tight)', color: 'var(--text-strong)' }}>状态均衡</span>
            <Badge tone="positive" dot>
              可承接强度
            </Badge>
          </div>
        </div>
        <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--hairline)' }} />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 20 }}>
          {hero.map((metric) => {
            const deepDive = metric.metricId ? data.metrics[metric.metricId] : undefined
            return <HeroTile key={metric.label} metric={metric} info={metric.info ?? metricInfoFromDeepDive(deepDive)} onOpenMetric={onOpenMetric} />
          })}
        </div>
      </div>

      {/* AI insights */}
      <SectionTitle icon="sparkles" note="基于近 14 天全运动数据自动生成">
        AI 洞察
      </SectionTitle>
      {data.insights.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginBottom: 26 }}>
          {data.insights.map((ins) => (
            <InsightCard key={ins.id} ins={ins} onAsk={onAskAI} />
          ))}
        </div>
      ) : (
        <div style={{ marginBottom: 26 }}>
          <EmptyState compact inline icon="sparkles" title="暂无洞察" desc="完成首次同步后，AI 会基于近 14 天全运动数据生成洞察。" />
        </div>
      )}

      <div style={{ marginBottom: 26 }}>
        <NextWorkoutCard data={data} />
      </div>

      {/* Performance management chart — all-sport aggregate */}
      <section aria-labelledby="overview-trend-title">
        <SectionTitle id="overview-trend-title" icon="activity" note="全运动汇总 · 体能 / 疲劳 / 状态">
          体能趋势
        </SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.85fr) minmax(0, 1fr)', gap: 16, marginBottom: 16 }}>
          <Card
            title="近 6 周 · 体能 / 疲劳 / 状态"
            aria-label="来源证据与公式说明"
            action={
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <SourceBadge source="trainalyze" />
                <HowInfo
                  source="trainalyze"
                  title="PMC · 体能管理图"
                  definition="对每日全运动归一负荷做指数加权平均，得到体能(CTL)、疲劳(ATL)与状态(TSB)。"
                  formula="CTL=42d EWMA · ATL=7d EWMA · TSB=CTL−ATL"
                  params="Banister / Coggan"
                  family="PMC"
                />
                <div style={{ display: 'flex', gap: 14 }}>
                  {(
                    [
                      ['CTL 体能', 'var(--blue-500)', 'solid'],
                      ['ATL 疲劳', 'var(--violet-500)', 'dash'],
                      ['TSB 状态', 'var(--green-500)', 'solid'],
                    ] as const
                  ).map(([l, c, st]) => (
                    <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-muted)' }}>
                      <span style={{ width: 14, height: st === 'dash' ? 0 : 2, borderTop: st === 'dash' ? `2px dashed ${c}` : 'none', background: st === 'dash' ? 'none' : c }} />
                      {l}
                    </span>
                  ))}
                </div>
              </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <PMCChart data={data.pmc} />
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 18, paddingTop: 4 }}>
              <section aria-label="来源证据">
                <Label>来源证据</Label>
                <EvidenceRow title="Garmin 中国" desc="活动、睡眠和体重可作为基础数据来源；负荷指标仍由 Trainalyze 计算。" status="主来源" tone="positive" />
                <EvidenceRow title="Trainalyze 负荷模型" desc="ATL、CTL、TSB、A:C 基于平台归一负荷自算，不直接信任 Garmin 结论。" status="自算" tone="accent" />
                <EvidenceRow title="Garmin International" desc="当前实现未接入该来源，本窗口不参与负荷计算或来源合并。" status="未接入" tone="neutral" />
              </section>
              <section aria-label="公式摘要">
                <Label>公式摘要</Label>
                <FormulaRow code="ATL" title="Fatigue / ATL" desc="基于每日全运动归一负荷的 7 天指数加权平均。" value="7d" />
                <FormulaRow code="CTL" title="Fitness / CTL" desc="基于每日全运动归一负荷的 42 天指数加权平均。" value="42d" />
                <FormulaRow code="TSB" title="Stress Balance / TSB" desc="用 CTL - ATL 判断压力状态。" value="CTL-ATL" />
                <FormulaRow code="A:C" title="Workload Ratio / A:C" desc="使用现有 ACWR 字段观察急性与慢性负荷比例。" value={t.acwr.toFixed(2)} />
                <FormulaRow code="Easy" title="Easy TRIMP" desc="当前数据契约没有真实字段，因此保持空值，不显示推测值。" value="—" />
              </section>
            </div>
          </div>
        </Card>
          <Card title="本周概览">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                // delta text colour (color) and Sparkline colour (sc) are distinct per
                // design v9: 负荷=蓝 / ATL=紫 / TSB=按正负 绿|琥珀 for the Sparkline.
                { label: '本周负荷', val: `${data.pmc.slice(-7).reduce((s, d) => s + d.load, 0)}`, unit: 'AU', delta: `+${t.weekLoadDelta}%`, color: 'var(--green-400)', sc: 'var(--blue-500)', spark: data.pmc.slice(-7).map((d) => d.load) },
                { label: '疲劳 ATL', val: t.atl.toFixed(0), unit: '', delta: t.tsb < 0 ? '高于体能' : '低于体能', color: 'var(--violet-300)', sc: 'var(--violet-500)', spark: data.pmc.slice(-7).map((d) => d.atl) },
                { label: '状态 TSB', val: `${t.tsb > 0 ? '+' : ''}${t.tsb.toFixed(0)}`, unit: '', delta: t.tsb > 5 ? '新鲜' : t.tsb > -10 ? '中性' : '疲劳', color: t.tsb >= 0 ? 'var(--green-400)' : 'var(--amber-400)', sc: t.tsb >= 0 ? 'var(--green-500)' : 'var(--amber-500)', spark: data.pmc.slice(-7).map((d) => d.tsb) },
              ].map((r, i) => (
                <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: i ? '1px solid var(--hairline)' : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 'none', minWidth: 96 }}>
                    <span style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{r.label}</span>
                    <span style={{ font: 'var(--fw-bold) var(--fs-h3)/1 var(--font-mono)', color: 'var(--text-strong)' }}>
                      {r.val}
                      {r.unit ? <span style={{ fontSize: 11, color: 'var(--text-faint)', marginLeft: 3 }}>{r.unit}</span> : null}
                    </span>
                    <span style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-mono)', color: r.color }}>{r.delta}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Sparkline data={r.spark} color={r.sc} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Recovery: HRV + sleep + HR zones — Garmin-sourced */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginBottom: 26 }}>
        <Card title="HRV 趋势 (RMSSD)" action={<SourceBadge source="garmin" size="xs" />}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <span style={{ font: 'var(--fw-bold) var(--fs-display-lg)/1 var(--font-display)', color: 'var(--text-strong)', letterSpacing: 'var(--ls-tight)' }}>{t.hrv}</span>
            <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-faint)' }}>ms</span>
            <span style={{ marginLeft: 'auto', font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-mono)', color: 'var(--green-400)' }}>▲ {t.hrvDelta} vs 基线</span>
          </div>
          <HRVChart data={data.hrv} />
        </Card>
        <Card title="睡眠结构" action={<SourceBadge source="garmin" size="xs" />}>
          <SleepBars nights={data.sleep} />
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--hairline)', display: 'flex', gap: 14 }}>
            {(
              [
                ['深睡', 'var(--violet-500)'],
                ['REM', 'var(--blue-500)'],
                ['浅睡', 'var(--ink-600)'],
              ] as const
            ).map(([l, c]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                {l}
              </span>
            ))}
          </div>
        </Card>
        <Card title="心率区间分布" action={<span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>本周 · 全运动</span>}>
          <HRZoneBar zones={data.hrZones} />
        </Card>
      </div>

      {/* Sport composition + balance + sport-specific (climbing no longer headlined) */}
      <SectionTitle icon="layers" note="全运动负荷占比">
        运动构成
      </SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: 16, marginBottom: 26 }}>
        <Card title="负荷构成">
          {data.disciplineSplit.length ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ position: 'relative', flex: 'none' }}>
                <Donut data={data.disciplineSplit} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <span style={{ font: 'var(--fw-bold) var(--fs-h3)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{t.weekLoad}</span>
                  <span style={{ font: 'var(--fw-semibold) 10px/1 var(--font-sans)', letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>AU / 周</span>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.disciplineSplit.map((d) => {
                  const clickable = !!d.key && d.key !== 'other'
                  return (
                    <button
                      key={d.name}
                      onClick={() => clickable && d.key && setSport(d.key)}
                      style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', padding: '2px 0', cursor: clickable ? 'pointer' : 'default', textAlign: 'left' }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flex: 'none' }} />
                      <Icon name={d.icon} size={14} color="var(--text-muted)" />
                      <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-body)' }}>{d.name}</span>
                      <span style={{ marginLeft: 'auto', font: 'var(--fw-bold) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{d.pct}%</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <EmptyState compact inline icon="layers" title="暂无负荷构成" desc="完成同步后，这里按运动展示负荷占比。" />
          )}
        </Card>
        <Card title="能力平衡">
          {data.balance.length ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Radar data={data.balance} />
            </div>
          ) : (
            <EmptyState compact inline icon="target" title="暂无能力数据" />
          )}
        </Card>
        <SportSpecificCard sport={sport} data={data} onOpenMetric={onOpenMetric} onPickSport={setSport} />
      </div>
    </div>
  )
}
