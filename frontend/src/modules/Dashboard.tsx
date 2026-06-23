import { useMemo, type ReactNode } from 'react'
import { Card, StatCard, Badge, ProgressRing, Sparkline } from '../design-system'
import { Icon } from '../components/Icon'
import { PMCChart, HRVChart, SleepBars, HRZoneBar, Radar, GradePyramid, Donut } from '../components/charts/Charts'
import { SourceBadge, HowInfo } from '../components/SourceBadge'
import { EmptyState } from '../components/EmptyState'
import { sports, sportByKey, emptyCopy } from '../lib/taxonomy'
import type { Activity, ApexData, Insight, MetricDeepDive, MetricId } from '../lib/types'

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

function SectionTitle({ icon, children, note, right }: { icon: string; children: ReactNode; note?: ReactNode; right?: ReactNode }) {
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

type HeroTuple = [label: string, value: string | number, unit: string, delta: string, deltaColor: string, mid: MetricId]

// Hero metric tile — value opens the deep dive; ⓘ opens "how calculated".
function HeroTile({ m, mObj, onOpenMetric }: { m: HeroTuple; mObj?: MetricDeepDive; onOpenMetric: (id: MetricId) => void }) {
  const [l, v, u, d, dc, mid] = m
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', padding: '8px 10px', margin: '-8px -10px', borderRadius: 'var(--r-md)', transition: 'background var(--dur-fast)' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Label>{l}</Label>
        {mObj && (
          <HowInfo source={mObj.source} title={mObj.name} definition={mObj.definition} formula={mObj.formula} params={mObj.params} family={mObj.family} />
        )}
      </span>
      <button
        onClick={() => onOpenMetric(mid)}
        style={{ display: 'flex', alignItems: 'baseline', gap: 3, background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'var(--fw-bold) var(--fs-h2)/1 var(--font-mono)', color: 'var(--text-strong)' }}
      >
        {v}
        <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{u}</span>
        <Icon name="chevron-right" size={13} color="var(--text-faint)" />
      </button>
      <span style={{ font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-mono)', color: dc }}>{d}</span>
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

export interface DashboardProps {
  data: ApexData
  range: string
  setRange: (r: string) => void
  sport: string
  setSport: (id: string) => void
  connected: boolean
  onConnect: () => void
  onOpenAI: () => void
  onAskAI: (ins: Insight) => void
  onOpenActivity: (a: Activity) => void
  onOpenMetric: (id: string) => void
}

// Number of trailing days each range selects. `season` means the full series.
const RANGE_DAYS: Record<string, number> = { '7d': 7, '28d': 28, season: Infinity }
const RANGE_LABEL: Record<string, string> = { '7d': '近 7 天', '28d': '近 28 天', season: '赛季' }

export function Dashboard({ data, range, sport, setSport, connected, onConnect, onAskAI, onOpenActivity, onOpenMetric }: DashboardProps) {
  const t = data.today

  // Window the time-series by the selected range (preserves the 7天/28天/赛季 switch).
  const view = useMemo(() => {
    const days = RANGE_DAYS[range] ?? RANGE_DAYS['28d']
    const tail = <T,>(arr: T[]) => (days === Infinity ? arr : arr.slice(-days))
    return { pmc: tail(data.pmc), hrv: tail(data.hrv) }
  }, [data.pmc, data.hrv, range])

  // ---- empty state (no data source connected) ----
  if (!connected) {
    const e = emptyCopy.dashboard
    return (
      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
        <EmptyState icon={e.icon} title={e.title} desc={e.desc} onAction={onConnect} secondaryLabel="了解数据来源" onSecondary={onConnect} />
        <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          {(
            [
              ['就绪度', 'gauge'],
              ['体能趋势 (CTL/ATL/TSB)', 'activity'],
              ['全运动负荷', 'layers'],
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

  const rangeLabel = RANGE_LABEL[range] ?? RANGE_LABEL['28d']
  const rColor = t.readiness >= 75 ? 'var(--green-500)' : t.readiness >= 50 ? 'var(--amber-500)' : 'var(--red-500)'
  const hero: HeroTuple[] = [
    ['HRV', t.hrv, 'ms', `${t.hrvDelta > 0 ? '+' : ''}${t.hrvDelta}`, t.hrvDelta >= 0 ? 'var(--green-400)' : 'var(--red-400)', 'hrv'],
    ['静息心率', t.rhr, 'bpm', `${t.rhrDelta} vs 均`, 'var(--green-400)', 'rhr'],
    ['睡眠', t.sleep, 'hrs', `评分 ${t.sleepScore}`, 'var(--text-faint)', 'sleep'],
    ['ACWR', t.acwr.toFixed(2), '', t.acwr > 1.3 ? '偏高' : '区间内', t.acwr > 1.3 ? 'var(--amber-400)' : 'var(--green-400)', 'acwr'],
    ['体能 CTL', t.ctl.toFixed(0), '', `状态 ${t.tsb > 0 ? '+' : ''}${t.tsb.toFixed(0)}`, t.tsb >= 0 ? 'var(--green-400)' : 'var(--amber-400)', 'ctl'],
  ]

  // Recent activities filtered by the global sport filter (core layer stays全运动).
  const acts = sport === 'all' ? data.activities : data.activities.filter((a) => a.key === sport)
  const sportName = sportByKey[sport]?.name ?? '全部运动'

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
      {/* Hero readiness strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: 24, marginBottom: 22, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md), var(--inner-top)' }}>
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
          {hero.map((m) => (
            <HeroTile key={m[0]} m={m} mObj={data.metrics[m[5]]} onOpenMetric={onOpenMetric} />
          ))}
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

      {/* Performance management chart — all-sport aggregate */}
      <SectionTitle icon="activity" note="全运动汇总 · 体能 / 疲劳 / 状态" right={<SourceBadge source="readyn" />}>
        体能趋势
      </SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.85fr) minmax(0, 1fr)', gap: 16, marginBottom: 16 }}>
        <Card
          title={`${rangeLabel} · 体能 / 疲劳 / 状态`}
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <HowInfo
                source="readyn"
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
          <PMCChart data={view.pmc} />
        </Card>
        <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          <StatCard label={`${rangeLabel}负荷`} value={view.pmc.reduce((s, d) => s + d.load, 0)} unit="AU" delta={`+${t.weekLoadDelta}%`} trend="up">
            <Sparkline data={view.pmc.map((d) => d.load)} />
          </StatCard>
          <StatCard label="疲劳 ATL" value={t.atl.toFixed(0)} delta={t.tsb < 0 ? '高于体能' : '低于体能'} trend={t.tsb < 0 ? 'up' : 'down'} accent="var(--violet-500)" />
          <StatCard label="状态 TSB" value={`${t.tsb > 0 ? '+' : ''}${t.tsb.toFixed(0)}`} delta={t.tsb > 5 ? '新鲜' : t.tsb > -10 ? '中性' : '疲劳'} trend="flat" accent={t.tsb >= 0 ? 'var(--green-500)' : 'var(--amber-500)'} />
        </div>
      </div>

      {/* Recovery: HRV + sleep + HR zones — Garmin-sourced */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginBottom: 26 }}>
        <Card title="HRV 趋势 (RMSSD)" action={<SourceBadge source="garmin" size="xs" />}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <span style={{ font: 'var(--fw-bold) var(--fs-display-lg)/1 var(--font-display)', color: 'var(--text-strong)', letterSpacing: 'var(--ls-tight)' }}>{t.hrv}</span>
            <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-faint)' }}>ms</span>
            <span style={{ marginLeft: 'auto', font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-mono)', color: 'var(--green-400)' }}>▲ {t.hrvDelta} vs 基线</span>
          </div>
          <HRVChart data={view.hrv} />
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

      {/* Recent activities — filtered by the sport filter, with load source */}
      <SectionTitle icon="route" note={sportName}>
        近期活动
      </SectionTitle>
      {acts.length ? (
        <Card padding="none">
          <div>
            {acts.map((s, i) => (
              <div
                key={s.id}
                onClick={() => onOpenActivity(s)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '34px 2.2fr 1fr 0.9fr 0.9fr 1.3fr 1.4fr 22px',
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
                <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-inset)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={s.icon} size={16} color="var(--text-muted)" />
                </span>
                <div>
                  <div style={{ font: 'var(--fw-semibold) var(--fs-sm)/1.2 var(--font-sans)', color: 'var(--text-strong)' }}>{s.name}</div>
                  <div style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-mono)', color: 'var(--text-faint)', marginTop: 3 }}>{s.date}</div>
                </div>
                <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-muted)' }}>{s.sport}</span>
                <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-body)' }}>{s.dist}</span>
                <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-body)' }}>{s.dur}</span>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-strong)' }}>
                    {s.load} <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>AU</span>
                  </span>
                  {s.loadSrc && <span style={{ font: 'var(--fw-medium) 9px/1 var(--font-sans)', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>{s.loadSrc}</span>}
                </span>
                <span style={{ font: 'var(--fw-regular) var(--fs-xs)/1.3 var(--font-sans)', color: 'var(--text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.note}</span>
                <Icon name="chevron-right" size={16} color="var(--text-faint)" />
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState compact inline icon={emptyCopy.activities.icon} title={`暂无${sportName === '全部运动' ? '' : sportName}活动`} desc="切换到其他项目，或连接数据源后同步活动。" />
      )}
    </div>
  )
}
