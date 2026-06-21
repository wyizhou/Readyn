import { useState, useEffect, useRef, Fragment } from 'react'
import { Button } from '../design-system'
import { Icon } from '../components/Icon'
import type { ApexData } from '../lib/types'

// ---------- local types ----------
type MsgRole = 'user' | 'ai'
type Chip = [string, string]

interface Message {
  role: MsgRole
  text: string
  chips?: Chip[]
}

interface DraftDay {
  d: string
  t: string
  s: string
  load: number
}

interface Draft {
  name: string
  goal: string
  weeks: number
  acwr: number
  days: DraftDay[]
}

interface ExpertReply {
  text: string
  chips?: Chip[]
}

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
  ({
    跑步: 'footprints',
    登山: 'mountain',
    抱石: 'grip',
    难度: 'route',
    徒步: 'tent-tree',
    休息: 'moon',
  })[s] || 'circle'

// ---------- shared message bubble ----------
function Msg({ m }: { m: Message }) {
  if (m.role === 'user') {
    return (
      <div
        style={{
          alignSelf: 'flex-end',
          maxWidth: '80%',
          padding: '11px 15px',
          background: 'var(--accent)',
          color: '#fff',
          borderRadius: '14px 14px 4px 14px',
          font: 'var(--fw-medium) var(--fs-sm)/1.5 var(--font-sans)',
          boxShadow: 'var(--inner-top)',
        }}
      >
        {m.text}
      </div>
    )
  }
  return (
    <div style={{ alignSelf: 'flex-start', maxWidth: '88%', display: 'flex', gap: 11 }}>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'var(--grad-brand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
          marginTop: 2,
        }}
      >
        <Icon name="sparkles" size={14} color="#fff" />
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div
          style={{
            padding: '13px 15px',
            background: 'var(--surface-raised)',
            border: '1px solid var(--hairline)',
            borderRadius: '4px 14px 14px 14px',
            font: 'var(--fw-regular) var(--fs-sm)/1.6 var(--font-sans)',
            color: 'var(--text-body)',
            textWrap: 'pretty',
          }}
        >
          {m.text}
        </div>
        {m.chips && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {m.chips.map(([k, v]) => (
              <span
                key={k}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 9px',
                  background: 'var(--surface-inset)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--r-pill)',
                }}
              >
                <span
                  style={{
                    font: 'var(--fw-semibold) 10px/1 var(--font-sans)',
                    letterSpacing: 'var(--ls-wide)',
                    textTransform: 'uppercase',
                    color: 'var(--text-faint)',
                  }}
                >
                  {k}
                </span>
                <span style={{ font: 'var(--fw-bold) var(--fs-xs)/1 var(--font-mono)', color: 'var(--blue-300)' }}>{v}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Typing() {
  return (
    <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 11, alignItems: 'center' }}>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'var(--grad-brand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
        }}
      >
        <Icon name="sparkles" size={14} color="#fff" />
      </span>
      <div style={{ display: 'flex', gap: 4, padding: '14px 16px', background: 'var(--surface-raised)', borderRadius: '4px 14px 14px 14px' }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="apex-dot"
            style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-faint)', animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

function Composer({
  value,
  setValue,
  onSend,
  placeholder,
}: {
  value: string
  setValue: (v: string) => void
  onSend: () => void
  placeholder: string
}) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', padding: '14px 0 0' }}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={1}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
        style={{
          flex: 1,
          resize: 'none',
          maxHeight: 120,
          padding: '13px 15px',
          background: 'var(--surface-inset)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-md)',
          color: 'var(--text-body)',
          font: 'var(--fw-regular) var(--fs-sm)/1.4 var(--font-sans)',
          outline: 'none',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
      />
      <button
        onClick={onSend}
        style={{
          width: 46,
          height: 46,
          flex: 'none',
          borderRadius: 'var(--r-md)',
          border: 'none',
          background: 'var(--accent)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="arrow-up" size={18} color="#fff" />
      </button>
    </div>
  )
}

function Suggestions({ items, onPick }: { items: string[]; onPick: (s: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 12 }}>
      {items.map((s) => (
        <button
          key={s}
          onClick={() => onPick(s)}
          style={{
            font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)',
            color: 'var(--text-muted)',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--r-pill)',
            padding: '8px 13px',
            cursor: 'pointer',
            transition: 'all var(--dur-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-strong)'
            e.currentTarget.style.borderColor = 'var(--border-strong)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)'
            e.currentTarget.style.borderColor = 'var(--border-subtle)'
          }}
        >
          {s}
        </button>
      ))}
    </div>
  )
}

// ---------- AI 对话 (sports-expert chat) ----------
function expertReply(q: string): ExpertReply {
  if (q.includes('减量') || q.includes('恢复') || q.includes('风险') || q.includes('长距离')) {
    return {
      text: '当前 ACWR 1.18、状态 TSB 偏负，疲劳略高于体能。不必整体减量，但把周六长距离爬升控制在 130 AU 内、心率守 Z2，并保证周四主动恢复质量。若周六晨起 HRV 较基线低 8ms 以上，建议降级为中等强度。',
      chips: [
        ['ACWR', '1.18'],
        ['TSB', '−4'],
        ['建议', '局部减载'],
      ],
    }
  }
  if (q.includes('HRV') || q.includes('hrv') || q.includes('趋势')) {
    return {
      text: '近 10 天你的 RMSSD 基线从 64ms 升到 71ms，夜间波动收窄，说明对当前有氧块适应良好。这是承接一个高强度区的好信号——可在 HRV 维持高位的日子安排阈值或抱石极限尝试。',
      chips: [
        ['HRV 基线', '71ms'],
        ['趋势', '+11%'],
        ['信号', '可加量'],
      ],
    }
  }
  if (q.includes('抱石') || q.includes('极限') || q.includes('攀岩') || q.includes('指力')) {
    return {
      text: '距上次最大指力训练已 4 天，上肢负荷处于低位，恢复充分。明天 HRV 预计仍在高位，适合一次抱石极限尝试（V6–V7）。充分热身指力，尝试间歇 3–4 分钟，总尝试控制在 8 次内以保护肌腱。',
      chips: [
        ['指力恢复', '就绪'],
        ['建议强度', 'V6–V7'],
      ],
    }
  }
  if (q.includes('睡眠')) {
    return {
      text: '近 7 晚平均 7.4h、睡眠评分 84，深睡占比稳定在 20% 左右，恢复质量良好。周五一晚偏短（评分 70），与当天的难度课时间偏晚有关，建议高强度训练尽量安排在 20:00 前。',
      chips: [
        ['平均', '7.4h'],
        ['评分', '84'],
      ],
    }
  }
  return {
    text: '我已结合你近 14 天的训练负荷、HRV 与睡眠来看这个问题。整体上体能稳步上升、恢复良好，主要关注点是急性负荷接近高位。需要我把它转化为本周的具体调整吗？',
    chips: [
      ['体能 CTL', '78'],
      ['恢复', '良好'],
    ],
  }
}

function ChatTab({ data, seed, body }: { data: ApexData; seed: Props['seed']; body: Props['body'] }) {
  const t = data.today
  const [msgs, setMsgs] = useState<Message[]>([
    {
      role: 'ai',
      text: '你好，林越。我是你的 AI 运动科学专家，已载入你近 14 天的训练与生理数据。今天就绪度 78、状态均衡。想聊聊本周安排，还是解读某项指标？',
      chips: [
        ['就绪度', '78'],
        ['状态', '均衡'],
      ],
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const lastSeed = useRef<number | null>(null)

  const send = (text?: string) => {
    const q = (text ?? input).trim()
    if (!q) return
    setMsgs((m) => [...m, { role: 'user', text: q }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMsgs((m) => [...m, { role: 'ai', ...expertReply(q) }])
    }, 850)
  }

  useEffect(() => {
    if (!seed || seed.nonce === lastSeed.current) return
    lastSeed.current = seed.nonce
    const q = seed.q.trim()
    if (!q) return
    const t0 = setTimeout(() => {
      setMsgs((m) => [...m, { role: 'user', text: q }])
      setInput('')
      setTyping(true)
      setTimeout(() => {
        setTyping(false)
        setMsgs((m) => [...m, { role: 'ai', ...expertReply(q) }])
      }, 850)
    }, 0)
    return () => clearTimeout(t0)
  }, [seed])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [msgs, typing])

  const ctx: Chip[] = [
    ['就绪度', `${t.readiness}`],
    ['HRV', `${t.hrv}ms`],
    ['周负荷', `${t.weekLoad} AU`],
    ['睡眠', `${t.sleep}h`],
  ]
  if (body) {
    ctx.push(['体重', `${body.weight}kg`])
    ctx.push(['BMI', `${body.bmi}`])
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 920, margin: '0 auto', width: '100%', minHeight: 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 16,
          marginBottom: 4,
          background: 'linear-gradient(135deg, rgba(59,91,255,0.10), rgba(124,77,255,0.08))',
          border: '1px solid rgba(124,77,255,0.28)',
          borderRadius: 'var(--r-lg)',
        }}
      >
        <Icon name="brain" size={18} color="var(--violet-300)" />
        <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-body)' }}>运动科学专家 · 已载入近 14 天数据</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 7 }}>
          {ctx.map(([k, v]) => (
            <span
              key={k}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 9px',
                background: 'var(--surface-card)',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--r-pill)',
              }}
            >
              <span
                style={{
                  font: 'var(--fw-medium) 9px/1 var(--font-sans)',
                  letterSpacing: 'var(--ls-wide)',
                  textTransform: 'uppercase',
                  color: 'var(--text-faint)',
                }}
              >
                {k}
              </span>
              <span style={{ font: 'var(--fw-bold) var(--fs-2xs)/1 var(--font-mono)', color: 'var(--blue-300)' }}>{v}</span>
            </span>
          ))}
        </div>
      </div>
      <div ref={bodyRef} style={{ flex: 1, overflow: 'auto', padding: '16px 4px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
        {msgs.map((m, i) => (
          <Msg key={i} m={m} />
        ))}
        {typing && <Typing />}
      </div>
      <Suggestions items={['本周我该减量吗？', '解读我的 HRV 趋势', '下次抱石何时安排极限尝试？', '我的睡眠怎么样？']} onPick={send} />
      <Composer value={input} setValue={setInput} onSend={() => send()} placeholder="问问你的训练数据，或寻求专家建议…" />
    </div>
  )
}

// ---------- AI 训练 (conversational plan builder) ----------
const baseDraft: Draft = {
  name: '有氧容量强化 · 第 7 周',
  goal: '提升有氧耐力',
  weeks: 1,
  acwr: 1.08,
  days: [
    { d: '周一', t: '阈值间歇 5×1km', s: '跑步', load: 88 },
    { d: '周二', t: '抱石力量 + 指力', s: '抱石', load: 72 },
    { d: '周三', t: '轻松有氧 Z2', s: '跑步', load: 46 },
    { d: '周四', t: '主动恢复', s: '徒步', load: 26 },
    { d: '周五', t: '难度耐力', s: '难度', load: 54 },
    { d: '周六', t: '长距离爬升', s: '登山', load: 128 },
    { d: '周日', t: '完全休息', s: '休息', load: 0 },
  ],
}
const draftLoad = (d: Draft): number => d.days.reduce((s, x) => s + x.load, 0)

function planReply(q: string, setDraft: (fn: (d: Draft) => Draft) => void): ExpertReply {
  if (q.includes('周末') || q.includes('低') || q.includes('减') || q.includes('轻')) {
    setDraft((d) => ({ ...d, acwr: 0.98, days: d.days.map((x) => (x.d === '周六' ? { ...x, t: '中距离爬升', load: 100 } : x)) }))
    return { text: '已把周六长距离爬升从 128 AU 降到 100 AU，周负荷随之下降，ACWR 约 0.98，更稳妥。右侧计划已更新。' }
  }
  if (q.includes('指力') || q.includes('攀岩') || q.includes('增加') || q.includes('力量')) {
    setDraft((d) => ({ ...d, days: d.days.map((x) => (x.d === '周二' ? { ...x, t: '抱石力量 + 指力板', load: 84 } : x)) }))
    return { text: '已强化周二的攀岩课为「抱石力量 + 指力板」并上调到 84 AU。注意指力训练后保证 48 小时恢复窗口，我已把周四保持为主动恢复。' }
  }
  if (q.includes('4 周') || q.includes('4周') || q.includes('周期')) {
    setDraft((d) => ({ ...d, weeks: 4, name: '有氧容量强化 · 4 周周期' }))
    return { text: '已规划为 4 周渐进周期：前两周积累、第三周冲击、第四周减载。右侧展示第 1 周，保存后可在训练库展开全部 4 周。' }
  }
  if (q.includes('保存') || q.includes('可以') || q.includes('好的')) {
    return { text: '好的，点击右侧「保存到训练库」即可，我会把它放进「我的计划」，之后可一键应用到训练日历。' }
  }
  return { text: '收到。我会在保持 ACWR 处于 0.8–1.3 的前提下做调整。你可以告诉我想让哪天更轻/更重、增减某个项目，或直接保存当前计划。' }
}

function DraftRow({ x }: { x: DraftDay }) {
  if (x.s === '休息') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '46px 28px 1fr 58px', gap: 12, alignItems: 'center', padding: '12px 14px' }}>
        <span style={{ font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-muted)' }}>{x.d}</span>
        <Icon name="moon" size={15} color="var(--ink-400)" />
        <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-faint)' }}>{x.t}</span>
        <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-faint)', textAlign: 'right' }}>—</span>
      </div>
    )
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '46px 28px 1fr 58px', gap: 12, alignItems: 'center', padding: '12px 14px' }}>
      <span style={{ font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-muted)' }}>{x.d}</span>
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: 7,
          background: `${sportColor(x.s)}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={sportIcon(x.s)} size={14} color={sportColor(x.s)} />
      </span>
      <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1.3 var(--font-sans)', color: 'var(--text-body)' }}>{x.t}</span>
      <span style={{ font: 'var(--fw-bold) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-strong)', textAlign: 'right' }}>{x.load} AU</span>
    </div>
  )
}

function TrainTab({ onSaved }: { onSaved: Props['onSaved'] }) {
  const [draft, setDraft] = useState<Draft>(baseDraft)
  const [msgs, setMsgs] = useState<Message[]>([
    {
      role: 'ai',
      text: '我已读取你近 90 天的训练负荷、HRV 基线与历史课表。基于目标「提升有氧耐力」，草拟了右侧这周计划——跑步为主、穿插攀岩力量，并控制 ACWR。你可以直接让我调整，比如某天更轻、增加一节攀岩、或改成多周周期。',
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [saved, setSaved] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  const send = (text?: string) => {
    const q = (text ?? input).trim()
    if (!q) return
    setMsgs((m) => [...m, { role: 'user', text: q }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMsgs((m) => [...m, { role: 'ai', ...planReply(q, setDraft) }])
    }, 850)
  }
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [msgs, typing])

  const load = draftLoad(draft)

  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 18, minHeight: 0 }}>
      {/* chat */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            marginBottom: 4,
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--r-md)',
          }}
        >
          <Icon name="database" size={15} color="var(--blue-400)" />
          <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1.4 var(--font-sans)', color: 'var(--text-muted)' }}>
            已结合 · 近 90 天负荷 · HRV 基线 · 睡眠 · 历史课表
          </span>
        </div>
        <div ref={bodyRef} style={{ flex: 1, overflow: 'auto', padding: '14px 4px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
          {msgs.map((m, i) => (
            <Msg key={i} m={m} />
          ))}
          {typing && <Typing />}
        </div>
        <Suggestions items={['周末负荷再低一些', '增加一节指力训练', '改成 4 周周期', '可以了，保存']} onPick={send} />
        <Composer value={input} setValue={setInput} onSend={() => send()} placeholder="描述你的目标或想调整的地方…" />
      </div>

      {/* draft canvas */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--r-lg)',
            boxShadow: 'var(--shadow-md), var(--inner-top)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--hairline)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
                  letterSpacing: 'var(--ls-label)',
                  textTransform: 'uppercase',
                  color: 'var(--violet-300)',
                }}
              >
                AI 草拟计划
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: 'var(--fw-semibold) 10px/1 var(--font-sans)', color: 'var(--text-faint)' }}>
                <span className="apex-live" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-500)' }} />
                实时更新
              </span>
            </div>
            <div style={{ marginTop: 8, font: 'var(--fw-bold) var(--fs-h3)/1.1 var(--font-display)', color: 'var(--text-strong)' }}>{draft.name}</div>
            <div style={{ marginTop: 14, display: 'flex', gap: 24 }}>
              {(
                [
                  ['目标', draft.goal],
                  ['周期', `${draft.weeks} 周`],
                  ['周负荷', `${load} AU`],
                  ['ACWR', draft.acwr.toFixed(2)],
                ] as const
              ).map(([l, v]) => (
                <div key={l}>
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
                  <div
                    style={{
                      marginTop: 5,
                      font: 'var(--fw-bold) var(--fs-md)/1 var(--font-mono)',
                      color: l === 'ACWR' && draft.acwr > 1.3 ? 'var(--amber-400)' : 'var(--text-strong)',
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {draft.days.map((x, i) => (
              <div key={x.d} style={{ borderTop: i ? '1px solid var(--hairline)' : 'none' }}>
                <DraftRow x={x} />
              </div>
            ))}
          </div>
          <div style={{ padding: 16, borderTop: '1px solid var(--hairline)', display: 'flex', gap: 10 }}>
            {saved ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px',
                  background: 'rgba(24,201,140,0.12)',
                  border: '1px solid rgba(24,201,140,0.3)',
                  borderRadius: 'var(--r-md)',
                }}
              >
                <Icon name="check-circle-2" size={16} color="var(--green-500)" />
                <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-body)' }}>已保存到训练库 · 我的计划</span>
              </div>
            ) : (
              <Fragment>
                <Button
                  variant="gradient"
                  fullWidth
                  iconLeft={<Icon name="bookmark" size={16} />}
                  onClick={() => {
                    setSaved(true)
                    setTimeout(() => onSaved && onSaved(), 900)
                  }}
                >
                  保存到训练库
                </Button>
                <Button variant="secondary" iconLeft={<Icon name="calendar-check" size={15} />}>
                  应用到日历
                </Button>
              </Fragment>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export interface Props {
  data: ApexData
  tab: string
  setTab: (t: string) => void
  seed: { q: string; nonce: number } | null
  body: { weight: number; bmi: number }
  onSaved: () => void
}

export function AIModule({ data, tab, setTab, seed, body, onSaved }: Props) {
  const tabs = [
    { id: 'train', label: 'AI 训练', sub: '对话生成课表', icon: 'wand-2' },
    { id: 'chat', label: 'AI 对话', sub: '运动专家解读', icon: 'message-square-text' },
  ]
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 28, minHeight: 0 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flex: 'none' }}>
        {tabs.map((t) => {
          const on = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '12px 18px',
                cursor: 'pointer',
                textAlign: 'left',
                background: on ? 'linear-gradient(135deg, rgba(59,91,255,0.16), rgba(124,77,255,0.14))' : 'var(--surface-card)',
                border: `1px solid ${on ? 'var(--violet-700)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--r-md)',
                transition: 'all var(--dur-fast)',
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: on ? 'var(--grad-brand)' : 'var(--surface-inset)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 'none',
                }}
              >
                <Icon name={t.icon} size={16} color={on ? '#fff' : 'var(--text-muted)'} />
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span
                  style={{
                    font: `var(--fw-bold) var(--fs-sm)/1 var(--font-sans)`,
                    color: on ? 'var(--text-strong)' : 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.label}
                </span>
                <span style={{ font: 'var(--fw-medium) 10px/1 var(--font-sans)', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>{t.sub}</span>
              </span>
            </button>
          )
        })}
      </div>
      {tab === 'train' ? <TrainTab onSaved={onSaved} /> : <ChatTab data={data} seed={seed} body={body} />}
    </div>
  )
}

export default AIModule
