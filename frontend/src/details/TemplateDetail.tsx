import { Card, Badge, Button } from '../design-system'
import { Icon } from '../components/Icon'
import { SpecPin } from '../components/spec/Spec'
import type { ApexData, Template, TemplateDetail as TemplateDetailData, TemplateStructureBlock } from '../lib/types'

const ZC: Record<string, string> = {
  Z1: 'var(--ink-500)',
  Z2: 'var(--blue-500)',
  Z3: 'var(--cyan-500)',
  Z4: 'var(--amber-500)',
  Z5: 'var(--red-500)',
}

interface SportMeta {
  color: string
  icon: string
  label: string
}

const meta: Record<string, SportMeta> = {
  running: { color: 'var(--blue-500)', icon: 'footprints', label: '跑步' },
  climbing: { color: 'var(--cyan-500)', icon: 'grip', label: '攀岩' },
}

// build a fallback structure when no named detail exists
function fallback(tpl: Template, sport: string): TemplateDetailData {
  if (sport === 'climbing')
    return {
      structure: [
        { block: '热身', dur: '15 min', detail: '关节活动 + 渐进激活' },
        { block: '主组', sets: '主训练', target: tpl.target, detail: tpl.desc },
        { block: '放松', dur: '10 min', detail: '拉伸 + 拮抗' },
      ],
      progression: ['循序渐进，按周递增强度'],
      cues: tpl.desc,
    }
  return {
    structure: [
      { block: '热身', dur: '10 min', zone: 'Z1' },
      { block: '主组', dur: tpl.dur, zone: tpl.target.split(' ')[0], detail: tpl.desc },
      { block: '放松', dur: '10 min', zone: 'Z1' },
    ],
    progression: ['按周递增强度或时长'],
    cues: tpl.desc,
  }
}

interface Segment {
  w: number
  c: string
}

// build intensity timeline segments from structure
function segments(structure: TemplateStructureBlock[]): Segment[] {
  const segs: Segment[] = []
  structure.forEach((b) => {
    const z = b.zone ? b.zone.split('–')[0] : null
    if (b.reps) {
      for (let i = 0; i < b.reps; i++) {
        segs.push({ w: 2, c: (b.work && ZC[b.work.zone ?? '']) || 'var(--amber-500)' })
        if (i < b.reps - 1) segs.push({ w: 1.4, c: (b.rest && ZC[b.rest.zone ?? '']) || 'var(--ink-500)' })
      }
    } else if (b.sets) {
      segs.push({ w: 6, c: 'var(--cyan-500)' })
    } else {
      const big = /min/.test(b.dur || '') ? parseInt(b.dur ?? '') : 10
      segs.push({ w: Math.max(1.5, big / 8), c: (z && ZC[z]) || 'var(--ink-500)' })
    }
  })
  return segs
}

function Block({ b }: { b: TemplateStructureBlock }) {
  const isMain = b.block === '主组'
  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        padding: 16,
        background: isMain ? 'var(--surface-raised)' : 'var(--surface-inset)',
        border: `1px solid ${isMain ? 'var(--border-strong)' : 'transparent'}`,
        borderRadius: 'var(--r-md)',
      }}
    >
      <span
        style={{
          width: 4,
          alignSelf: 'stretch',
          borderRadius: 2,
          background: isMain ? 'var(--accent)' : 'var(--border-strong)',
          flex: 'none',
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: b.detail || b.reps ? 8 : 0 }}>
          <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>{b.block}</span>
          {b.dur && <span style={{ font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-muted)' }}>{b.dur}</span>}
          {b.reps && <Badge tone="accent">{b.reps} 组</Badge>}
          {b.sets && <Badge tone="accent">{b.sets}</Badge>}
          {b.zone && (
            <span
              style={{
                font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
                color: ZC[b.zone.split('–')[0]] || 'var(--text-muted)',
                background: 'var(--surface-card)',
                padding: '4px 8px',
                borderRadius: 'var(--r-sm)',
              }}
            >
              {b.zone}
            </span>
          )}
          {b.target && (
            <span
              style={{
                font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-mono)',
                color: 'var(--cyan-400)',
                background: 'var(--surface-card)',
                padding: '4px 8px',
                borderRadius: 'var(--r-sm)',
              }}
            >
              {b.target}
            </span>
          )}
        </div>
        {b.reps && b.work && b.rest ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: 'var(--surface-card)',
                borderRadius: 'var(--r-sm)',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: 2, background: ZC[b.work.zone ?? ''] }} />
              <span style={{ font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-body)' }}>做功 {b.work.dur}</span>
              <span style={{ marginLeft: 'auto', font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-mono)', color: 'var(--text-faint)' }}>
                {b.work.detail}
              </span>
            </div>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: 'var(--surface-card)',
                borderRadius: 'var(--r-sm)',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: 2, background: ZC[b.rest.zone ?? ''] }} />
              <span style={{ font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-body)' }}>恢复 {b.rest.dur}</span>
              <span style={{ marginLeft: 'auto', font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-mono)', color: 'var(--text-faint)' }}>
                {b.rest.detail}
              </span>
            </div>
          </div>
        ) : b.detail ? (
          <span style={{ font: 'var(--fw-regular) var(--fs-xs)/1.5 var(--font-sans)', color: 'var(--text-muted)' }}>{b.detail}</span>
        ) : null}
      </div>
    </div>
  )
}

export interface TemplateDetailProps {
  data: ApexData
  tpl: Template
  sport: string
  onAddToPlan: () => void
  onToast: (msg: string) => void
}

export function TemplateDetail({ data, tpl, sport, onAddToPlan, onToast }: TemplateDetailProps) {
  const m = meta[sport] || meta.running
  const det = data.templateDetails[tpl.id] || fallback(tpl, sport)
  const climb = sport === 'climbing'
  const segs = segments(det.structure)
  const totW = segs.reduce((a, s) => a + s.w, 0)
  const history = [
    { date: '2026-06-15', outcome: climb ? '极限 V6 · 完攀 ×3' : '配速达标 · HR 漂移 4%' },
    { date: '2026-06-01', outcome: climb ? 'V5 巩固' : '末组掉速 2s' },
    { date: '2026-05-18', outcome: climb ? '指力激活充分' : '达标' },
  ]

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
            background: `${m.color}22`,
            border: `1px solid ${m.color}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
          }}
        >
          <Icon name={m.icon} size={24} color={m.color} />
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
              {tpl.name}
            </h1>
            <SpecPin
              n={1}
              title="模板详情入口"
              field="library[sport][i] · template.id"
              state="route: detail = {type:'template', tpl, sport}"
              event="训练库卡片点击 → onOpenTemplate(tpl, sport)"
              api="GET /api/templates/:id"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <span
              style={{
                font: 'var(--fw-semibold) 10px/1 var(--font-sans)',
                letterSpacing: 'var(--ls-wide)',
                textTransform: 'uppercase',
                color: m.color,
                background: `${m.color}1a`,
                padding: '5px 9px',
                borderRadius: 'var(--r-pill)',
              }}
            >
              {tpl.type}
            </span>
            <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-muted)' }}>{tpl.target}</span>
          </div>
          <p
            style={{
              margin: '12px 0 0',
              font: 'var(--fw-regular) var(--fs-sm)/1.55 var(--font-sans)',
              color: 'var(--text-muted)',
              maxWidth: 620,
              textWrap: 'pretty',
            }}
          >
            {tpl.desc}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 22 }}>
            {(
              [
                ['负荷', `${tpl.load} AU`],
                ['时长', tpl.dur],
                ['已用', `${tpl.uses} 次`],
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
            <Button variant="secondary" size="sm" iconLeft={<Icon name="pencil" size={14} />} onClick={() => onToast('已进入模板编辑')}>
              编辑
            </Button>
            <Button variant="gradient" size="sm" iconLeft={<Icon name="calendar-plus" size={14} />} onClick={onAddToPlan}>
              加入计划
            </Button>
          </div>
        </div>
      </div>

      {/* structure */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Icon name="list-tree" size={16} color="var(--text-muted)" />
        <h2
          style={{
            margin: 0,
            font: 'var(--fw-bold) var(--fs-lg)/1 var(--font-display)',
            letterSpacing: 'var(--ls-tight)',
            color: 'var(--text-strong)',
          }}
        >
          训练结构
        </h2>
        <SpecPin
          n={2}
          title="结构定义"
          field="templateDetails[id].structure[] {block,reps,work,rest|sets|dur,zone}"
          state="可编辑 · 拖拽排序"
          event="编辑 → 结构编辑器"
          api="PUT /api/templates/:id/structure"
        />
      </div>
      <Card style={{ marginBottom: 22 }}>
        {!climb && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', height: 16, borderRadius: 'var(--r-sm)', overflow: 'hidden', gap: 2, marginBottom: 8 }}>
              {segs.map((s, i) => (
                <div key={i} title="" style={{ flex: s.w / totW, background: s.c }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              {['Z1', 'Z2', 'Z4'].map((z) => (
                <span
                  key={z}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)',
                    color: 'var(--text-faint)',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: ZC[z] }} />
                  {z}
                </span>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {det.structure.map((b, i) => (
            <Block key={i} b={b} />
          ))}
        </div>
      </Card>

      {/* progression + cues + history */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <Card
          title="进阶安排"
          action={<SpecPin n={3} title="周期进阶" field="templateDetails[id].progression[]" state="—" event="无" api="—" />}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {det.progression.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    background: 'var(--surface-inset)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    font: 'var(--fw-bold) 10px/1 var(--font-mono)',
                    color: 'var(--text-muted)',
                    flex: 'none',
                    marginTop: 1,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1.5 var(--font-sans)', color: 'var(--text-body)' }}>{p}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="执行要点">
          <div
            style={{
              display: 'flex',
              gap: 10,
              padding: 14,
              background: 'rgba(255,176,32,0.08)',
              border: '1px solid rgba(255,176,32,0.24)',
              borderRadius: 'var(--r-md)',
            }}
          >
            <Icon name="lightbulb" size={16} color="var(--amber-400)" />
            <span style={{ font: 'var(--fw-regular) var(--fs-xs)/1.55 var(--font-sans)', color: 'var(--text-body)', textWrap: 'pretty' }}>
              {det.cues}
            </span>
          </div>
        </Card>
        <Card
          title="使用历史"
          action={
            <SpecPin
              n={4}
              title="历史完成记录"
              field="template.history[] (聚合自 activities)"
              state="—"
              event="点击跳活动详情"
              api="GET /api/templates/:id/history"
            />
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {history.map((h, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 0',
                  borderTop: i ? '1px solid var(--hairline)' : 'none',
                }}
              >
                <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-faint)', flex: 'none' }}>
                  {h.date}
                </span>
                <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1.3 var(--font-sans)', color: 'var(--text-muted)' }}>{h.outcome}</span>
                <Icon name="chevron-right" size={14} color="var(--text-faint)" style={{ marginLeft: 'auto' }} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
