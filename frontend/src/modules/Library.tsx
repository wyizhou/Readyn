import { Fragment, useState } from 'react'
import { Badge, Button, Tabs, IconButton } from '../design-system'
import { Icon } from '../components/Icon'
import type { ApexData, Template, LibraryPlan } from '../lib/types'

interface SportMeta {
  color: string
  icon: string
  label: string
}

const sportMeta: Record<string, SportMeta> = {
  running: { color: 'var(--blue-500)', icon: 'footprints', label: '跑步' },
  climbing: { color: 'var(--cyan-500)', icon: 'grip', label: '攀岩' },
}

const sportColor = (s: string): string =>
  ({ 跑步: 'var(--blue-500)', 登山: 'var(--violet-500)', 抱石: 'var(--cyan-500)', 难度: 'var(--green-500)', 徒步: 'var(--amber-500)' })[s] ||
  'var(--ink-500)'
const sportIcon = (s: string): string =>
  ({ 跑步: 'footprints', 登山: 'mountain', 抱石: 'grip', 难度: 'route', 徒步: 'tent-tree' })[s] || 'circle'

function TemplateCard({ tpl, meta, onOpen }: { tpl: Template; meta: SportMeta; onOpen: () => void }) {
  const [added, setAdded] = useState(false)
  return (
    <div
      onClick={onOpen}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 18,
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--inner-top)',
        cursor: 'pointer',
        transition: 'border-color var(--dur-fast), transform var(--dur-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-strong)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)'
        e.currentTarget.style.transform = 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${meta.color}22`,
            border: `1px solid ${meta.color}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
          }}
        >
          <Icon name={meta.icon} size={20} color={meta.color} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: 'var(--fw-bold) var(--fs-sm)/1.25 var(--font-sans)', color: 'var(--text-strong)' }}>{tpl.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span
              style={{
                font: 'var(--fw-semibold) 10px/1 var(--font-sans)',
                letterSpacing: 'var(--ls-wide)',
                textTransform: 'uppercase',
                color: meta.color,
                background: `${meta.color}1a`,
                padding: '4px 8px',
                borderRadius: 'var(--r-pill)',
              }}
            >
              {tpl.type}
            </span>
            <span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>{tpl.target}</span>
          </div>
        </div>
      </div>
      <p
        style={{
          margin: 0,
          font: 'var(--fw-regular) var(--fs-xs)/1.55 var(--font-sans)',
          color: 'var(--text-muted)',
          textWrap: 'pretty',
          minHeight: 40,
        }}
      >
        {tpl.desc}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 12, borderTop: '1px solid var(--hairline)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span
            style={{
              font: 'var(--fw-medium) 10px/1 var(--font-sans)',
              letterSpacing: 'var(--ls-wide)',
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
            }}
          >
            负荷
          </span>
          <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-body)' }}>{tpl.load} AU</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span
            style={{
              font: 'var(--fw-medium) 10px/1 var(--font-sans)',
              letterSpacing: 'var(--ls-wide)',
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
            }}
          >
            时长
          </span>
          <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-body)' }}>{tpl.dur}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span
            style={{
              font: 'var(--fw-medium) 10px/1 var(--font-sans)',
              letterSpacing: 'var(--ls-wide)',
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
            }}
          >
            已用
          </span>
          <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-body)' }}>{tpl.uses} 次</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <IconButton
            label={added ? '已加入计划' : '加入计划'}
            variant={added ? 'ghost' : 'outline'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setAdded(true)
              setTimeout(() => setAdded(false), 1600)
            }}
          >
            <Icon name={added ? 'check' : 'calendar-plus'} size={15} color={added ? 'var(--green-500)' : undefined} />
          </IconButton>
          <IconButton
            label="查看"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onOpen()
            }}
          >
            <Icon name="chevron-right" size={16} />
          </IconButton>
        </div>
      </div>
    </div>
  )
}

function PlanCard({ plan, onOpen, onApply }: { plan: LibraryPlan; onOpen: () => void; onApply: () => void }) {
  return (
    <div
      onClick={onOpen}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: 18,
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--inner-top)',
        cursor: 'pointer',
        transition: 'border-color var(--dur-fast)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
    >
      <span
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          background: 'var(--grad-brand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
          boxShadow: 'var(--shadow-glow)',
        }}
      >
        <Icon name="route" size={22} color="#fff" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ font: 'var(--fw-bold) var(--fs-md)/1.2 var(--font-display)', color: 'var(--text-strong)' }}>{plan.name}</span>
          {plan.source === 'AI' ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                font: 'var(--fw-semibold) 10px/1 var(--font-sans)',
                color: 'var(--violet-300)',
                background: 'rgba(124,77,255,0.16)',
                padding: '4px 8px',
                borderRadius: 'var(--r-pill)',
              }}
            >
              <Icon name="sparkles" size={11} color="var(--violet-300)" />
              AI 生成
            </span>
          ) : (
            <Badge tone="neutral">手动</Badge>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7 }}>
          <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-muted)' }}>目标 · {plan.goal}</span>
          <span style={{ display: 'flex', gap: 4 }}>
            {plan.sports.map((s) => (
              <span
                key={s}
                title={s}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  background: `${sportColor(s)}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={sportIcon(s)} size={11} color={sportColor(s)} />
              </span>
            ))}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 26 }}>
        {(
          [
            ['周期', `${plan.weeks} 周`],
            ['总负荷', `${plan.load} AU`],
            ['课程', `${plan.sessions} 节`],
            ['更新', plan.updated],
          ] as const
        ).map(([l, v]) => (
          <div key={l} style={{ textAlign: 'right' }}>
            <div
              style={{
                font: 'var(--fw-medium) 10px/1 var(--font-sans)',
                letterSpacing: 'var(--ls-wide)',
                textTransform: 'uppercase',
                color: 'var(--text-faint)',
              }}
            >
              {l}
            </div>
            <div style={{ marginTop: 5, font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{v}</div>
          </div>
        ))}
      </div>
      <Button
        variant="secondary"
        size="sm"
        iconLeft={<Icon name="calendar-check" size={14} />}
        onClick={(e) => {
          e.stopPropagation()
          onApply()
        }}
      >
        应用
      </Button>
    </div>
  )
}

export interface LibraryProps {
  data: ApexData
  tab: string
  setTab: (t: string) => void
  onNewFromAI: () => void
  onOpenTemplate: (tpl: Template, sport: string) => void
  onOpenPlan: (plan: LibraryPlan) => void
  onApplyPlan: (plan: LibraryPlan) => void
}

export function Library({ data, tab, setTab, onNewFromAI, onOpenTemplate, onOpenPlan, onApplyPlan }: LibraryProps) {
  const lib = data.library
  const counts = { running: lib.running.length, climbing: lib.climbing.length, plans: lib.plans.length }
  const sportTab = tab === 'running' || tab === 'climbing' ? tab : null
  const templates: Template[] = sportTab === 'running' ? lib.running : sportTab === 'climbing' ? lib.climbing : []

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
        <Tabs
          variant="pill"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'running', label: '跑步', count: counts.running },
            { value: 'climbing', label: '攀岩', count: counts.climbing },
            { value: 'plans', label: '我的计划', count: counts.plans },
          ]}
        />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <Button variant="gradient" iconLeft={<Icon name="sparkles" size={15} />} onClick={onNewFromAI}>
            AI 生成计划
          </Button>
          <Button variant="secondary" iconLeft={<Icon name="plus" size={15} />} onClick={onNewFromAI}>
            新建模板
          </Button>
        </div>
      </div>

      {sportTab && (
        <Fragment>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 16,
              padding: '14px 18px',
              background: `${sportMeta[sportTab].color}12`,
              border: `1px solid ${sportMeta[sportTab].color}33`,
              borderRadius: 'var(--r-lg)',
            }}
          >
            <Icon name={sportMeta[sportTab].icon} size={18} color={sportMeta[sportTab].color} />
            <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1.4 var(--font-sans)', color: 'var(--text-body)' }}>
              {sportTab === 'running'
                ? '跑步训练模板 — 间歇、节奏、长距离与恢复，覆盖有氧到无氧全光谱。'
                : '攀岩训练模板 — 抱石力量、指力、耐力与爆发力，兼顾难度与抱石。'}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
            {templates.map((t) => (
              <TemplateCard key={t.id} tpl={t} meta={sportMeta[sportTab]} onOpen={() => onOpenTemplate(t, sportTab)} />
            ))}
          </div>
        </Fragment>
      )}

      {tab === 'plans' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 4,
              padding: '14px 18px',
              background: 'rgba(124,77,255,0.08)',
              border: '1px solid rgba(124,77,255,0.24)',
              borderRadius: 'var(--r-lg)',
            }}
          >
            <Icon name="info" size={18} color="var(--violet-400)" />
            <span style={{ font: 'var(--fw-regular) var(--fs-sm)/1.5 var(--font-sans)', color: 'var(--text-muted)' }}>
              多周期训练计划集合。
              <span style={{ color: 'var(--text-body)', fontWeight: 600 }}>AI 对话生成的课表会自动保存到这里</span>
              ，可一键应用到训练日历。
            </span>
          </div>
          {lib.plans.map((p) => (
            <PlanCard key={p.id} plan={p} onOpen={() => onOpenPlan(p)} onApply={() => onApplyPlan(p)} />
          ))}
        </div>
      )}
    </div>
  )
}
