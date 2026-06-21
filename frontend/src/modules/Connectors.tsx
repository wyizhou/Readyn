import { useState } from 'react'
import type { ReactNode } from 'react'
import { Card, Badge, Button, Tabs, Switch, IconButton } from '../design-system'
import type { BadgeTone } from '../design-system'
import { Icon } from '../components/Icon'
import type { ApexData, Connector, ConnectorStatus, SchemaRow } from '../lib/types'

const STATUS: Record<ConnectorStatus, { tone: BadgeTone; label: string; dot: string }> = {
  connected: { tone: 'positive', label: '已连接', dot: 'var(--green-500)' },
  syncing: { tone: 'accent', label: '同步中', dot: 'var(--blue-400)' },
  available: { tone: 'neutral', label: '可连接', dot: 'var(--ink-500)' },
}

function SourceLogo({ c, icon, size = 40 }: { c: string; icon: string; size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: 10, background: `${c}22`, border: `1px solid ${c}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
      <Icon name={icon} size={size * 0.5} color={c} />
    </span>
  )
}

function MapRow({ from, to, on, top }: { from: string; to: string; on: boolean; top: boolean }) {
  const [checked, setChecked] = useState(on)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 22px 1fr 52px', gap: 10, alignItems: 'center', padding: '12px 14px', borderTop: top ? '1px solid var(--hairline)' : 'none', opacity: checked ? 1 : 0.5 }}>
      <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1.3 var(--font-mono)', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{from}</span>
      <Icon name="arrow-right" size={13} color="var(--text-faint)" />
      <span style={{ font: 'var(--fw-semibold) var(--fs-xs)/1.3 var(--font-mono)', color: 'var(--blue-300)', wordBreak: 'break-all' }}>{to}</span>
      <Switch checked={checked} onChange={setChecked} />
    </div>
  )
}

function ConnectModal({ src, onClose }: { src: Connector; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const steps = ['授权账户', '字段映射', '完成']
  const mapRows: [string, string, boolean][] = [
    ['heart_rate_variability', 'recovery.hrv_rmssd', true],
    ['sleep_stages', 'sleep.stages', true],
    ['activity_load', 'activity.load', true],
    ['vo2max', 'fitness.vo2max', false],
  ]
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(7,8,11,0.74)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 540, maxHeight: '86vh', overflow: 'auto', background: 'var(--surface-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-lg), var(--inner-top)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '22px 24px', borderBottom: '1px solid var(--hairline)' }}>
          <SourceLogo c={src.color} icon={src.icon} size={44} />
          <div style={{ flex: 1 }}>
            <div style={{ font: 'var(--fw-bold) var(--fs-lg)/1.2 var(--font-display)', color: 'var(--text-strong)' }}>连接 {src.name}</div>
            <div style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-faint)', marginTop: 4 }}>{src.cat} · 统一规范 v2</div>
          </div>
          <IconButton label="关闭" variant="ghost" onClick={onClose}><Icon name="x" size={18} /></IconButton>
        </div>

        {/* step rail */}
        <div style={{ display: 'flex', gap: 8, padding: '16px 24px' }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ height: 3, borderRadius: 2, background: i <= step ? 'var(--accent)' : 'var(--surface-inset)' }} />
              <span style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', color: i <= step ? 'var(--text-body)' : 'var(--text-faint)' }}>{i + 1}. {s}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: '8px 24px 24px' }}>
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ margin: 0, font: 'var(--fw-regular) var(--fs-sm)/1.55 var(--font-sans)', color: 'var(--text-muted)' }}>Readyn 通过官方 OAuth 安全读取你的训练与恢复数据，仅请求所需范围，可随时撤销。</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['活动与训练负荷', '心率与 HRV', '睡眠与恢复'].map((p) => (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--surface-inset)', borderRadius: 'var(--r-md)' }}>
                    <Icon name="check" size={15} color="var(--green-500)" />
                    <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-body)' }}>{p}</span>
                    <span style={{ marginLeft: 'auto', font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-mono)', color: 'var(--text-faint)' }}>只读</span>
                  </div>
                ))}
              </div>
              <Button variant="gradient" fullWidth iconLeft={<Icon name="shield-check" size={16} />} onClick={() => setStep(1)}>使用 {src.name} 授权</Button>
            </div>
          )}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, font: 'var(--fw-regular) var(--fs-sm)/1.5 var(--font-sans)', color: 'var(--text-muted)' }}>已识别字段并自动映射到 Readyn 统一数据模型。可关闭不需要同步的字段。</p>
              <div style={{ border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 22px 1fr 52px', gap: 10, alignItems: 'center', padding: '10px 14px', background: 'var(--surface-inset)' }}>
                  {['源字段', '', 'Readyn 规范字段', '同步'].map((h, i) => <span key={i} style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{h}</span>)}
                </div>
                {mapRows.map(([from, to, on], i) => <MapRow key={from} from={from} to={to} on={on} top={i > 0} />)}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" onClick={() => setStep(0)}>返回</Button>
                <Button variant="primary" fullWidth onClick={() => setStep(2)}>确认映射并同步</Button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '12px 0 4px', textAlign: 'center' }}>
              <span style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(24,201,140,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={30} color="var(--green-500)" /></span>
              <div style={{ font: 'var(--fw-bold) var(--fs-h3)/1.2 var(--font-display)', color: 'var(--text-strong)' }}>{src.name} 已连接</div>
              <p style={{ margin: 0, maxWidth: 360, font: 'var(--fw-regular) var(--fs-sm)/1.5 var(--font-sans)', color: 'var(--text-muted)' }}>历史数据正在后台导入，约需几分钟。完成后看板与训练模块会自动纳入这些数据。</p>
              <Button variant="primary" fullWidth onClick={onClose}>完成</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SourceCard({ src, onConnect, onConfig }: { src: Connector; onConnect: (src: Connector) => void; onConfig: (src: Connector) => void }) {
  const st = STATUS[src.status]
  const connected = src.status !== 'available'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 18, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--inner-top)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <SourceLogo c={src.color} icon={src.icon} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: 'var(--fw-bold) var(--fs-sm)/1.2 var(--font-sans)', color: 'var(--text-strong)' }}>{src.name}</div>
          <div style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)', marginTop: 4 }}>{src.cat}</div>
        </div>
        <Badge tone={st.tone} dot={src.status !== 'available'}>{st.label}</Badge>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {src.metrics.map((m) => <span key={m} style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-muted)', background: 'var(--surface-inset)', padding: '5px 9px', borderRadius: 'var(--r-sm)' }}>{m}</span>)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 12, borderTop: '1px solid var(--hairline)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ font: 'var(--fw-medium) 10px/1 var(--font-sans)', letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>记录</span>
          <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-body)' }}>{src.records}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ font: 'var(--fw-medium) 10px/1 var(--font-sans)', letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>同步</span>
          <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: src.status === 'syncing' ? 'var(--blue-300)' : 'var(--text-muted)' }}>{src.sync}</span>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {connected
            ? <Button variant="secondary" size="sm" iconLeft={<Icon name="sliders-horizontal" size={14} />} onClick={() => onConfig(src)}>配置</Button>
            : <Button variant="primary" size="sm" iconLeft={<Icon name="plus" size={14} />} onClick={() => onConnect(src)}>连接</Button>}
        </div>
      </div>
    </div>
  )
}

function SchemaView({ schema }: { schema: SchemaRow[] }) {
  return (
    <Card padding="none">
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 2fr 1.1fr', gap: 14, alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--hairline)' }}>
        {['规范字段', '类型', '来源', '覆盖率'].map((h) => <span key={h} style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{h}</span>)}
      </div>
      {schema.map((row, i) => (
        <div key={row.canonical} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 2fr 1.1fr', gap: 14, alignItems: 'center', padding: '14px 20px', borderTop: i ? '1px solid var(--hairline)' : 'none' }}>
          <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--blue-300)' }}>{row.canonical}</span>
          <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-faint)' }}>{row.type}</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {row.sources.map((s) => <span key={s} style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-muted)', background: 'var(--surface-inset)', padding: '4px 8px', borderRadius: 'var(--r-sm)' }}>{s}</span>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 6, background: 'var(--surface-inset)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
              <div style={{ width: `${row.coverage}%`, height: '100%', background: row.coverage >= 90 ? 'var(--green-500)' : 'var(--amber-500)', borderRadius: 'var(--r-pill)' }} />
            </div>
            <span style={{ font: 'var(--fw-bold) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-strong)', width: 34, textAlign: 'right' }}>{row.coverage}%</span>
          </div>
        </div>
      ))}
    </Card>
  )
}

export interface ConnectorsProps {
  data: ApexData
  tab: string
  setTab: (t: string) => void
  onOpenConnector: (src: Connector) => void
}

interface StatTuple {
  l: string
  v: ReactNode
  ic: string
  c: string
}

export function Connectors({ data, tab, setTab, onOpenConnector }: ConnectorsProps) {
  const [modal, setModal] = useState<Connector | null>(null)
  const connected = data.connectors.filter((c) => c.status !== 'available')
  const available = data.connectors.filter((c) => c.status === 'available')
  const totalRecords = connected.reduce((s, c) => s + (parseInt(String(c.records).replace(/,/g, '')) || 0), 0)

  const stats: StatTuple[] = [
    { l: '已连接数据源', v: connected.length, ic: 'plug-zap', c: 'var(--blue-400)' },
    { l: '累计记录', v: totalRecords.toLocaleString(), ic: 'database', c: 'var(--violet-400)' },
    { l: '规范字段覆盖', v: '92%', ic: 'git-merge', c: 'var(--green-400)' },
    { l: '上次同步', v: '2 分钟前', ic: 'refresh-cw', c: 'var(--cyan-500)' },
  ]

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
        {stats.map(({ l, v, ic, c }) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--inner-top)' }}>
            <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--surface-inset)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={ic} size={18} color={c} /></span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{l}</span>
              <span style={{ font: 'var(--fw-bold) var(--fs-h3)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{v}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 18 }}>
        <Tabs variant="pill" value={tab} onChange={setTab} tabs={[
          { value: 'connected', label: '已连接', count: connected.length },
          { value: 'market', label: '数据源市场', count: available.length },
          { value: 'schema', label: '统一规范', count: data.schema.length },
        ]} />
      </div>

      {tab === 'connected' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {connected.map((s) => <SourceCard key={s.id} src={s} onConnect={setModal} onConfig={onOpenConnector} />)}
        </div>
      )}
      {tab === 'market' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {available.map((s) => <SourceCard key={s.id} src={s} onConnect={setModal} onConfig={setModal} />)}
          </div>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14, padding: 20, border: '1px dashed var(--border-strong)', borderRadius: 'var(--r-lg)' }}>
            <Icon name="code-2" size={20} color="var(--violet-400)" />
            <div style={{ flex: 1 }}>
              <div style={{ font: 'var(--fw-bold) var(--fs-sm)/1.2 var(--font-sans)', color: 'var(--text-strong)' }}>没有你的设备？</div>
              <div style={{ font: 'var(--fw-regular) var(--fs-xs)/1.4 var(--font-sans)', color: 'var(--text-muted)', marginTop: 3 }}>任何遵循统一规范的数据源都能通过开放 API / Webhook 自助接入。</div>
            </div>
            <Button variant="secondary" iconLeft={<Icon name="book-open" size={15} />}>查看接入文档</Button>
          </div>
        </>
      )}
      {tab === 'schema' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'rgba(59,91,255,0.08)', border: '1px solid rgba(59,91,255,0.24)', borderRadius: 'var(--r-lg)' }}>
            <Icon name="info" size={18} color="var(--blue-400)" />
            <span style={{ font: 'var(--fw-regular) var(--fs-sm)/1.5 var(--font-sans)', color: 'var(--text-muted)' }}>所有数据源都会被转换为 Readyn 统一数据模型，<span style={{ color: 'var(--text-body)', fontWeight: 600 }}>同一指标无论来自哪个设备都可比、可合并</span>。这是连接器层的核心契约。</span>
          </div>
          <SchemaView schema={data.schema} />
        </div>
      )}

      {modal && <ConnectModal src={modal} onClose={() => setModal(null)} />}
    </div>
  )
}
