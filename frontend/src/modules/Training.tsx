import { useState } from 'react'
import { Card, Badge, Button, ProgressRing, IconButton } from '../design-system'
import { Icon } from '../components/Icon'
import type {
  Activity,
  ApexData,
  PlanDay,
  PlanDayStatus,
  CalendarEvent,
  CalendarEvents,
  UnlinkedActivity,
  LinkTarget,
} from '../lib/types'

const sportColor = (s: string): string =>
  ({
    跑步: 'var(--blue-500)',
    登山: 'var(--violet-500)',
    抱石: 'var(--cyan-500)',
    难度: 'var(--green-500)',
    徒步: 'var(--amber-500)',
    休息: 'var(--ink-500)',
    其他: 'var(--ink-500)',
  })[s] || 'var(--ink-500)'

const sportIcon = (s: string): string =>
  ({
    跑步: 'footprints',
    登山: 'mountain',
    抱石: 'grip',
    难度: 'route',
    徒步: 'tent-tree',
    休息: 'moon',
    其他: 'circle',
  })[s] || 'circle'

const STATUS: Record<PlanDayStatus, { label: string; c: string }> = {
  done: { label: '已完成', c: 'var(--green-500)' },
  today: { label: '今天', c: 'var(--blue-400)' },
  planned: { label: '计划', c: 'var(--text-faint)' },
  rest: { label: '休息', c: 'var(--ink-400)' },
}

function DayCol({ day }: { day: PlanDay }) {
  const st = STATUS[day.status]
  const it = day.items[0]
  const isToday = day.status === 'today'
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 14,
        minHeight: 188,
        background: isToday ? 'rgba(59,91,255,0.07)' : 'var(--surface-card)',
        border: `1px solid ${isToday ? 'rgba(59,91,255,0.4)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--inner-top)',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>{day.d}</span>
          <span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-mono)', color: 'var(--text-faint)' }}>{day.date}</span>
        </div>
        <span
          style={{
            font: 'var(--fw-semibold) 10px/1 var(--font-sans)',
            letterSpacing: 'var(--ls-wide)',
            textTransform: 'uppercase',
            color: st.c,
          }}
        >
          {st.label}
        </span>
      </div>
      {day.status === 'rest' ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: 'var(--text-faint)',
          }}
        >
          <Icon name="moon" size={20} color="var(--ink-400)" />
          <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)' }}>完全休息</span>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: `${sportColor(it.sport)}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={sportIcon(it.sport)} size={15} color={sportColor(it.sport)} />
          </span>
          <span style={{ font: 'var(--fw-semibold) var(--fs-xs)/1.35 var(--font-sans)', color: 'var(--text-body)', textWrap: 'pretty' }}>
            {it.t}
          </span>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ font: 'var(--fw-bold) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-strong)' }}>
              {it.load} <span style={{ color: 'var(--text-faint)', fontWeight: 500 }}>AU</span>
            </span>
            <span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-mono)', color: 'var(--text-faint)' }}>{it.dur}</span>
          </div>
        </div>
      )}
      {day.adapted && (
        <span
          title="AI 已调整"
          style={{
            position: 'absolute',
            top: 12,
            right: 40,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            font: 'var(--fw-semibold) 9px/1 var(--font-sans)',
            color: 'var(--violet-300)',
            background: 'rgba(124,77,255,0.16)',
            padding: '4px 6px',
            borderRadius: 'var(--r-pill)',
          }}
        >
          <Icon name="sparkles" size={10} color="var(--violet-300)" />
          AI
        </span>
      )}
      {day.status === 'done' && (
        <span style={{ position: 'absolute', top: 13, right: 14 }}>
          <Icon name="check-circle-2" size={15} color="var(--green-500)" />
        </span>
      )}
    </div>
  )
}

// ---------- Month calendar ----------
function MonthCell({ day, ev }: { day: number | null; ev: CalendarEvents }) {
  if (day == null) return <div style={{ minHeight: 92, borderRadius: 'var(--r-md)', background: 'transparent' }} />
  const e: CalendarEvent = ev[day] || {}
  const today = e.today
  return (
    <div
      style={{
        minHeight: 92,
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        background: today ? 'rgba(59,91,255,0.08)' : 'var(--surface-card)',
        border: `1px solid ${today ? 'rgba(59,91,255,0.45)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--r-md)',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            font: `var(--fw-${today ? 'bold' : 'semibold'}) var(--fs-xs)/1 var(--font-mono)`,
            color: today ? 'var(--blue-300)' : 'var(--text-muted)',
          }}
        >
          {day}
        </span>
        {e.a &&
          (e.a.linked ? (
            <Icon name="link" size={11} color="var(--green-500)" />
          ) : (
            <Icon name="unlink" size={11} color="var(--amber-500)" />
          ))}
        {e.adapted && <Icon name="sparkles" size={11} color="var(--violet-400)" />}
      </div>
      {e.p && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 6px',
            borderRadius: 'var(--r-sm)',
            background: `${sportColor(e.p.s)}1a`,
            border: `1px solid ${sportColor(e.p.s)}33`,
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: sportColor(e.p.s), flex: 'none' }} />
          <span
            style={{
              font: 'var(--fw-semibold) 10px/1.25 var(--font-sans)',
              color: 'var(--text-body)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {e.p.t}
          </span>
        </div>
      )}
      {e.a && (
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon name={sportIcon(e.a.s)} size={11} color={e.a.linked ? 'var(--green-500)' : 'var(--amber-500)'} />
          <span style={{ font: 'var(--fw-medium) 9px/1 var(--font-mono)', color: 'var(--text-faint)' }}>{e.a.load} AU</span>
          {!e.a.linked && <span style={{ font: 'var(--fw-semibold) 9px/1 var(--font-sans)', color: 'var(--amber-400)' }}>未关联</span>}
        </div>
      )}
    </div>
  )
}

function MonthCalendar({ data }: { data: ApexData }) {
  const wd = ['一', '二', '三', '四', '五', '六', '日']
  const legend = (
    <div style={{ display: 'flex', gap: 14 }}>
      {(
        [
          ['计划课程', 'var(--blue-400)', 'calendar'],
          ['已关联完成', 'var(--green-500)', 'link'],
          ['待关联', 'var(--amber-500)', 'unlink'],
        ] as const
      ).map(([l, c, ic]) => (
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
          <Icon name={ic} size={12} color={c} />
          {l}
        </span>
      ))}
    </div>
  )
  return (
    <Card title="2026 年 6 月 · 训练日历" action={legend}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
        {wd.map((w, i) => (
          <span
            key={w}
            style={{
              textAlign: 'center',
              font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
              letterSpacing: 'var(--ls-wide)',
              color: i > 4 ? 'var(--text-faint)' : 'var(--text-muted)',
            }}
          >
            {w}
          </span>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {data.calendar.map((d, i) => (
          <MonthCell key={i} day={d} ev={data.calendarEvents} />
        ))}
      </div>
    </Card>
  )
}

// ---------- Link unmatched activity to a planned workout ----------
function LinkModal({ act, targets, onClose }: { act: UnlinkedActivity; targets: LinkTarget[]; onClose: () => void }) {
  const [pick, setPick] = useState(targets[0].id)
  const [done, setDone] = useState(false)
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        background: 'rgba(7,8,11,0.74)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 460,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-lg), var(--inner-top)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '20px 22px',
            borderBottom: '1px solid var(--hairline)',
          }}
        >
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: `${sportColor(act.sport)}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="link" size={18} color={sportColor(act.sport)} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ font: 'var(--fw-bold) var(--fs-lg)/1.1 var(--font-display)', color: 'var(--text-strong)' }}>关联活动到计划</div>
            <div style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-faint)', marginTop: 4 }}>
              {act.name} · {act.date} · {act.source}
            </div>
          </div>
          <IconButton label="关闭" variant="ghost" onClick={onClose}>
            <Icon name="x" size={18} />
          </IconButton>
        </div>
        <div style={{ padding: 22 }}>
          {!done ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, font: 'var(--fw-regular) var(--fs-sm)/1.5 var(--font-sans)', color: 'var(--text-muted)' }}>
                这条由设备同步回来的活动尚未匹配计划。选择它所对应的计划课程，关联后将计入完成度与对比分析。
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {targets.map((t) => {
                  const on = pick === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setPick(t.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px 14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        background: on ? 'rgba(59,91,255,0.10)' : 'var(--surface-inset)',
                        border: `1px solid ${on ? 'var(--accent)' : 'transparent'}`,
                        borderRadius: 'var(--r-md)',
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: `2px solid ${on ? 'var(--accent)' : 'var(--border-strong)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flex: 'none',
                        }}
                      >
                        {on && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />}
                      </span>
                      <Icon name={sportIcon(t.sport)} size={15} color={sportColor(t.sport)} />
                      <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-body)' }}>{t.label}</span>
                    </button>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" onClick={onClose}>
                  取消
                </Button>
                <Button variant="primary" fullWidth iconLeft={<Icon name="link" size={15} />} onClick={() => setDone(true)}>
                  确认关联
                </Button>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                padding: '8px 0',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: 'rgba(24,201,140,0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="check" size={26} color="var(--green-500)" />
              </span>
              <div style={{ font: 'var(--fw-bold) var(--fs-h3)/1.2 var(--font-display)', color: 'var(--text-strong)' }}>已关联</div>
              <p style={{ margin: 0, maxWidth: 320, font: 'var(--fw-regular) var(--fs-sm)/1.5 var(--font-sans)', color: 'var(--text-muted)' }}>
                活动已并入该计划课程，计划完成度与计划/实际对比已更新。
              </p>
              <Button variant="primary" fullWidth onClick={onClose}>
                完成
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function UnlinkedActivities({ data, onLink }: { data: ApexData; onLink: (a: UnlinkedActivity) => void }) {
  if (!data.unlinked.length) return null
  return (
    <Card
      title="未关联活动"
      action={
        <Badge tone="caution" dot>
          {data.unlinked.length} 条待处理
        </Badge>
      }
      padding="none"
    >
      <div style={{ padding: '12px 20px 4px', font: 'var(--fw-regular) var(--fs-xs)/1.5 var(--font-sans)', color: 'var(--text-faint)' }}>
        设备同步回来、但尚未匹配到计划课程的活动。关联后纳入完成度与计划对比分析。
      </div>
      {data.unlinked.map((a) => (
        <div
          key={a.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '34px 1.8fr 1fr 0.8fr 0.8fr 0.9fr auto',
            gap: 14,
            alignItems: 'center',
            padding: '14px 20px',
            borderTop: '1px solid var(--hairline)',
          }}
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
            <Icon name={a.icon} size={16} color="var(--text-muted)" />
          </span>
          <div>
            <div style={{ font: 'var(--fw-semibold) var(--fs-sm)/1.2 var(--font-sans)', color: 'var(--text-strong)' }}>{a.name}</div>
            <div style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-mono)', color: 'var(--text-faint)', marginTop: 3 }}>{a.date}</div>
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)',
              color: 'var(--text-muted)',
            }}
          >
            <Icon name="radio" size={12} color="var(--text-faint)" />
            {a.source}
          </span>
          <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-body)' }}>{a.dist}</span>
          <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-body)' }}>{a.dur}</span>
          <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-strong)' }}>
            {a.load} <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>AU</span>
          </span>
          <Button variant="secondary" size="sm" iconLeft={<Icon name="link" size={14} />} onClick={() => onLink(a)}>
            关联
          </Button>
        </div>
      ))}
    </Card>
  )
}

export interface Props {
  data: ApexData
  onOpenAITrain: () => void
  onOpenAIChat: () => void
  onOpenActivity: (a: Activity) => void
}

export function Training({ data, onOpenAITrain, onOpenAIChat }: Props) {
  const [linkAct, setLinkAct] = useState<UnlinkedActivity | null>(null)
  const plan = data.plan
  const w = data.workout

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
      {/* Plan header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          padding: 22,
          marginBottom: 22,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-md), var(--inner-top)',
        }}
      >
        <ProgressRing value={plan.compliance} sublabel="完成度" size={92} color="var(--green-500)" />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2
              style={{
                margin: 0,
                font: 'var(--fw-bold) var(--fs-h2)/1 var(--font-display)',
                letterSpacing: 'var(--ls-tight)',
                color: 'var(--text-strong)',
              }}
            >
              {plan.week}
            </h2>
            <Badge tone="accent" dot>
              进行中
            </Badge>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 28 }}>
            {(
              [
                ['本周焦点', plan.focus],
                ['计划负荷', '484 AU'],
                ['已完成', '3 / 6 课'],
              ] as const
            ).map(([l, v]) => (
              <div key={l}>
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
                <div style={{ marginTop: 6, font: 'var(--fw-bold) var(--fs-lg)/1 var(--font-sans)', color: 'var(--text-strong)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <Button variant="gradient" iconLeft={<Icon name="sparkles" size={16} />} onClick={onOpenAITrain}>
          AI 生成计划
        </Button>
      </div>

      {/* Week grid */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Icon name="calendar-range" size={16} color="var(--text-muted)" />
        <h3
          style={{
            margin: 0,
            font: 'var(--fw-bold) var(--fs-lg)/1 var(--font-display)',
            letterSpacing: 'var(--ls-tight)',
            color: 'var(--text-strong)',
          }}
        >
          本周安排
        </h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, marginBottom: 24 }}>
        {plan.days.map((d) => (
          <DayCol key={d.d} day={d} />
        ))}
      </div>

      {/* Today's workout + AI coach */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card
          title="今日训练 · 详情"
          action={
            <Badge tone="caution" dot>
              AI 已调整
            </Badge>
          }
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
            <span
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: `${sportColor(w.sport)}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 'none',
              }}
            >
              <Icon name={sportIcon(w.sport)} size={22} color={sportColor(w.sport)} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ font: 'var(--fw-bold) var(--fs-h3)/1.1 var(--font-display)', color: 'var(--text-strong)' }}>{w.title}</div>
              <div style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-faint)', marginTop: 5 }}>{w.when}</div>
            </div>
            <div style={{ display: 'flex', gap: 22 }}>
              {(
                [
                  ['目标负荷', `${w.load} AU`],
                  ['时长', w.duration],
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
                  <div style={{ marginTop: 6, font: 'var(--fw-bold) var(--fs-h3)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              marginBottom: 16,
              background: 'var(--surface-inset)',
              borderRadius: 'var(--r-md)',
            }}
          >
            <Icon name="target" size={15} color="var(--blue-400)" />
            <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-body)' }}>目标区间</span>
            <span style={{ marginLeft: 'auto', font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{w.target}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {w.steps.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: 'var(--surface-card)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--r-md)',
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: 'var(--surface-raised)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    font: 'var(--fw-bold) var(--fs-2xs)/1 var(--font-mono)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>{s.t}</span>
                {s.note && <span style={{ font: 'var(--fw-regular) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>· {s.note}</span>}
                <span style={{ marginLeft: 'auto', font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-muted)' }}>{s.d}</span>
                <span
                  style={{
                    font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
                    color: 'var(--blue-300)',
                    background: 'rgba(59,91,255,0.12)',
                    padding: '4px 7px',
                    borderRadius: 'var(--r-sm)',
                  }}
                >
                  {s.z}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}>
            <Button variant="primary" iconLeft={<Icon name="check" size={15} />}>
              标记完成
            </Button>
            <Button variant="secondary" iconLeft={<Icon name="repeat" size={15} />}>
              替换课程
            </Button>
            <span
              style={{
                marginLeft: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                font: 'var(--fw-medium) var(--fs-xs)/1.3 var(--font-sans)',
                color: 'var(--text-faint)',
              }}
            >
              <Icon name="watch" size={13} color="var(--text-faint)" />
              训练数据完成后由设备自动同步
            </span>
          </div>
        </Card>

        {/* AI coach panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              padding: 18,
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
              <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>AI 适配说明</span>
            </div>
            <p style={{ margin: 0, font: 'var(--fw-regular) var(--fs-sm)/1.55 var(--font-sans)', color: 'var(--text-muted)', textWrap: 'pretty' }}>
              {w.rationale}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 12, borderTop: '1px solid var(--hairline)' }}>
              <Icon name="arrow-down-right" size={15} color="var(--amber-400)" />
              <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1.3 var(--font-sans)', color: 'var(--text-muted)' }}>
                原计划「节奏跑 · 64 AU」已下调为「主动恢复 · 28 AU」
              </span>
            </div>
            <Button variant="secondary" size="sm" fullWidth iconLeft={<Icon name="message-square" size={14} />} onClick={onOpenAIChat}>
              与 AI 专家讨论
            </Button>
          </div>

          <Card title="负荷预警">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name="gauge" size={16} color="var(--amber-500)" />
                <span style={{ flex: 1, font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-body)' }}>ACWR</span>
                <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--amber-400)' }}>1.18</span>
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
                <div style={{ position: 'absolute', left: '55%', width: '20%', top: 0, bottom: 0, background: 'rgba(24,201,140,0.25)' }} />
                <div
                  style={{
                    position: 'absolute',
                    left: `${(1.18 / 1.8) * 100}%`,
                    top: -2,
                    bottom: -2,
                    width: 3,
                    background: 'var(--amber-400)',
                    borderRadius: 2,
                  }}
                />
              </div>
              <span style={{ font: 'var(--fw-regular) var(--fs-xs)/1.4 var(--font-sans)', color: 'var(--text-faint)' }}>
                最佳区间 0.8–1.3。当前接近上限，本周末长距离已被 AI 标记为重点监控。
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Unlinked activities */}
      <div style={{ marginBottom: 24 }}>
        <UnlinkedActivities data={data} onLink={setLinkAct} />
      </div>

      {/* Month calendar board */}
      <MonthCalendar data={data} />

      {linkAct && <LinkModal act={linkAct} targets={data.linkTargets} onClose={() => setLinkAct(null)} />}
    </div>
  )
}
