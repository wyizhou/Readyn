import { useEffect, useState } from 'react'
import { Button, Tabs } from './design-system'
import { Icon } from './components/Icon'
import { Sidebar } from './components/Sidebar'
import type { ViewId } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { SpecContext } from './components/spec/SpecContext'
import { SpecToggle, SpecBanner } from './components/spec/Spec'
import { Dashboard } from './modules/Dashboard'
import { Training } from './modules/Training'
import { Library } from './modules/Library'
import { WeightModule } from './modules/Weight'
import { Connectors } from './modules/Connectors'
import { AIModule } from './modules/AIModule'
import { ProfileModal } from './modules/Profile'
import { SettingsCenter } from './modules/Settings'
import { ActivityDetail } from './details/ActivityDetail'
import { MetricDetail } from './details/MetricDetail'
import { TemplateDetail } from './details/TemplateDetail'
import { PlanDetail } from './details/PlanDetail'
import { ConnectorDetail } from './details/ConnectorDetail'
import { mockData } from './lib/mockData'
import { api } from './lib/api'
import { bmi as calcBmi } from './lib/format'
import type { Activity, ApexData, Connector, Insight, LibraryPlan, MetricId, Profile, Template, WeightEntry } from './lib/types'

type Detail =
  | { type: 'activity'; act: Activity }
  | { type: 'metric'; id: MetricId }
  | { type: 'template'; tpl: Template; sport: string }
  | { type: 'plan'; plan: LibraryPlan }
  | { type: 'connector'; src: Connector }
  | { type: 'settings' }

interface Seed {
  q: string
  nonce: number
}

function AIButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 40,
        padding: '0 16px',
        borderRadius: 'var(--r-md)',
        border: '1px solid var(--violet-700)',
        cursor: 'pointer',
        background: 'linear-gradient(135deg, rgba(59,91,255,0.18), rgba(124,77,255,0.18))',
        color: 'var(--text-strong)',
        font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-sans)',
        whiteSpace: 'nowrap',
        transition: 'filter var(--dur-fast)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.2)')}
      onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
    >
      <Icon name="message-square-text" size={16} color="var(--violet-300)" /> 问 AI 专家
    </button>
  )
}

const TODAY = '2026-06-18'

export default function App() {
  // Start from local mock data so the UI renders instantly and works offline;
  // replace it with the backend payload once /api/bootstrap resolves.
  const [data, setData] = useState<ApexData>(mockData)
  const D = data
  const [view, setView] = useState<ViewId>('dashboard')
  const [range, setRange] = useState('28d')
  const [connTab, setConnTab] = useState('connected')
  const [libTab, setLibTab] = useState('running')
  const [aiTab, setAiTab] = useState('train')
  const [seed, setSeed] = useState<Seed | null>(null)
  const [weightLog, setWeightLog] = useState<WeightEntry[]>(D.weightLog)
  const [profile, setProfile] = useState<Profile>({ ...D.profile })
  const [profileOpen, setProfileOpen] = useState(false)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [spec, setSpec] = useState(false)

  // Load the real dataset from the backend; silently keep mock data if offline.
  useEffect(() => {
    let cancelled = false
    api
      .bootstrap()
      .then((d) => {
        if (cancelled) return
        setData(d)
        setWeightLog(d.weightLog)
        setProfile({ ...d.profile })
      })
      .catch(() => {
        /* backend unavailable — stay on local mock data */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const currentWeight = weightLog[0] ? weightLog[0].kg : profile.targetWeight
  const bmi = calcBmi(currentWeight, profile.height)
  const addWeight = (e: WeightEntry) => {
    // Optimistic local update, then persist (best-effort) and adopt the server log.
    setWeightLog((prev) => [e, ...prev.filter((x) => x.date !== e.date)].sort((a, b) => b.date.localeCompare(a.date)))
    api
      .addWeight(e)
      .then((log) => setWeightLog(log))
      .catch(() => {})
  }
  const saveProfile = (p: Profile) => {
    setProfile(p)
    api.updateProfile(p).catch(() => {})
  }

  const openChat = (q?: string) => {
    setAiTab('chat')
    if (q) setSeed({ q, nonce: Date.now() })
    setView('ai')
  }
  const openTrain = () => {
    setAiTab('train')
    setView('ai')
  }
  const askAI = (ins: Insight) => openChat(`关于「${ins.title}」，我该怎么做？`)
  const openActivity = (act: Activity) => setDetail({ type: 'activity', act })
  const openMetric = (id: MetricId) => setDetail({ type: 'metric', id })
  const openTemplate = (tpl: Template, sport: string) => setDetail({ type: 'template', tpl, sport })
  const openPlan = (plan: LibraryPlan) => setDetail({ type: 'plan', plan })
  const openConnector = (src: Connector) => setDetail({ type: 'connector', src })
  const openSettings = () => {
    setProfileOpen(false)
    setDetail({ type: 'settings' })
  }
  const back = () => setDetail(null)

  const titles: Record<ViewId, [string, string]> = {
    dashboard: ['看板', '林越 · 多项目耐力 / 攀岩 · 2026-06-18'],
    training: ['训练日历', `${D.plan.week} · 焦点 ${D.plan.focus}`],
    library: ['训练库', '跑步 · 攀岩 · 我的计划'],
    weight: ['体重记录', '手动录入与趋势 · 与个人资料联动'],
    connectors: ['连接器', '统一数据规范 · 多源接入'],
    ai: ['AI 模块', '生成课表 · 运动专家对话'],
  }
  const [title, subtitle] = titles[view]

  let detailTitle: [string, string] | null = null
  if (detail) {
    switch (detail.type) {
      case 'activity':
        detailTitle = [detail.act.name, `${detail.act.sport} · ${detail.act.date}`]
        break
      case 'metric':
        detailTitle = [D.metrics[detail.id].name, '指标深潜 · 定义 / 公式 / 趋势 / AI 解读']
        break
      case 'template':
        detailTitle = [detail.tpl.name, `${detail.sport === 'climbing' ? '攀岩' : '跑步'} · 训练模板`]
        break
      case 'plan':
        detailTitle = [detail.plan.name, `${detail.plan.goal} · ${detail.plan.weeks} 周计划`]
        break
      case 'connector':
        detailTitle = [detail.src.name, `${detail.src.cat} · 连接器配置`]
        break
      case 'settings':
        detailTitle = ['设置中心', '单位 · 心率区间 · 通知 · 隐私 · 数据 · 外观']
        break
    }
  }

  const right = (
    <>
      {!detail && view === 'dashboard' && (
        <Tabs
          variant="pill"
          value={range}
          onChange={setRange}
          tabs={[
            { value: '7d', label: '7 天' },
            { value: '28d', label: '28 天' },
            { value: 'season', label: '赛季' },
          ]}
        />
      )}
      {!detail && view === 'dashboard' && (
        <Button variant="secondary" iconLeft={<Icon name="refresh-cw" size={15} />}>
          同步
        </Button>
      )}
      {!detail && view === 'connectors' && (
        <Button variant="secondary" iconLeft={<Icon name="plus" size={15} />} onClick={() => setConnTab('market')}>
          添加数据源
        </Button>
      )}
      <SpecToggle on={spec} onToggle={() => setSpec((s) => !s)} />
      {!detail && view !== 'ai' && <AIButton onClick={() => openChat()} />}
    </>
  )

  return (
    <SpecContext.Provider value={spec}>
      <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-app)', color: 'var(--text-body)', overflow: 'hidden' }}>
        <Sidebar
          active={view}
          onNav={(v) => {
            setDetail(null)
            setView(v)
          }}
          profile={profile}
          weight={currentWeight}
          onOpenAI={() => {
            setDetail(null)
            openChat()
          }}
          onOpenProfile={() => setProfileOpen(true)}
        />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Topbar
            title={detail && detailTitle ? detailTitle[0] : title}
            subtitle={detail && detailTitle ? detailTitle[1] : subtitle}
            right={right}
            onBack={detail ? back : undefined}
          />
          <SpecBanner on={spec} />
          {detail?.type === 'activity' && <ActivityDetail data={D} act={detail.act} spec={spec} />}
          {detail?.type === 'metric' && <MetricDetail data={D} id={detail.id} onOpenMetric={openMetric} />}
          {detail?.type === 'template' && (
            <TemplateDetail
              data={D}
              tpl={detail.tpl}
              sport={detail.sport}
              onAddToPlan={() => {
                setDetail(null)
                setLibTab('plans')
                setView('library')
              }}
            />
          )}
          {detail?.type === 'plan' && (
            <PlanDetail
              data={D}
              plan={detail.plan}
              onApply={() => {
                setDetail(null)
                setView('training')
              }}
            />
          )}
          {detail?.type === 'connector' && <ConnectorDetail src={detail.src} />}
          {detail?.type === 'settings' && (
            <SettingsCenter
              profile={profile}
              onLogout={() => {
                window.location.href = '/login.html'
              }}
            />
          )}
          {!detail && view === 'dashboard' && (
            <Dashboard
              data={D}
              range={range}
              setRange={setRange}
              onOpenAI={() => openChat()}
              onAskAI={askAI}
              onOpenActivity={openActivity}
              onOpenMetric={openMetric}
            />
          )}
          {!detail && view === 'training' && (
            <Training
              data={D}
              onOpenAITrain={openTrain}
              onOpenAIChat={() => openChat('请解读今日训练的 AI 适配调整')}
              onOpenActivity={openActivity}
            />
          )}
          {!detail && view === 'library' && (
            <Library data={D} tab={libTab} setTab={setLibTab} onNewFromAI={openTrain} onOpenTemplate={openTemplate} onOpenPlan={openPlan} />
          )}
          {!detail && view === 'weight' && <WeightModule weightLog={weightLog} profile={profile} onAdd={addWeight} today={TODAY} />}
          {!detail && view === 'connectors' && <Connectors data={D} tab={connTab} setTab={setConnTab} onOpenConnector={openConnector} />}
          {!detail && view === 'ai' && (
            <AIModule
              data={D}
              tab={aiTab}
              setTab={setAiTab}
              seed={seed}
              body={{ weight: currentWeight, bmi }}
              onSaved={() => {
                setLibTab('plans')
                setView('library')
              }}
            />
          )}
        </main>
        {profileOpen && (
          <ProfileModal
            profile={profile}
            setProfile={saveProfile}
            weightLog={weightLog}
            today={TODAY}
            onAddWeight={addWeight}
            onOpenSettings={openSettings}
            onClose={() => setProfileOpen(false)}
          />
        )}
      </div>
    </SpecContext.Provider>
  )
}
