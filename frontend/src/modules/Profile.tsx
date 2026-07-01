import { useState, useEffect } from 'react'
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react'
import { Button, IconButton } from '../design-system'
import { Icon } from '../components/Icon'
import { sports } from '../lib/taxonomy'
import type { Profile, WeightEntry } from '../lib/types'
import { bmi as bmiOf } from '../lib/format'

const bmiCat = (b: number): { label: string; c: string } =>
  b < 18.5
    ? { label: '偏瘦', c: 'var(--amber-400)' }
    : b < 24
      ? { label: '正常', c: 'var(--green-500)' }
      : b < 28
        ? { label: '偏重', c: 'var(--amber-500)' }
        : { label: '偏高', c: 'var(--red-500)' }

function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span
        style={{
          font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
          letterSpacing: 'var(--ls-label)',
          textTransform: 'uppercase',
          color: 'var(--text-faint)',
        }}
      >
        {label}
      </span>
      {children}
    </div>
  )
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        height: 40,
        padding: '0 12px',
        background: 'var(--surface-inset)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-md)',
        color: 'var(--text-body)',
        font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)',
        outline: 'none',
        width: '100%',
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
    />
  )
}

interface NativeSelectProps {
  value: string
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void
  options: string[]
}

function NativeSelect({ value, onChange, options }: NativeSelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        height: 40,
        padding: '0 12px',
        background: 'var(--surface-inset)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-md)',
        color: 'var(--text-body)',
        font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-sans)',
        outline: 'none',
        width: '100%',
        appearance: 'none',
      }}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

type HandleStatus = 'ok' | 'short' | 'checking' | 'taken'
type TestState = 'idle' | 'testing' | 'ok' | 'empty'

export interface ProfileModalProps {
  profile: Profile
  setProfile: (p: Profile) => void
  weightLog: WeightEntry[]
  today: string
  onAddWeight: (entry: WeightEntry) => void
  onOpenSettings: () => void
  onClose: () => void
}

export function ProfileModal({
  profile,
  setProfile,
  weightLog,
  today,
  onAddWeight,
  onOpenSettings,
  onClose,
}: ProfileModalProps) {
  const [d, setD] = useState<Profile>({ ...profile })
  const [qw, setQw] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [testState, setTestState] = useState<TestState>('idle')
  const TAKEN = ['@maya', '@leo', '@coach', '@suning', '@chenyu']
  const ownHandle = profile.handle.toLowerCase()
  const normHandle = '@' + String(d.handle || '').replace(/^@+/, '').toLowerCase()
  // Statuses derivable synchronously during render.
  const syncStatus: HandleStatus | null =
    normHandle.length <= 1 ? 'short' : normHandle === ownHandle ? 'ok' : null
  // Async availability check (debounced) only runs when not synchronously resolvable.
  // `resolved` holds the handle/result pair the timeout produced; while the current
  // handle differs we render 'checking' without a synchronous setState in the effect.
  const [resolved, setResolved] = useState<{ handle: string; status: 'taken' | 'ok' } | null>(null)
  useEffect(() => {
    if (syncStatus !== null) return
    const id = setTimeout(
      () => setResolved({ handle: normHandle, status: TAKEN.includes(normHandle) ? 'taken' : 'ok' }),
      500,
    )
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normHandle, syncStatus])
  const handleStatus: HandleStatus =
    syncStatus ?? (resolved && resolved.handle === normHandle ? resolved.status : 'checking')
  const cur = weightLog[0]
  const height = d.height || profile.height
  const b = cur && height ? bmiOf(cur.kg, height) : 0
  const cat = bmiCat(b)
  const set =
    (k: keyof Profile) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setD((s) => ({ ...s, [k]: e.target.value }))
  const save = () => {
    if (handleStatus === 'taken' || handleStatus === 'short') return
    setProfile({
      ...d,
      height: Number(d.height),
      restingHR: Number(d.restingHR),
      maxHR: Number(d.maxHR),
      targetWeight: Number(d.targetWeight),
    })
    onClose()
  }
  const quickAdd = () => {
    const v = parseFloat(qw)
    if (!v) return
    onAddWeight({ date: today, kg: v })
    setQw('')
  }

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
          width: 600,
          maxHeight: '90vh',
          overflow: 'auto',
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
            gap: 14,
            padding: '22px 24px',
            borderBottom: '1px solid var(--hairline)',
          }}
        >
          <span
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'var(--grad-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              font: 'var(--fw-bold) var(--fs-lg)/1 var(--font-display)',
              color: '#fff',
              flex: 'none',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            {profile.name.replace(/\s/g, '').slice(0, 1)}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ font: 'var(--fw-bold) var(--fs-lg)/1.1 var(--font-display)', color: 'var(--text-strong)' }}>
              {profile.name} · 个人资料
            </div>
            <div
              style={{
                font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-mono)',
                color: 'var(--text-faint)',
                marginTop: 5,
              }}
            >
              {profile.handle} · {profile.role}
            </div>
          </div>
          <IconButton label="关闭" variant="ghost" onClick={onClose}>
            <Icon name="x" size={18} />
          </IconButton>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* account */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Icon name="at-sign" size={15} color="var(--text-muted)" />
              <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>
                账户
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="用户名">
                <TextInput type="text" value={d.name} onChange={set('name')} />
              </Field>
              <Field label="用户名 (唯一)">
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: 0,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-mono)',
                      color: 'var(--text-faint)',
                    }}
                  >
                    @
                  </span>
                  <input
                    value={String(d.handle).replace(/^@/, '')}
                    onChange={(e) =>
                      setD((s) => ({ ...s, handle: '@' + e.target.value.replace(/^@+/, '').replace(/\s/g, '') }))
                    }
                    style={{
                      height: 40,
                      width: '100%',
                      padding: '0 36px 0 26px',
                      background: 'var(--surface-inset)',
                      border: `1px solid ${handleStatus === 'taken' ? 'var(--red-500)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--r-md)',
                      color: 'var(--text-body)',
                      font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      if (handleStatus !== 'taken') e.currentTarget.style.borderColor = 'var(--accent)'
                    }}
                    onBlur={(e) => {
                      if (handleStatus !== 'taken') e.currentTarget.style.borderColor = 'var(--border-subtle)'
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: 0,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {handleStatus === 'checking' && (
                      <span
                        className="apex-spin"
                        style={{
                          width: 13,
                          height: 13,
                          borderRadius: '50%',
                          border: '2px solid var(--surface-raised)',
                          borderTopColor: 'var(--blue-500)',
                          display: 'block',
                        }}
                      />
                    )}
                    {handleStatus === 'ok' && <Icon name="check" size={15} color="var(--green-500)" />}
                    {handleStatus === 'taken' && <Icon name="x" size={15} color="var(--red-500)" />}
                    {handleStatus === 'short' && <Icon name="triangle-alert" size={14} color="var(--amber-500)" />}
                  </span>
                </div>
              </Field>
            </div>
            <div style={{ marginTop: 7, minHeight: 14 }}>
              {handleStatus === 'checking' && (
                <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>
                  正在检查用户名可用性…
                </span>
              )}
              {handleStatus === 'ok' && (
                <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--green-400)' }}>
                  该用户名可用
                </span>
              )}
              {handleStatus === 'taken' && (
                <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--red-400)' }}>
                  该用户名已被占用，请换一个
                </span>
              )}
              {handleStatus === 'short' && (
                <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--amber-400)' }}>
                  用户名至少 2 个字符
                </span>
              )}
            </div>
          </div>

          {/* body data */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Icon name="ruler" size={15} color="var(--text-muted)" />
              <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>
                身体数据
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="身高 (cm)">
                <TextInput type="number" value={d.height} onChange={set('height')} />
              </Field>
              <Field label="BMI">
                <div
                  style={{
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '0 12px',
                    background: 'var(--surface-inset)',
                    borderRadius: 'var(--r-md)',
                  }}
                >
                  <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-mono)', color: 'var(--text-strong)' }}>
                    {b}
                  </span>
                  <span
                    style={{
                      font: 'var(--fw-semibold) 10px/1 var(--font-sans)',
                      color: cat.c,
                      background: 'var(--surface-card)',
                      padding: '4px 8px',
                      borderRadius: 'var(--r-pill)',
                    }}
                  >
                    {cat.label}
                  </span>
                </div>
              </Field>
            </div>
            {/* current weight — linked to weight log */}
            <div
              style={{
                marginTop: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                background: 'rgba(59,91,255,0.07)',
                border: '1px solid rgba(59,91,255,0.22)',
                borderRadius: 'var(--r-md)',
              }}
            >
              <Icon name="scale" size={18} color="var(--blue-400)" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span
                  style={{
                    font: 'var(--fw-semibold) var(--fs-2xs)/1 var(--font-sans)',
                    letterSpacing: 'var(--ls-label)',
                    textTransform: 'uppercase',
                    color: 'var(--text-faint)',
                  }}
                >
                  当前体重 · 来自体重记录
                </span>
                <span style={{ font: 'var(--fw-bold) var(--fs-h3)/1 var(--font-mono)', color: 'var(--text-strong)' }}>
                  {cur ? cur.kg : '—'} <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>kg</span>
                </span>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  step="0.1"
                  value={qw}
                  onChange={(e) => setQw(e.target.value)}
                  placeholder="快速记录"
                  style={{
                    width: 110,
                    height: 38,
                    padding: '0 12px',
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--r-md)',
                    color: 'var(--text-body)',
                    font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)',
                    outline: 'none',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') quickAdd()
                  }}
                />
                <Button variant="secondary" size="sm" onClick={quickAdd}>
                  记录
                </Button>
              </div>
            </div>
          </div>

          {/* basics */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Icon name="user" size={15} color="var(--text-muted)" />
              <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>
                基础信息
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="性别">
                <NativeSelect value={d.sex} onChange={set('sex')} options={['男', '女', '其他']} />
              </Field>
              <Field label="出生年月">
                <TextInput type="text" value={d.birth} onChange={set('birth')} />
              </Field>
              <Field label="静息心率 (bpm)">
                <TextInput type="number" value={d.restingHR} onChange={set('restingHR')} />
              </Field>
              <Field label="最大心率 (bpm)">
                <TextInput type="number" value={d.maxHR} onChange={set('maxHR')} />
              </Field>
            </div>
          </div>

          {/* sports / disciplines (multi-select) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Icon name="layers" size={15} color="var(--text-muted)" />
              <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>运动项目</span>
              <span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>多选 · 影响专项指标与训练建议</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {sports
                .filter((s) => s.id !== 'all')
                .map((s) => {
                  const on = d.disciplines.includes(s.name)
                  return (
                    <button
                      key={s.id}
                      onClick={() =>
                        setD((cur) => ({
                          ...cur,
                          disciplines: on ? cur.disciplines.filter((x) => x !== s.name) : [...cur.disciplines, s.name],
                        }))
                      }
                      aria-pressed={on}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 7,
                        height: 36,
                        padding: '0 13px',
                        borderRadius: 'var(--r-pill)',
                        cursor: 'pointer',
                        border: `1px solid ${on ? s.color : 'var(--border-subtle)'}`,
                        background: on ? `color-mix(in oklab, ${s.color} 16%, transparent)` : 'var(--surface-inset)',
                        color: on ? 'var(--text-strong)' : 'var(--text-muted)',
                        font: `var(--fw-${on ? 'bold' : 'medium'}) var(--fs-xs)/1 var(--font-sans)`,
                        transition: 'all var(--dur-fast)',
                      }}
                    >
                      <Icon name={s.icon} size={14} color={on ? s.color : 'var(--text-faint)'} />
                      {s.name}
                      {on && <Icon name="check" size={13} color={s.color} />}
                    </button>
                  )
                })}
            </div>
          </div>

          {/* goals */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Icon name="target" size={15} color="var(--text-muted)" />
              <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>
                训练目标
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
              <Field label="主要目标">
                <TextInput type="text" value={d.goal} onChange={set('goal')} />
              </Field>
              <Field label="目标体重 (kg)">
                <TextInput type="number" value={d.targetWeight} onChange={set('targetWeight')} />
              </Field>
            </div>
          </div>

          {/* AI interface */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Icon name="plug-zap" size={15} color="var(--text-muted)" />
              <span style={{ font: 'var(--fw-bold) var(--fs-sm)/1 var(--font-sans)', color: 'var(--text-strong)' }}>
                AI 接口接入
              </span>
              <span style={{ font: 'var(--fw-medium) var(--fs-2xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>
                驱动 AI 训练与对话
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="服务商">
                <NativeSelect
                  value={d.aiProvider}
                  onChange={set('aiProvider')}
                  options={['OpenAI', 'Anthropic', 'Azure OpenAI', 'DeepSeek', '自定义 / 本地']}
                />
              </Field>
              <Field label="模型">
                <TextInput
                  type="text"
                  value={d.aiModel}
                  onChange={set('aiModel')}
                  placeholder="gpt-5 / gpt-4.1"
                />
              </Field>
            </div>
            <div style={{ marginTop: 14 }}>
              <Field label="API 地址 (Base URL)">
                <TextInput
                  type="text"
                  value={d.aiBase}
                  onChange={set('aiBase')}
                  placeholder="https://api.openai.com/v1"
                />
              </Field>
            </div>
            <div style={{ marginTop: 14 }}>
              <Field label="API Key">
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={d.aiKey}
                      onChange={set('aiKey')}
                      placeholder="sk-········"
                      style={{
                        height: 40,
                        width: '100%',
                        padding: '0 38px 0 12px',
                        background: 'var(--surface-inset)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--r-md)',
                        color: 'var(--text-body)',
                        font: 'var(--fw-medium) var(--fs-sm)/1 var(--font-mono)',
                        outline: 'none',
                        letterSpacing: showKey ? 'normal' : '0.1em',
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                    />
                    <button
                      onClick={() => setShowKey((s) => !s)}
                      style={{
                        position: 'absolute',
                        right: 6,
                        top: 6,
                        width: 28,
                        height: 28,
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name={showKey ? 'eye-off' : 'eye'} size={15} color="var(--text-faint)" />
                    </button>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setTestState('testing')
                      setTimeout(() => setTestState(d.aiKey ? 'ok' : 'empty'), 900)
                    }}
                  >
                    测试连接
                  </Button>
                </div>
              </Field>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 7, minHeight: 18 }}>
                {testState === 'testing' && (
                  <>
                    <span
                      className="apex-spin"
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        border: '2px solid var(--surface-raised)',
                        borderTopColor: 'var(--blue-500)',
                        display: 'block',
                      }}
                    />
                    <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>
                      正在验证…
                    </span>
                  </>
                )}
                {testState === 'ok' && (
                  <>
                    <Icon name="check-circle-2" size={14} color="var(--green-500)" />
                    <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--green-400)' }}>
                      连接成功 · {d.aiModel} 可用
                    </span>
                  </>
                )}
                {testState === 'empty' && (
                  <>
                    <Icon name="triangle-alert" size={14} color="var(--amber-500)" />
                    <span style={{ font: 'var(--fw-medium) var(--fs-xs)/1 var(--font-sans)', color: 'var(--amber-400)' }}>
                      请先填入 API Key
                    </span>
                  </>
                )}
                {testState === 'idle' && (
                  <span style={{ font: 'var(--fw-regular) var(--fs-xs)/1 var(--font-sans)', color: 'var(--text-faint)' }}>
                    密钥仅保存在本地，不会上传。
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* AI note */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: 14,
              background: 'rgba(124,77,255,0.08)',
              border: '1px solid rgba(124,77,255,0.24)',
              borderRadius: 'var(--r-md)',
            }}
          >
            <Icon name="sparkles" size={16} color="var(--violet-400)" />
            <span style={{ font: 'var(--fw-regular) var(--fs-xs)/1.5 var(--font-sans)', color: 'var(--text-muted)' }}>
              以上数据将用于 <span style={{ color: 'var(--text-body)', fontWeight: 600 }}>AI 综合分析</span> ——
              心率区间、热量消耗、负荷耐受与配速预测均会参考你的身体与基础信息。
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '16px 24px',
            borderTop: '1px solid var(--hairline)',
          }}
        >
          <Button variant="ghost" iconLeft={<Icon name="settings" size={15} />} onClick={onOpenSettings}>
            设置中心
          </Button>
          <Button
            variant="ghost"
            iconLeft={<Icon name="log-out" size={15} />}
            onClick={() => {
              window.location.href = '/login.html'
            }}
          >
            退出登录
          </Button>
          <div style={{ flex: 1 }} />
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button
            variant="primary"
            iconLeft={<Icon name="check" size={16} />}
            onClick={save}
            disabled={handleStatus === 'taken' || handleStatus === 'short'}
          >
            保存资料
          </Button>
        </div>
      </div>
    </div>
  )
}
