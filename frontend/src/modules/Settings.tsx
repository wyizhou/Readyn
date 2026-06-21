import { useState, Fragment } from 'react'
import type { ReactNode } from 'react'
import { Card, Badge, Button, Switch } from '../design-system'
import { Icon } from '../components/Icon'
import { SpecPin } from '../components/spec/Spec'
import type { Profile, SettingsDoc } from '../lib/types'

interface NavItem {
  id: string
  icon: string
  label: string
}

const NAV: NavItem[] = [
  { id: 'units', icon: 'ruler', label: '单位' },
  { id: 'hr', icon: 'heart-pulse', label: '心率区间' },
  { id: 'notify', icon: 'bell', label: '通知与提醒' },
  { id: 'privacy', icon: 'shield', label: '隐私与授权' },
  { id: 'data', icon: 'database', label: '数据与账户' },
  { id: 'theme', icon: 'palette', label: '外观' },
]

interface SegProps {
  value: string
  setValue: (v: string) => void
  options: string[]
}

function Seg({ value, setValue, options }: SegProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: 3,
        padding: 3,
        background: 'var(--surface-inset)',
        borderRadius: 'var(--r-md)',
      }}
    >
      {options.map((o) => {
        const on = value === o
        return (
          <button
            key={o}
            onClick={() => setValue(o)}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--r-sm)',
              border: 'none',
              cursor: 'pointer',
              background: on ? 'var(--surface-raised)' : 'transparent',
              color: on ? 'var(--text-strong)' : 'var(--text-muted)',
              font: `var(--fw-${on ? 'bold' : 'medium'}) var(--fs-xs)/1 var(--font-sans)`,
              boxShadow: on ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--dur-fast)',
            }}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}

function Row({ label, desc, children }: { label: ReactNode; desc?: ReactNode; children?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0' }}>
      <div style={{ flex: 1 }}>
        <div style={{ font: 'var(--fw-semibold) var(--fs-sm)/1.2 var(--font-sans)', color: 'var(--text-strong)' }}>
          {label}
        </div>
        {desc && (
          <div
            style={{
              font: 'var(--fw-regular) var(--fs-xs)/1.4 var(--font-sans)',
              color: 'var(--text-faint)',
              marginTop: 4,
            }}
          >
            {desc}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

function Divider() {
  return <div style={{ borderTop: '1px solid var(--hairline)' }} />
}

function ToggleRow({
  label,
  desc,
  on,
  onChange,
}: {
  label: ReactNode
  desc?: ReactNode
  on: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <Row label={label} desc={desc}>
      <Switch checked={on} onChange={onChange} />
    </Row>
  )
}

function SectionHead({ title, pin, desc }: { title: ReactNode; pin?: ReactNode; desc?: ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h2
          style={{
            margin: 0,
            font: 'var(--fw-bold) var(--fs-h3)/1 var(--font-display)',
            letterSpacing: 'var(--ls-tight)',
            color: 'var(--text-strong)',
          }}
        >
          {title}
        </h2>
        {pin}
      </div>
      {desc && (
        <p
          style={{
            margin: '8px 0 0',
            font: 'var(--fw-regular) var(--fs-sm)/1.5 var(--font-sans)',
            color: 'var(--text-faint)',
          }}
        >
          {desc}
        </p>
      )}
    </div>
  )
}

// ---- sections ----
type SectionProps = {
  settings: SettingsDoc
  onChange: (patch: Partial<SettingsDoc>) => void
}

function Units({ settings, onChange }: SectionProps) {
  const u = settings.units
  const set = (patch: Partial<SettingsDoc['units']>) => onChange({ units: { ...u, ...patch } })
  return (
    <div>
      <SectionHead
        title="单位"
        desc="影响全局的数值显示，随时切换、即时生效。"
        pin={
          <SpecPin
            n={1}
            title="单位偏好"
            field="settings.units {distance,weight,temp,pace,elevation}"
            state="持久化 · 全局格式化"
            event="切换即存并重渲染"
            api="PUT /api/settings"
          />
        }
      />
      <Card>
        <Row label="距离">
          <Seg value={u.distance} setValue={(distance) => set({ distance })} options={['公里 (km)', '英里 (mi)']} />
        </Row>
        <Divider />
        <Row label="体重">
          <Seg value={u.weight} setValue={(weight) => set({ weight })} options={['公斤 (kg)', '磅 (lb)']} />
        </Row>
        <Divider />
        <Row label="温度">
          <Seg value={u.temp} setValue={(temp) => set({ temp })} options={['摄氏 (℃)', '华氏 (℉)']} />
        </Row>
        <Divider />
        <Row label="配速">
          <Seg value={u.pace} setValue={(pace) => set({ pace })} options={['min/km', 'min/mi']} />
        </Row>
        <Divider />
        <Row label="海拔">
          <Seg value={u.elevation} setValue={(elevation) => set({ elevation })} options={['米 (m)', '英尺 (ft)']} />
        </Row>
      </Card>
    </div>
  )
}

interface HRZone {
  z: string
  name: string
  lo: number
  color: string
}

function HRZones({ profile, settings, onChange }: SectionProps & { profile: Profile }) {
  const max = settings.hr.maxHR || profile.maxHR || 189
  const method = settings.hr.method
  const setHr = (patch: Partial<SettingsDoc['hr']>) => onChange({ hr: { ...settings.hr, ...patch } })
  const zones: HRZone[] = [
    { z: 'Z1', name: '恢复', lo: 50, color: 'var(--ink-500)' },
    { z: 'Z2', name: '有氧', lo: 60, color: 'var(--blue-500)' },
    { z: 'Z3', name: '节奏', lo: 70, color: 'var(--cyan-500)' },
    { z: 'Z4', name: '阈值', lo: 80, color: 'var(--amber-500)' },
    { z: 'Z5', name: '无氧', lo: 90, color: 'var(--red-500)' },
  ]
  return (
    <div>
      <SectionHead
        title="心率区间"
        desc="自定义区间阈值，用于活动分析、负荷计算与区间分布。"
        pin={
          <SpecPin
            n={1}
            title="心率区间阈值"
            field="settings.hrZones[] {zone, lowPct, lowBpm}"
            state="派生自 maxHR · 可手动覆盖"
            event="编辑阈值 → 重算历史区间"
            api="PUT /api/settings"
          />
        }
      />
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Row label="最大心率">
            <input
              type="number"
              value={max}
              onChange={(e) => {
                const n = Number(e.target.value)
                if (Number.isFinite(n) && n > 0) setHr({ maxHR: n })
              }}
              style={{
                width: 90,
                height: 38,
                padding: '0 12px',
                background: 'var(--surface-inset)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-md)',
                color: 'var(--text-body)',
                font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)',
                outline: 'none',
                textAlign: 'right',
              }}
            />
          </Row>
          <Row label="计算方法">
            <Seg value={method} setValue={(m) => setHr({ method: m })} options={['% 最大心率', '储备心率']} />
          </Row>
        </div>
      </Card>
      <Card title="区间阈值">
        <div
          style={{
            display: 'flex',
            height: 14,
            borderRadius: 'var(--r-pill)',
            overflow: 'hidden',
            gap: 2,
            marginBottom: 16,
          }}
        >
          {zones.map((z, i) => (
            <div key={z.z} style={{ flex: i === zones.length - 1 ? 1.2 : 1, background: z.color }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {zones.map((z, i) => (
            <div
              key={z.z}
              style={{
                display: 'grid',
                gridTemplateColumns: '70px 1fr 120px 90px',
                gap: 14,
                alignItems: 'center',
                padding: '12px 0',
                borderTop: i ? '1px solid var(--hairline)' : 'none',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)',
                  color: 'var(--text-strong)',
                }}
              >
                <span style={{ width: 9, height: 9, borderRadius: 2, background: z.color }} />
                {z.z}
              </span>
              <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-muted)' }}>
                {z.name}
              </span>
              <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)', color: 'var(--text-faint)' }}>
                ≥ {z.lo}% 最大
              </span>
              <span
                style={{
                  font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)',
                  color: 'var(--text-body)',
                  textAlign: 'right',
                }}
              >
                {Math.round((max * z.lo) / 100)} bpm
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function Notify({ settings, onChange }: SectionProps) {
  const n = settings.notifications
  const set = (patch: Partial<SettingsDoc['notifications']>) => onChange({ notifications: { ...n, ...patch } })
  const rows: [keyof SettingsDoc['notifications'], string, string][] = [
    ['todayWorkout', '今日训练提醒', '每天提醒当日计划课程'],
    ['loadAlert', '恢复 / 负荷预警', 'ACWR 偏高、HRV 骤降时提醒'],
    ['aiInsight', 'AI 洞察推送', '有新的自动洞察时通知'],
    ['weeklySummary', '每周总结', '每周一推送上周训练回顾'],
    ['planChange', '计划变更提醒', 'AI 调整计划时通知'],
    ['sendMilestone', '完攀里程碑', '突破新难度时祝贺'],
  ]
  return (
    <div>
      <SectionHead
        title="通知与提醒"
        desc="选择需要接收的提醒，支持应用内与推送。"
        pin={
          <SpecPin
            n={1}
            title="通知偏好"
            field="settings.notifications{}"
            state="按渠道持久化"
            event="开关 → 订阅/退订"
            api="PUT /api/settings"
          />
        }
      />
      <Card>
        {rows.map(([key, label, desc], i) => (
          <Fragment key={key}>
            {i ? <Divider /> : null}
            <ToggleRow label={label} desc={desc} on={n[key]} onChange={(v) => set({ [key]: v })} />
          </Fragment>
        ))}
      </Card>
    </div>
  )
}

const GRANT_DESCS: Record<string, string> = {
  Strava: '分享活动到社区',
  第三方分析平台: '导出训练数据',
}

function Privacy({ settings, onChange }: SectionProps) {
  const p = settings.privacy
  const set = (patch: Partial<SettingsDoc['privacy']>) => onChange({ privacy: { ...p, ...patch } })
  return (
    <div>
      <SectionHead
        title="隐私与授权"
        desc="控制你的数据可见性与第三方授权。"
        pin={
          <SpecPin
            n={1}
            title="隐私设置"
            field="settings.privacy{} · grants[]"
            state="—"
            event="可单项撤销授权"
            api="PUT /api/settings"
          />
        }
      />
      <Card style={{ marginBottom: 16 }}>
        <Row label="资料可见性" desc="谁可以看到你的训练数据">
          <Seg value={p.visibility} setValue={(visibility) => set({ visibility })} options={['私密', '教练可见', '公开']} />
        </Row>
        <Divider />
        <ToggleRow
          label="健康数据用于 AI 分析"
          desc="允许 AI 读取生理数据以提供个性化建议"
          on={p.aiHealth}
          onChange={(aiHealth) => set({ aiHealth })}
        />
        <Divider />
        <ToggleRow
          label="匿名贡献研究"
          desc="去标识化数据用于运动科学研究"
          on={p.anonResearch}
          onChange={(anonResearch) => set({ anonResearch })}
        />
      </Card>
      <Card title="已授权应用">
        {Object.entries(p.grants).map(([name, on], i) => (
          <Fragment key={name}>
            {i ? <Divider /> : null}
            <ToggleRow
              label={name}
              desc={GRANT_DESCS[name] ?? '第三方授权'}
              on={on}
              onChange={(v) => set({ grants: { ...p.grants, [name]: v } })}
            />
          </Fragment>
        ))}
      </Card>
    </div>
  )
}

function DataAccount({ onLogout }: { onLogout: () => void }) {
  return (
    <div>
      <SectionHead
        title="数据与账户"
        desc="导出你的数据，或管理账户与登录设备。"
        pin={
          <SpecPin
            n={1}
            title="数据导出 / 账户"
            field="account{} · sessions[] · export job"
            state="导出为异步任务"
            event="请求导出 → 邮件下载链接"
            api="POST /api/export · GET /api/sessions"
          />
        }
      />
      <Card title="数据导出" style={{ marginBottom: 16 }}>
        <Row label="导出格式">
          <Seg value="CSV" setValue={() => {}} options={['CSV', 'GPX', 'JSON']} />
        </Row>
        <Divider />
        <Row label="时间范围">
          <Seg value="全部" setValue={() => {}} options={['全部', '近一年', '自定义']} />
        </Row>
        <Divider />
        <Row label="导出数据" desc="生成下载包，完成后邮件通知">
          <Button variant="secondary" size="sm" iconLeft={<Icon name="download" size={14} />}>
            请求导出
          </Button>
        </Row>
      </Card>
      <Card title="账户" style={{ marginBottom: 16 }}>
        <Row label="邮箱">
          <span style={{ font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-muted)' }}>
            linyue@example.com
          </span>
        </Row>
        <Divider />
        <Row label="密码">
          <Button variant="secondary" size="sm">
            修改密码
          </Button>
        </Row>
        <Divider />
        <Row label="登录设备" desc="iPhone 15 Pro · MacBook · Garmin 等 3 台">
          <Button variant="ghost" size="sm">
            退出其他设备
          </Button>
        </Row>
      </Card>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: 18,
          background: 'rgba(255,77,94,0.06)',
          border: '1px solid rgba(255,77,94,0.28)',
          borderRadius: 'var(--r-lg)',
        }}
      >
        <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>危险区</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" size="sm" iconLeft={<Icon name="log-out" size={14} />} onClick={onLogout}>
            退出登录
          </Button>
          <button
            style={{
              height: 34,
              padding: '0 14px',
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--red-500)',
              background: 'transparent',
              color: 'var(--red-400)',
              cursor: 'pointer',
              font: 'var(--fw-semibold) var(--fs-xs)/1 var(--font-sans)',
            }}
          >
            删除账户
          </button>
        </div>
      </div>
    </div>
  )
}

function Theme({ settings, onChange }: SectionProps) {
  const t = settings.theme
  const density = t.density
  const size = t.fontScale
  const set = (patch: Partial<SettingsDoc['theme']>) => onChange({ theme: { ...t, ...patch } })
  return (
    <div>
      <SectionHead
        title="外观"
        desc="Readyn 当前为深色高性能主题；浅色主题即将推出。"
        pin={
          <SpecPin
            n={1}
            title="外观偏好"
            field="settings.theme {mode, accent, density, fontScale}"
            state="mode 暂锁定 dark"
            event="切换密度/字号即时生效"
            api="PUT /api/settings"
          />
        }
      />
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <div
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 'var(--r-md)',
              border: '2px solid var(--accent)',
              background: 'var(--bg-app)',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {['var(--bg-app)', 'var(--surface-card)', 'var(--surface-raised)'].map((c) => (
                <span
                  key={c}
                  style={{ width: 28, height: 28, borderRadius: 6, background: c, border: '1px solid var(--hairline)' }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="moon" size={15} color="var(--blue-400)" />
              <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>
                深色
              </span>
              <Badge tone="accent">当前</Badge>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface-card)',
              opacity: 0.5,
            }}
          >
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {['#fff', '#f1f3f6', '#e3e7ec'].map((c) => (
                <span key={c} style={{ width: 28, height: 28, borderRadius: 6, background: c }} />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="sun" size={15} color="var(--text-faint)" />
              <span style={{ font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-muted)' }}>
                浅色
              </span>
              <span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>
                即将推出
              </span>
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <Row label="强调色" desc="品牌色，暂锁定">
          <div style={{ display: 'flex', gap: 8 }}>
            {['var(--blue-500)', 'var(--violet-500)'].map((c) => (
              <span
                key={c}
                style={{ width: 26, height: 26, borderRadius: 7, background: c, border: '2px solid var(--text-strong)' }}
              />
            ))}
          </div>
        </Row>
        <Divider />
        <Row label="界面密度">
          <Seg value={density} setValue={(d) => set({ density: d })} options={['紧凑', '标准', '宽松']} />
        </Row>
        <Divider />
        <Row label="字号">
          <Seg value={size} setValue={(s) => set({ fontScale: s })} options={['小', '标准', '大']} />
        </Row>
      </Card>
    </div>
  )
}

export interface SettingsCenterProps {
  profile: Profile
  settings: SettingsDoc
  onChange: (patch: Partial<SettingsDoc>) => void
  onLogout: () => void
}

export function SettingsCenter({ profile, settings, onChange, onLogout }: SettingsCenterProps) {
  const [sec, setSec] = useState('units')
  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* sub nav */}
      <div
        style={{
          width: 220,
          flex: 'none',
          borderRight: '1px solid var(--border-subtle)',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {NAV.map((n) => {
          const on = sec === n.id
          return (
            <button
              key={n.id}
              onClick={() => setSec(n.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '11px 12px',
                borderRadius: 'var(--r-md)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                background: on ? 'var(--surface-raised)' : 'transparent',
                color: on ? 'var(--text-strong)' : 'var(--text-muted)',
                transition: 'all var(--dur-fast)',
              }}
              onMouseEnter={(e) => {
                if (!on) e.currentTarget.style.background = 'var(--surface-hover)'
              }}
              onMouseLeave={(e) => {
                if (!on) e.currentTarget.style.background = 'transparent'
              }}
            >
              <Icon name={n.icon} size={16} color={on ? 'var(--blue-400)' : 'var(--text-faint)'} />
              <span style={{ font: `var(--fw-${on ? 'bold' : 'medium'}) var(--fs-sm)/1 var(--font-sans)` }}>
                {n.label}
              </span>
            </button>
          )
        })}
      </div>
      {/* content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>
        <div style={{ maxWidth: 720 }}>
          {sec === 'units' && <Units settings={settings} onChange={onChange} />}
          {sec === 'hr' && <HRZones profile={profile} settings={settings} onChange={onChange} />}
          {sec === 'notify' && <Notify settings={settings} onChange={onChange} />}
          {sec === 'privacy' && <Privacy settings={settings} onChange={onChange} />}
          {sec === 'data' && <DataAccount onLogout={onLogout} />}
          {sec === 'theme' && <Theme settings={settings} onChange={onChange} />}
        </div>
      </div>
    </div>
  )
}
