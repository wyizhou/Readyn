import { useState } from 'react'
import { Card, Badge, Button, Switch } from '../design-system'
import { Icon } from '../components/Icon'
import { SpecPin } from '../components/spec/Spec'
import type { Connector } from '../lib/types'

const CANON: Record<string, string> = {
  '跑步': 'activity.load',
  '活动': 'activity.summary',
  '训练': 'activity.load',
  'HRV': 'recovery.hrv_rmssd',
  '睡眠': 'sleep.stages',
  '心率': 'heart.zones',
  '登山': 'activity.load',
  '爬升': 'elevation.gain',
  '气压': 'env.pressure',
  '路线': 'route.latlng',
  '配速': 'activity.pace',
  '恢复': 'recovery.score',
  '强度': 'activity.strain',
  '抱石': 'climb.send',
  '难度': 'climb.send',
  '完攀': 'climb.send',
  '体温': 'recovery.temp',
  '全部': '*',
}

function MapRow({ from, to, on, top }: { from: string; to: string; on: boolean; top: boolean }) {
  const [checked, setChecked] = useState(on)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 22px 1.2fr 52px', gap: 10, alignItems: 'center', padding: '13px 16px', borderTop: top ? '1px solid var(--hairline)' : 'none', opacity: checked ? 1 : 0.5 }}>
      <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1.3 var(--font-mono)', color: 'var(--text-muted)' }}>{from}</span>
      <Icon name="arrow-right" size={13} color="var(--text-faint)" />
      <span style={{ font: 'var(--fw-semibold) var(--fs-xs)/1.3 var(--font-mono)', color: 'var(--blue-300)' }}>{to}</span>
      <Switch checked={checked} onChange={setChecked} />
    </div>
  )
}

function ToggleRow({ label, desc, on }: { label: string; desc?: string; on: boolean }) {
  const [v, setV] = useState(on)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
      <div style={{ flex: 1 }}>
        <div style={{ font: 'var(--fw-semibold) var(--fs-sm)/1.2 var(--font-sans)', color: 'var(--text-strong)' }}>{label}</div>
        {desc && <div style={{ font: 'var(--fw-regular) var(--fs-xs)/1.4 var(--font-sans)', color: 'var(--text-faint)', marginTop: 4 }}>{desc}</div>}
      </div>
      <Switch checked={v} onChange={setV} />
    </div>
  )
}

function Select({ value, options }: { value: string; options: string[] }) {
  const [v, setV] = useState(value)
  return (
    <select value={v} onChange={(e) => setV(e.target.value)} style={{ height: 38, padding: '0 12px', background: 'var(--surface-inset)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', color: 'var(--text-body)', font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)', outline: 'none', appearance: 'none', minWidth: 140 }}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

interface SyncLogEntry {
  t: string
  st: 'ok' | 'warn'
  n: string
  dur: string
}

export interface ConnectorDetailProps {
  src: Connector
  onSync: () => void
  onBackfill: () => void
  onDisconnect: () => void
}

export function ConnectorDetail({ src, onSync, onBackfill, onDisconnect }: ConnectorDetailProps) {
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const rows: [string, string, boolean][] = src.metrics.map((m) => [
    m === '全部' ? 'all_fields' : m === '跑步' ? 'activity_running' : `field_${m}`,
    CANON[m] || `ext.${m}`,
    true,
  ])
  const scopes = ['活动与训练数据', '心率与 HRV', '睡眠与恢复', src.metrics.includes('路线') || src.metrics.includes('登山') ? '位置 / 路线' : null].filter(Boolean) as string[]
  const history: SyncLogEntry[] = [
    { t: src.sync, st: 'ok', n: '+18 条', dur: '1.2s' },
    { t: '今天 06:05', st: 'ok', n: '+42 条', dur: '2.0s' },
    { t: '昨天 21:30', st: 'ok', n: '+6 条', dur: '0.8s' },
    { t: '昨天 06:10', st: 'warn', n: '0 条', dur: '超时重试' },
    { t: '前天 20:15', st: 'ok', n: '+24 条', dur: '1.5s' },
  ]
  const stMap: Record<'ok' | 'warn', [string, string]> = {
    ok: ['var(--green-500)', 'check'],
    warn: ['var(--amber-500)', 'triangle-alert'],
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: 24, marginBottom: 18, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-md), var(--inner-top)' }}>
        <span style={{ width: 56, height: 56, borderRadius: 14, background: `${src.color}22`, border: `1px solid ${src.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={src.icon} size={26} color={src.color} /></span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0, font: 'var(--fw-bold) var(--fs-h2)/1.05 var(--font-display)', letterSpacing: 'var(--ls-tight)', color: 'var(--text-strong)' }}>{src.name}</h1>
            <Badge tone={src.status === 'syncing' ? 'accent' : 'positive'} dot>{src.status === 'syncing' ? '同步中' : '已连接'}</Badge>
            <SpecPin n={1} title="连接器配置入口" field="connectors[i] · src.id · OAuth token" state="route: detail = {type:'connector', src}" event="连接器卡片「配置」→ onOpenConnector(src)" api="GET /api/connectors/:id" />
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
            {([['类别', src.cat], ['累计记录', src.records], ['上次同步', src.sync]] as const).map(([l, v]) => (
              <div key={l}><div style={{ font: 'var(--fw-medium) 10px/1 var(--font-sans)', letterSpacing: 'var(--ls-wide)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{l}</div><div style={{ marginTop: 5, font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-body)' }}>{v}</div></div>
            ))}
          </div>
        </div>
        <Button variant="primary" iconLeft={<Icon name="refresh-cw" size={15} />} onClick={onSync}>立即同步</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* field mapping */}
        <Card title="字段映射" action={<SpecPin n={2} title="字段映射" field="connector.mapping[] {source, canonical, enabled}" state="映射到 Readyn 统一模型" event="开关切换字段同步" api="PUT /api/connectors/:id/mapping" />} padding="none">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 22px 1.2fr 52px', gap: 10, padding: '11px 16px', borderBottom: '1px solid var(--hairline)' }}>
            {['源字段', '', 'Readyn 规范字段', '同步'].map((h, i) => <span key={i} style={{ font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{h}</span>)}
          </div>
          {rows.map((r, i) => <MapRow key={i} from={r[0]} to={r[1]} on={r[2]} top={i > 0} />)}
        </Card>

        {/* sync settings */}
        <Card title="同步设置" action={<SpecPin n={3} title="同步配置" field="connector.config {autoSync, frequency, conflict}" state="持久化" event="改动即存" api="PUT /api/connectors/:id/config" />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <ToggleRow label="自动同步" desc="后台定时拉取新数据" on={true} />
            <div style={{ borderTop: '1px solid var(--hairline)' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
              <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>同步频率</span>
              <Select value="每 15 分钟" options={['实时 (Webhook)', '每 15 分钟', '每小时', '每天', '仅手动']} />
            </div>
            <div style={{ borderTop: '1px solid var(--hairline)' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
              <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>冲突策略</span>
              <Select value="以设备为准" options={['以设备为准', '以 Readyn 为准', '保留两者']} />
            </div>
            <div style={{ borderTop: '1px solid var(--hairline)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0' }}>
              <div style={{ flex: 1 }}>
                <div style={{ font: 'var(--fw-semibold) var(--fs-sm)/1.2 var(--font-sans)', color: 'var(--text-strong)' }}>历史回填</div>
                <div style={{ font: 'var(--fw-regular) var(--fs-xs)/1.4 var(--font-sans)', color: 'var(--text-faint)', marginTop: 4 }}>导入更早的历史活动</div>
              </div>
              <Button variant="secondary" size="sm" iconLeft={<Icon name="download" size={14} />} onClick={onBackfill}>回填</Button>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        {/* sync history */}
        <Card title="同步日志" action={<SpecPin n={4} title="同步事件" field="connector.syncLog[] {time, status, added, duration}" state="近 N 次 · 服务端记录" event="无" api="GET /api/connectors/:id/logs" />} padding="none">
          {history.map((h, i) => {
            const s = stMap[h.st]
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1.4fr 1fr 1fr', gap: 12, alignItems: 'center', padding: '13px 18px', borderTop: i ? '1px solid var(--hairline)' : 'none' }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, background: `${s[0]}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={s[1]} size={12} color={s[0]} /></span>
                <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-muted)' }}>{h.t}</span>
                <span style={{ font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-mono)', color: h.st === 'ok' ? 'var(--green-400)' : 'var(--amber-400)' }}>{h.n}</span>
                <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-faint)', textAlign: 'right' }}>{h.dur}</span>
              </div>
            )
          })}
        </Card>

        {/* permissions + danger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="授权范围" action={<SpecPin n={5} title="OAuth Scopes" field="connector.scopes[] (只读)" state="OAuth 授权" event="可单项撤销" api="OAuth revoke" />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {scopes.map((s) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--surface-inset)', borderRadius: 'var(--r-md)' }}>
                  <Icon name="check" size={14} color="var(--green-500)" />
                  <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-body)' }}>{s}</span>
                  <span style={{ marginLeft: 'auto', font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-mono)', color: 'var(--text-faint)' }}>只读</span>
                </div>
              ))}
            </div>
          </Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18, background: 'rgba(255,77,94,0.06)', border: '1px solid rgba(255,77,94,0.28)', borderRadius: 'var(--r-lg)' }}>
            <Icon name="unplug" size={18} color="var(--red-500)" />
            <div style={{ flex: 1 }}>
              <div style={{ font: 'var(--fw-bold) var(--fs-sm)/1.2 var(--font-sans)', color: 'var(--text-strong)' }}>断开连接</div>
              <div style={{ font: 'var(--fw-regular) var(--fs-xs)/1.4 var(--font-sans)', color: 'var(--text-faint)', marginTop: 3 }}>停止同步并撤销授权，已导入数据保留</div>
            </div>
            <button onClick={() => setConfirmDisconnect(true)} style={{ height: 36, padding: '0 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--red-500)', background: 'transparent', color: 'var(--red-400)', cursor: 'pointer', font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-sans)' }}>断开</button>
          </div>
        </div>
      </div>

      {confirmDisconnect && (
        <div onClick={() => setConfirmDisconnect(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(7,8,11,0.78)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 420, background: 'var(--surface-card)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-lg), var(--inner-top)', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,77,94,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <Icon name="unplug" size={19} color="var(--red-500)" />
              </span>
              <div style={{ font: 'var(--fw-bold) var(--fs-lg)/1.2 var(--font-display)', color: 'var(--text-strong)' }}>断开 {src.name}？</div>
            </div>
            <p style={{ margin: 0, font: 'var(--fw-regular) var(--fs-sm)/1.55 var(--font-sans)', color: 'var(--text-muted)' }}>
              将停止同步并撤销授权，已导入的数据会保留。重新连接需再次登录佳明账号并通过两步验证。
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
              <Button variant="secondary" size="sm" onClick={() => setConfirmDisconnect(false)}>
                取消
              </Button>
              <button
                onClick={() => {
                  setConfirmDisconnect(false)
                  onDisconnect()
                }}
                style={{ height: 36, padding: '0 16px', borderRadius: 'var(--r-md)', border: 'none', background: 'var(--red-500)', color: '#fff', cursor: 'pointer', font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)' }}
              >
                确认断开
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
