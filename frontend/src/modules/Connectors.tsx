import { useState } from 'react'
import type { ReactNode } from 'react'
import { Card, Badge, Button, Tabs, IconButton } from '../design-system'
import type { BadgeTone } from '../design-system'
import { Icon } from '../components/Icon'
import { api } from '../lib/api'
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

function Field({ label, type, value, onChange, placeholder, autoFocus }: { label: string; type: string; value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{label}</span>
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)', background: 'var(--surface-inset)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: '11px 13px', outline: 'none' }}
      />
    </label>
  )
}

function parseErr(e: Error): string {
  // sendJSON throws "POST /path → 400"; surface a friendlier hint.
  const m = /→ (\d+)/.exec(e.message)
  const code = m ? m[1] : ''
  if (code === '400') return '缺少凭证：请填写账号密码，或在 backend/.env 配置后重试。'
  if (code === '502') return '佳明登录/同步失败：请检查账号密码、网络可达性或验证码。'
  if (code === '409') return '尚未连接账号。'
  return '连接失败，请稍后重试。'
}

// Real account login against connect.garmin.cn (garth). Garmin China has no OAuth
// redirect, so we collect the 佳明 account credentials (or fall back to the
// server-side backend/.env) and let the backend log in, handle MFA, and sync.
function ConnectModal({ src, onClose, onDone, onToast }: { src: Connector; onClose: () => void; onDone: () => void; onToast: (m: string) => void }) {
  const [phase, setPhase] = useState<'creds' | 'mfa' | 'done'>('creds')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [mfaToken, setMfaToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ activities?: number; hrv?: number; sleep?: number; weight?: number } | null>(null)

  const submitCreds = () => {
    setBusy(true)
    setError('')
    api
      .garminConnect(email || undefined, password || undefined)
      .then((r) => {
        if (r.needsMfa && r.mfaToken) {
          setMfaToken(r.mfaToken)
          setPhase('mfa')
        } else {
          setResult(r)
          setPhase('done')
        }
      })
      .catch((e: Error) => setError(parseErr(e)))
      .finally(() => setBusy(false))
  }

  const submitMfa = () => {
    setBusy(true)
    setError('')
    api
      .garminMfa(mfaToken, code)
      .then((r) => {
        setResult(r)
        setPhase('done')
      })
      .catch((e: Error) => setError(parseErr(e)))
      .finally(() => setBusy(false))
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(7,8,11,0.74)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 480, maxHeight: '86vh', overflow: 'auto', background: 'var(--surface-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-lg), var(--inner-top)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '22px 24px', borderBottom: '1px solid var(--hairline)' }}>
          <SourceLogo c={src.color} icon={src.icon} size={44} />
          <div style={{ flex: 1 }}>
            <div style={{ font: 'var(--fw-bold) var(--fs-lg)/1.2 var(--font-display)', color: 'var(--text-strong)' }}>连接 {src.name}</div>
            <div style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-faint)', marginTop: 4 }}>{src.cat} · 账号登录</div>
          </div>
          <IconButton label="关闭" variant="ghost" onClick={onClose}><Icon name="x" size={18} /></IconButton>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 13px', marginBottom: 16, background: 'rgba(240,79,79,0.1)', border: '1px solid rgba(240,79,79,0.3)', borderRadius: 'var(--r-md)' }}>
              <Icon name="alert-triangle" size={15} color="var(--red-400)" />
              <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1.45 var(--font-sans)', color: 'var(--text-body)' }}>{error}</span>
            </div>
          )}

          {phase === 'creds' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, font: 'var(--fw-regular) var(--fs-sm)/1.55 var(--font-sans)', color: 'var(--text-muted)' }}>使用你的<strong style={{ color: 'var(--text-body)' }}>佳明中国区</strong>账号登录，Readyn 将只读同步活动、HRV、睡眠、心率与体重。凭证仅用于登录、不被存储；留空则使用服务器端 .env 配置。</p>
              <Field label="佳明账号 (邮箱/手机)" type="text" value={email} onChange={setEmail} placeholder="name@example.com" autoFocus />
              <Field label="密码" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
              <Button variant="gradient" fullWidth disabled={busy} iconLeft={<Icon name="shield-check" size={16} />} onClick={submitCreds}>{busy ? '登录中…' : '登录并同步'}</Button>
            </div>
          )}

          {phase === 'mfa' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, font: 'var(--fw-regular) var(--fs-sm)/1.55 var(--font-sans)', color: 'var(--text-muted)' }}>该账号开启了两步验证，请输入佳明发送的验证码。</p>
              <Field label="验证码" type="text" value={code} onChange={setCode} placeholder="6 位验证码" autoFocus />
              <Button variant="primary" fullWidth disabled={busy || !code} onClick={submitMfa}>{busy ? '验证中…' : '提交验证码'}</Button>
            </div>
          )}

          {phase === 'done' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '12px 0 4px', textAlign: 'center' }}>
              <span style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(24,201,140,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={30} color="var(--green-500)" /></span>
              <div style={{ font: 'var(--fw-bold) var(--fs-h3)/1.2 var(--font-display)', color: 'var(--text-strong)' }}>{src.name} 已连接</div>
              <p style={{ margin: 0, maxWidth: 360, font: 'var(--fw-regular) var(--fs-sm)/1.5 var(--font-sans)', color: 'var(--text-muted)' }}>
                已同步 {result?.activities ?? 0} 项活动、{result?.hrv ?? 0} 天 HRV、{result?.sleep ?? 0} 晚睡眠、{result?.weight ?? 0} 条体重。看板与训练模块已纳入这些数据。
              </p>
              <Button variant="primary" fullWidth onClick={() => { onToast('佳明数据已同步'); onDone() }}>完成</Button>
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
  onConnect: (id: string) => void
  onToast: (msg: string) => void
}

interface StatTuple {
  l: string
  v: ReactNode
  ic: string
  c: string
}

export function Connectors({ data, tab, setTab, onOpenConnector, onConnect, onToast }: ConnectorsProps) {
  const [modal, setModal] = useState<Connector | null>(null)
  const connected = data.connectors.filter((c) => c.status !== 'available')
  const available = data.connectors.filter((c) => c.status === 'available')
  const totalRecords = connected.reduce((s, c) => s + (parseInt(String(c.records).replace(/,/g, '')) || 0), 0)
  // Derived from real state — no fabricated coverage/sync values.
  const coverage = data.schema.length
    ? `${Math.round(data.schema.reduce((s, r) => s + r.coverage, 0) / data.schema.length)}%`
    : '—'
  const lastSync = connected.find((c) => c.sync && c.sync !== '—')?.sync ?? '—'

  const stats: StatTuple[] = [
    { l: '已连接数据源', v: connected.length, ic: 'plug-zap', c: 'var(--blue-400)' },
    { l: '累计记录', v: totalRecords.toLocaleString(), ic: 'database', c: 'var(--violet-400)' },
    { l: '规范字段覆盖', v: coverage, ic: 'git-merge', c: 'var(--green-400)' },
    { l: '上次同步', v: lastSync, ic: 'refresh-cw', c: 'var(--cyan-500)' },
  ]

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 22 }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          {connected.map((s) => <SourceCard key={s.id} src={s} onConnect={setModal} onConfig={onOpenConnector} />)}
        </div>
      )}
      {tab === 'market' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
            {available.map((s) => <SourceCard key={s.id} src={s} onConnect={setModal} onConfig={setModal} />)}
          </div>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14, padding: 20, border: '1px dashed var(--border-strong)', borderRadius: 'var(--r-lg)' }}>
            <Icon name="code-2" size={20} color="var(--violet-400)" />
            <div style={{ flex: 1 }}>
              <div style={{ font: 'var(--fw-bold) var(--fs-sm)/1.2 var(--font-sans)', color: 'var(--text-strong)' }}>没有你的设备？</div>
              <div style={{ font: 'var(--fw-regular) var(--fs-xs)/1.4 var(--font-sans)', color: 'var(--text-muted)', marginTop: 3 }}>任何遵循统一规范的数据源都能通过开放 API / Webhook 自助接入。</div>
            </div>
            <Button variant="secondary" iconLeft={<Icon name="book-open" size={15} />} onClick={() => onToast('接入文档已在新窗口打开')}>查看接入文档</Button>
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

      {modal && (
        <ConnectModal
          src={modal}
          onClose={() => setModal(null)}
          onToast={onToast}
          onDone={() => {
            onConnect(modal.id)
            setModal(null)
          }}
        />
      )}
    </div>
  )
}
