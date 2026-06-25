import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Card, Badge, Button, Tabs, IconButton } from '../design-system'
import type { BadgeTone } from '../design-system'
import { Icon } from '../components/Icon'
import { EmptyState } from '../components/EmptyState'
import { api } from '../lib/api'
import type { GarminConnectResult } from '../lib/api'
import type { ApexData, Connector, ConnectorStatus, SchemaRow } from '../lib/types'

const STATUS: Record<ConnectorStatus, { tone: BadgeTone; label: string }> = {
  connected: { tone: 'positive', label: '已连接' },
  syncing: { tone: 'accent', label: '同步中' },
  available: { tone: 'neutral', label: '可连接' },
}

const isAccount = (src: Connector): boolean => src.auth === 'account' || src.id.includes('garmin')
const hostOf = (src: Connector): string => src.host || 'connect.garmin.cn'

function SourceLogo({ c, icon, size = 40 }: { c: string; icon: string; size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: 10, background: `${c}22`, border: `1px solid ${c}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
      <Icon name={icon} size={size * 0.5} color={c} />
    </span>
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

const inputStyle: React.CSSProperties = {
  height: 44,
  padding: '0 14px',
  background: 'var(--surface-inset)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--r-md)',
  color: 'var(--text-body)',
  font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)',
  outline: 'none',
  width: '100%',
}

function Lab({ children }: { children: ReactNode }) {
  return <span style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{children}</span>
}

function Spinner() {
  return <span style={{ width: 42, height: 42, borderRadius: '50%', border: '3px solid var(--surface-raised)', borderTopColor: 'var(--blue-500)', animation: 'apexspin 0.8s linear infinite' }} />
}

type LoginPhase = 'login' | 'verifying' | 'mfa' | 'syncing' | 'success' | 'error'

// Real Garmin China login (connect.garmin.cn) — credentials → MFA → server-side
// sync. The backend logs in, handles MFA, and syncs; the frontend only holds the
// login state. Credentials are used to log in and are not stored by Readyn.
function GarminLogin({ src, onClose, onConnected, onToast }: { src: Connector; onClose: () => void; onConnected: () => void; onToast: (m: string) => void }) {
  const [phase, setPhase] = useState<LoginPhase>('login')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [code, setCode] = useState<string[]>(['', '', '', '', '', ''])
  const [mfaToken, setMfaToken] = useState('')
  const [err, setErr] = useState('')
  const [result, setResult] = useState<GarminConnectResult | null>(null)
  const codeRefs = useRef<(HTMLInputElement | null)[]>([])

  const submitLogin = () => {
    if (!email || !pw) {
      setErr('请输入账号与密码')
      return
    }
    setErr('')
    setPhase('verifying')
    api
      .garminConnect(email, pw)
      .then((r) => {
        if (r.needsMfa && r.mfaToken) {
          setMfaToken(r.mfaToken)
          setPhase('mfa')
        } else {
          setResult(r)
          setPhase('success')
        }
      })
      .catch((e: Error) => {
        setErr(parseErr(e))
        setPhase('error')
      })
  }

  const setDigit = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return
    const next = [...code]
    next[i] = v
    setCode(next)
    if (v && i < 5) codeRefs.current[i + 1]?.focus()
  }

  const submitMfa = () => {
    const c = code.join('')
    if (c.length < 6) {
      setErr('请输入完整的 6 位验证码')
      return
    }
    setErr('')
    setPhase('syncing')
    api
      .garminMfa(mfaToken, c)
      .then((r) => {
        setResult(r)
        setPhase('success')
      })
      .catch((e: Error) => {
        setErr(parseErr(e))
        setPhase('error')
      })
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(7,8,11,0.78)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 460, background: 'var(--surface-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-lg), var(--inner-top)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '22px 24px', borderBottom: '1px solid var(--hairline)' }}>
          <SourceLogo c={src.color} icon={src.icon} size={44} />
          <div style={{ flex: 1 }}>
            <div style={{ font: 'var(--fw-bold) var(--fs-lg)/1.2 var(--font-display)', color: 'var(--text-strong)' }}>登录 {src.name}</div>
            <div style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-faint)', marginTop: 4 }}>{hostOf(src)} · 真实账号</div>
          </div>
          <IconButton label="关闭" variant="ghost" onClick={onClose}>
            <Icon name="x" size={18} />
          </IconButton>
        </div>

        <div style={{ padding: 24 }}>
          {phase === 'login' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 13px', background: 'var(--surface-inset)', borderRadius: 'var(--r-md)' }}>
                <Icon name="shield-check" size={15} color="var(--green-500)" />
                <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1.4 var(--font-sans)', color: 'var(--text-muted)' }}>
                  账号仅用于登录佳明并同步数据，<b style={{ color: 'var(--text-body)' }}>Readyn 不存储你的密码</b>。
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <Lab>佳明账号（邮箱/手机）</Lab>
                <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoFocus />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <Lab>密码</Lab>
                <div style={{ position: 'relative' }}>
                  <input style={inputStyle} type={showPw ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="输入密码" onKeyDown={(e) => { if (e.key === 'Enter') submitLogin() }} />
                  <button onClick={() => setShowPw((s) => !s)} style={{ position: 'absolute', right: 8, top: 7, width: 30, height: 30, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={showPw ? 'eye-off' : 'eye'} size={16} />
                  </button>
                </div>
              </div>
              {err && <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--red-400)' }}>{err}</span>}
              <Button variant="gradient" fullWidth iconLeft={<Icon name="log-in" size={16} />} onClick={submitLogin}>
                登录并授权同步
              </Button>
              <span style={{ font: 'var(--fw-regular) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>中国区账号请使用 connect.garmin.cn；支持两步验证。</span>
            </div>
          )}

          {phase === 'verifying' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '28px 0' }}>
              <Spinner />
              <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-muted)' }}>正在验证账号…</span>
            </div>
          )}

          {phase === 'mfa' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ font: 'var(--fw-bold) var(--fs-md)/1.2 var(--font-display)', color: 'var(--text-strong)' }}>两步验证</span>
                <span style={{ font: 'var(--fw-regular) var(--fs-sm)/1.5 var(--font-sans)', color: 'var(--text-muted)' }}>验证码已发送至你的佳明账号绑定方式，请输入 6 位验证码。</span>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                {code.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      codeRefs.current[i] = el
                    }}
                    value={d}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !d && i > 0) codeRefs.current[i - 1]?.focus()
                      if (e.key === 'Enter') submitMfa()
                    }}
                    maxLength={1}
                    inputMode="numeric"
                    aria-label={`验证码第 ${i + 1} 位`}
                    style={{ width: 54, height: 60, textAlign: 'center', background: 'var(--surface-inset)', border: `1px solid ${d ? 'var(--accent)' : 'var(--border-subtle)'}`, borderRadius: 'var(--r-md)', color: 'var(--text-strong)', font: 'var(--fw-bold) var(--fs-h2)/1 var(--font-mono)', outline: 'none' }}
                  />
                ))}
              </div>
              {err && <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--red-400)' }}>{err}</span>}
              <Button variant="primary" fullWidth onClick={submitMfa}>
                验证
              </Button>
            </div>
          )}

          {phase === 'syncing' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '28px 0' }}>
              <Spinner />
              <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1.4 var(--font-sans)', color: 'var(--text-muted)', textAlign: 'center' }}>登录成功，正在同步活动与健康数据…</span>
            </div>
          )}

          {phase === 'success' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '8px 0', textAlign: 'center' }}>
              <span style={{ width: 60, height: 60, borderRadius: 15, background: 'rgba(24,201,140,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={28} color="var(--green-500)" />
              </span>
              <div style={{ font: 'var(--fw-bold) var(--fs-h3)/1.2 var(--font-display)', color: 'var(--text-strong)' }}>已连接佳明(CN)</div>
              <p style={{ margin: 0, maxWidth: 340, font: 'var(--fw-regular) var(--fs-sm)/1.5 var(--font-sans)', color: 'var(--text-muted)' }}>
                已同步 {result?.activities ?? 0} 项活动、{result?.hrv ?? 0} 天 HRV、{result?.sleep ?? 0} 晚睡眠、{result?.weight ?? 0} 条体重。历史数据将在后台继续回填。
              </p>
              <Button variant="primary" fullWidth onClick={() => { onToast('佳明数据已同步'); onConnected(); onClose() }}>
                进入看板
              </Button>
            </div>
          )}

          {phase === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '8px 0', textAlign: 'center' }}>
              <span style={{ width: 60, height: 60, borderRadius: 15, background: 'rgba(255,77,94,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="triangle-alert" size={28} color="var(--red-500)" />
              </span>
              <div style={{ font: 'var(--fw-bold) var(--fs-h3)/1.2 var(--font-display)', color: 'var(--text-strong)' }}>登录失败</div>
              <p style={{ margin: 0, maxWidth: 340, font: 'var(--fw-regular) var(--fs-sm)/1.5 var(--font-sans)', color: 'var(--text-muted)' }}>
                {err || '账号或密码错误，请检查后重试。若多次失败，请确认使用的是中国区账号。'}
              </p>
              <Button variant="primary" fullWidth onClick={() => { setPhase('login'); setErr(''); setCode(['', '', '', '', '', '']) }}>
                重试
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Other sources have no real integration yet — a simulated OAuth redirect.
function OAuthModal({ src, onClose, onToast }: { src: Connector; onClose: () => void; onToast: (m: string) => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(7,8,11,0.74)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 440, background: 'var(--surface-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-lg), var(--inner-top)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center' }}>
        <SourceLogo c={src.color} icon={src.icon} size={48} />
        <div style={{ font: 'var(--fw-bold) var(--fs-lg)/1.2 var(--font-display)', color: 'var(--text-strong)' }}>连接 {src.name}</div>
        <p style={{ margin: 0, font: 'var(--fw-regular) var(--fs-sm)/1.5 var(--font-sans)', color: 'var(--text-muted)' }}>将跳转 {src.name} 官方授权页（OAuth），授权后数据将映射到 Readyn 统一模型。</p>
        <Button variant="gradient" fullWidth iconLeft={<Icon name="external-link" size={15} />} onClick={() => { onToast(`已打开 ${src.name} 授权页`); onClose() }}>
          前往授权
        </Button>
        <Button variant="ghost" fullWidth onClick={onClose}>
          取消
        </Button>
      </div>
    </div>
  )
}

function SourceCard({ src, onConnect, onConfig }: { src: Connector; onConnect: (src: Connector) => void; onConfig: (src: Connector) => void }) {
  const st = STATUS[src.status]
  const linked = src.status !== 'available'
  const account = isAccount(src)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 18, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--inner-top)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <SourceLogo c={src.color} icon={src.icon} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: 'var(--fw-bold) var(--fs-sm)/1.2 var(--font-sans)', color: 'var(--text-strong)' }}>{src.name}</div>
          <div style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)', marginTop: 4 }}>{src.cat}</div>
        </div>
        <Badge tone={st.tone} dot={linked}>
          {st.label}
        </Badge>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {src.metrics.slice(0, 6).map((m) => (
          <span key={m} style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-muted)', background: 'var(--surface-inset)', padding: '5px 9px', borderRadius: 'var(--r-sm)' }}>
            {m}
          </span>
        ))}
        {src.metrics.length > 6 && <span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)', padding: '5px 4px' }}>+{src.metrics.length - 6}</span>}
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
          {linked ? (
            <Button variant="secondary" size="sm" iconLeft={<Icon name="sliders-horizontal" size={14} />} onClick={() => onConfig(src)}>
              配置
            </Button>
          ) : (
            <Button variant="primary" size="sm" iconLeft={<Icon name={account ? 'log-in' : 'plus'} size={14} />} onClick={() => onConnect(src)}>
              {account ? '登录连接' : '连接'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function SchemaView({ schema }: { schema: SchemaRow[] }) {
  return (
    <Card padding="none">
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 2fr 1.1fr', gap: 14, alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--hairline)' }}>
        {['规范字段', '类型', '来源', '覆盖率'].map((h) => (
          <span key={h} style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
            {h}
          </span>
        ))}
      </div>
      {schema.map((row, i) => (
        <div key={row.canonical} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 2fr 1.1fr', gap: 14, alignItems: 'center', padding: '14px 20px', borderTop: i ? '1px solid var(--hairline)' : 'none' }}>
          <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--blue-300)' }}>{row.canonical}</span>
          <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-faint)' }}>{row.type}</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {row.sources.map((s) => (
              <span key={s} style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-muted)', background: 'var(--surface-inset)', padding: '4px 8px', borderRadius: 'var(--r-sm)' }}>
                {s}
              </span>
            ))}
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
  connected: boolean
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

export function Connectors({ data, tab, setTab, connected, onOpenConnector, onConnect, onToast }: ConnectorsProps) {
  const [loginSrc, setLoginSrc] = useState<Connector | null>(null)
  const [oauthSrc, setOauthSrc] = useState<Connector | null>(null)

  const garmin = data.connectors.find((c) => isAccount(c)) ?? data.connectors[0]
  const linked = data.connectors.filter((c) => c.status !== 'available')

  const openConnect = (src: Connector) => (isAccount(src) ? setLoginSrc(src) : setOauthSrc(src))

  const totalRecords = linked.reduce((s, c) => s + (parseInt(String(c.records).replace(/,/g, '')) || 0), 0)
  const lastSync = linked.find((c) => c.sync && c.sync !== '—')?.sync ?? '—'
  // Real derivation — activities whose load came from a subjective RPE method
  // are the ones a user could refine by logging RPE.
  const pendingRpe = data.activities.filter((a) => a.loadSrc === '主观 RPE' || a.loadSrc === '容量 + RPE').length

  const modals = (
    <>
      {loginSrc && (
        <GarminLogin
          src={loginSrc}
          onClose={() => setLoginSrc(null)}
          onToast={onToast}
          onConnected={() => onConnect(loginSrc.id)}
        />
      )}
      {oauthSrc && <OAuthModal src={oauthSrc} onClose={() => setOauthSrc(null)} onToast={onToast} />}
    </>
  )

  // ---- not connected: empty state + connectable sources ----
  if (!connected) {
    return (
      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
        <EmptyState
          icon="plug-zap"
          title="尚未连接佳明"
          desc="Readyn 以佳明（中国区）为主数据源。连接后将自动同步你的全部运动、HRV、睡眠与就绪度。"
          actionLabel="登录佳明（中国区）"
          onAction={() => garmin && setLoginSrc(garmin)}
        />
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, padding: 14, background: 'var(--surface-card)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--r-lg)' }}>
          <Icon name="plug-zap" size={16} color="var(--text-faint)" />
          <span style={{ font: 'var(--fw-regular) var(--fs-xs)/1.5 var(--font-sans)', color: 'var(--text-faint)' }}>更多数据源即将开放。</span>
        </div>
        {modals}
      </div>
    )
  }

  // ---- connected: derived stats + tabs ----
  const stats: StatTuple[] = [
    { l: '已连接数据源', v: linked.length, ic: 'plug-zap', c: 'var(--blue-400)' },
    { l: '累计记录', v: totalRecords.toLocaleString(), ic: 'database', c: 'var(--violet-400)' },
    { l: '上次同步', v: lastSync, ic: 'refresh-cw', c: 'var(--cyan-500)' },
    { l: '待补录 RPE', v: pendingRpe, ic: 'gauge', c: 'var(--amber-400)' },
  ]

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 22 }}>
        {stats.map(({ l, v, ic, c }) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--inner-top)' }}>
            <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--surface-inset)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Icon name={ic} size={18} color={c} />
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{l}</span>
              <span style={{ font: 'var(--fw-bold) var(--fs-h3)/1 var(--font-mono)', color: 'var(--text-strong)' }}>{v}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 18 }}>
        <Tabs
          variant="pill"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'connected', label: '已连接', count: linked.length },
            { value: 'schema', label: '统一规范', count: data.schema.length },
          ]}
        />
      </div>

      {tab !== 'schema' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
            {linked.map((s) => (
              <SourceCard key={s.id} src={s} onConnect={openConnect} onConfig={onOpenConnector} />
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, padding: 16, border: '1px dashed var(--border-strong)', borderRadius: 'var(--r-lg)' }}>
            <Icon name="plug-zap" size={16} color="var(--text-faint)" />
            <span style={{ font: 'var(--fw-regular) var(--fs-xs)/1.5 var(--font-sans)', color: 'var(--text-faint)' }}>更多数据源即将开放 —— 当前以佳明（中国区）为唯一数据源。</span>
          </div>
        </>
      )}
      {tab === 'schema' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'rgba(59,91,255,0.08)', border: '1px solid rgba(59,91,255,0.24)', borderRadius: 'var(--r-lg)' }}>
            <Icon name="info" size={18} color="var(--blue-400)" />
            <span style={{ font: 'var(--fw-regular) var(--fs-sm)/1.5 var(--font-sans)', color: 'var(--text-muted)' }}>
              所有数据源都会被转换为 Readyn 统一数据模型，<span style={{ color: 'var(--text-body)', fontWeight: 600 }}>同一指标无论来自哪个设备都可比、可合并</span>。这是连接器层的核心契约。
            </span>
          </div>
          {data.schema.length ? (
            <SchemaView schema={data.schema} />
          ) : (
            <EmptyState compact inline icon="git-merge" title="暂无规范字段" desc="完成首次同步后，这里展示各数据源到统一模型的字段映射与覆盖率。" />
          )}
        </div>
      )}
      {modals}
    </div>
  )
}
