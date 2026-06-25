import { useCallback, useEffect, useState } from 'react'
import { Icon } from './components/Icon'
import { Sidebar } from './components/Sidebar'
import type { ViewId } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { ConnStatus } from './components/ConnStatus'
import { SpecContext } from './components/spec/SpecContext'
import { SpecBanner } from './components/spec/Spec'
import { Dashboard } from './modules/Dashboard'
import { Training } from './modules/Training'
import { Library } from './modules/Library'
import { WeightModule } from './modules/Weight'
import { Connectors } from './modules/Connectors'
import { Records } from './modules/Records'
import { CompareModal } from './components/CompareModal'
import { ActivityCompare } from './details/ActivityCompare'
import { AIModule } from './modules/AIModule'
import { ProfileModal } from './modules/Profile'
import { SettingsCenter } from './modules/Settings'
import { ActivityDetail } from './details/ActivityDetail'
import { MetricDetail } from './details/MetricDetail'
import { TemplateDetail } from './details/TemplateDetail'
import { PlanDetail } from './details/PlanDetail'
import { ConnectorDetail } from './details/ConnectorDetail'
import { emptyData } from './lib/emptyData'
import { api } from './lib/api'
import { planFromLibrary, planFromDays } from './lib/applyPlan'
import type { DayInput } from './lib/applyPlan'
import { defaultSettings } from './lib/defaultSettings'
import { bmi as calcBmi } from './lib/format'
import type {
  Activity,
  ApexData,
  Connector,
  Insight,
  LibraryPlan,
  Profile,
  SettingsDoc,
  Template,
  UnlinkedActivity,
  WeightEntry,
} from './lib/types'

type Detail =
  | { type: 'activity'; act: Activity }
  | { type: 'metric'; id: string }
  | { type: 'template'; tpl: Template; sport: string }
  | { type: 'plan'; plan: LibraryPlan }
  | { type: 'connector'; src: Connector }
  | { type: 'compare'; ids: string[] }
  | { type: 'settings' }

interface Seed {
  q: string
  nonce: number
}

const TODAY = '2026-06-18'

export default function App() {
  // Start from an empty skeleton so the UI renders honest empty states instantly;
  // /api/bootstrap fills it with real data (empty until a Garmin sync completes).
  const [data, setData] = useState<ApexData>(emptyData)
  const D = data
  const [view, setView] = useState<ViewId>('dashboard')
  const [sport, setSport] = useState('all')
  const [connTab, setConnTab] = useState('connected')
  const [libTab, setLibTab] = useState('running')
  const [aiTab, setAiTab] = useState('train')
  const [seed, setSeed] = useState<Seed | null>(null)
  const [weightLog, setWeightLog] = useState<WeightEntry[]>(D.weightLog)
  const [profile, setProfile] = useState<Profile>({ ...D.profile })
  const [profileOpen, setProfileOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)
  const [comparePreselect, setComparePreselect] = useState<string[]>([])
  const [detail, setDetail] = useState<Detail | null>(null)
  // Spec annotation layer is dormant (no topbar toggle per design v9; kept off).
  const [spec] = useState(false)
  const [settings, setSettings] = useState<SettingsDoc>(defaultSettings)
  const [flash, setFlash] = useState<string | null>(null)

  const [todayDone, setTodayDone] = useState(false)

  const applyData = useCallback((d: ApexData) => {
    setData(d)
    setWeightLog(d.weightLog)
    setProfile({ ...d.profile })
  }, [])

  // Re-pull the bootstrap snapshot (used after a connect / manual sync).
  const reload = useCallback(() => {
    return api
      .bootstrap()
      .then(applyData)
      .catch(() => {
        /* backend unavailable — keep current data */
      })
  }, [applyData])

  // Initial load from the backend; keep the empty skeleton if offline.
  useEffect(() => {
    let active = true
    api
      .bootstrap()
      .then((d) => {
        if (active) applyData(d)
      })
      .catch(() => {})
    api
      .getSettings()
      .then((s) => {
        if (active) setSettings(s)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [applyData])

  // Settings: optimistic local merge, then persist the patch (best-effort).
  const patchSettings = (patch: Partial<SettingsDoc>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
    api
      .saveSettings(patch)
      .then(setSettings)
      .catch(() => {})
  }

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
  const openCompare = (ids: string[]) => setDetail({ type: 'compare', ids })
  const openCompareModal = (preselect: string[] = []) => {
    setComparePreselect(preselect)
    setCompareOpen(true)
  }
  const openMetric = (id: string) => setDetail({ type: 'metric', id })
  const openTemplate = (tpl: Template, sport: string) => setDetail({ type: 'template', tpl, sport })
  const openPlan = (plan: LibraryPlan) => setDetail({ type: 'plan', plan })
  const openConnector = (src: Connector) => setDetail({ type: 'connector', src })
  const openSettings = () => {
    setProfileOpen(false)
    setDetail({ type: 'settings' })
  }
  const back = () => setDetail(null)

  // Transient toast (auto-clears). Used to confirm side-effectful actions.
  const flashMsg = (m: string) => {
    setFlash(m)
    window.setTimeout(() => setFlash((cur) => (cur === m ? null : cur)), 2600)
  }

  // Apply a plan to the Training calendar — actually rewrites plan + today's
  // workout, then routes to Training so the linkage is visible.
  const applyPlan = (week: import('./lib/applyPlan').AppliedPlan, msg: string) => {
    setData((d) => ({ ...d, plan: week.plan, workout: week.workout }))
    setDetail(null)
    setView('training')
    flashMsg(msg)
  }
  const onApplyLibraryPlan = (plan: LibraryPlan) => applyPlan(planFromLibrary(plan), `已应用计划「${plan.name}」到训练日历`)
  const onApplyDraft = (name: string, focus: string, days: DayInput[]) =>
    applyPlan(planFromDays(name, focus, days), `已应用 AI 计划「${name}」到训练日历`)

  // Connector linkage: connecting a source flips it to connected and feeds a
  // freshly-synced (unlinked) activity into Training so the data shows up.
  const connectSource = () => {
    // The connect modal already performed the real backend login + sync; pull the
    // refreshed bootstrap so the synced Garmin data shows up across every module.
    reload()
  }
  const disconnectSource = (id: string) => {
    // Local UI flip only — the cached token is cleared server-side on reconnect.
    setData((d) => ({
      ...d,
      connectors: d.connectors.map((c) => (c.id === id ? { ...c, status: 'available' as const, sync: '—' } : c)),
    }))
    setDetail(null)
    setView('connectors')
    flashMsg('已断开连接')
  }
  // Pull from Garmin and re-bootstrap so 累计记录数 / 最近同步时间 actually refresh.
  // Shared by 立即同步 and 历史回填 — both must reflect the new data in the UI.
  const runGarminSync = (okMsg: string) => {
    return api
      .garminSync()
      .then(() => reload())
      .then(() => flashMsg(okMsg))
      .catch(() => flashMsg('同步失败，请重新连接'))
  }
  const syncSource = (id: string) => {
    void id
    return runGarminSync('已同步佳明数据')
  }
  const backfillSource = (id: string) => {
    void id
    return runGarminSync('历史回填完成，已更新累计记录与同步时间')
  }

  // Link a device-synced activity to a planned workout: drop it from the
  // "未关联" list and flip the matching calendar day to linked so the month
  // board reflects the change. (mock linkage — date → day-of-month.)
  const linkActivity = (a: UnlinkedActivity) => {
    setData((d) => {
      const unlinked = d.unlinked.filter((u) => u.id !== a.id)
      const dayNum = parseInt(a.date.slice(3, 5), 10)
      const ev = d.calendarEvents[dayNum]
      const calendarEvents =
        ev && ev.a && !ev.a.linked
          ? { ...d.calendarEvents, [dayNum]: { ...ev, a: { ...ev.a, linked: true } } }
          : d.calendarEvents
      return { ...d, unlinked, calendarEvents }
    })
    flashMsg(`已关联「${a.name}」到计划课程`)
  }

  // Mark / unmark today's workout done. Held here (not in Training) so the
  // completion survives navigating away and back; the week grid's today cell
  // reflects it via the markedDone prop.
  const completeToday = (done: boolean) => {
    setTodayDone(done)
    flashMsg(done ? '今日训练已标记完成' : '已取消今日完成标记')
  }

  const titles: Record<ViewId, [string, string]> = {
    dashboard: ['看板', '林越 · 多项目耐力 / 攀岩 · 2026-06-18'],
    records: ['运动记录', '全部活动 · 按时间倒序'],
    training: ['训练日历', `${D.plan.week} · 焦点 ${D.plan.focus}`],
    library: ['训练库', '跑步 · 攀岩 · 我的计划'],
    weight: ['体重记录', '手动录入与趋势 · 与个人资料联动'],
    connectors: ['连接器', '统一数据规范 · 多源接入'],
    ai: ['AI 模块', '运动专家对话'],
  }
  const [title, subtitle] = titles[view]

  let detailTitle: [string, string] | null = null
  if (detail) {
    switch (detail.type) {
      case 'activity':
        detailTitle = [detail.act.name, `${detail.act.sport} · ${detail.act.date}`]
        break
      case 'metric':
        detailTitle = [D.metrics[detail.id]?.name ?? '指标深潜', '指标深潜 · 定义 / 公式 / 趋势 / AI 解读']
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
      case 'compare':
        detailTitle = [`对比 ${detail.ids.length} 项活动`, '指标对比 · 心率叠加']
        break
      case 'settings':
        detailTitle = ['设置中心', '单位 · 心率区间 · 通知 · 隐私 · 数据 · 外观']
        break
    }
  }

  // A data source is "connected" once a Garmin sync has populated core data.
  const connected = D.activities.length > 0 || D.pmc.length > 0 || D.today.readiness > 0
  const goConnect = () => {
    setDetail(null)
    setConnTab('market')
    setView('connectors')
  }

  // Topbar right (design v9): a read-only connection-status indicator on the
  // dashboard — no time-range switch, no global sync button (manual re-sync now
  // lives on the connector config detail).
  const right = !detail && view === 'dashboard' ? <ConnStatus connected={connected} /> : undefined

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
          {detail?.type === 'activity' && (
            <ActivityDetail data={D} act={detail.act} spec={spec} onToast={flashMsg} onCompare={() => openCompareModal([detail.act.id])} />
          )}
          {detail?.type === 'compare' && (
            <ActivityCompare data={D} ids={detail.ids} onOpenActivity={openActivity} onEdit={() => openCompareModal(detail.ids)} />
          )}
          {detail?.type === 'metric' && <MetricDetail data={D} id={detail.id} onOpenMetric={openMetric} />}
          {detail?.type === 'template' && (
            <TemplateDetail
              data={D}
              tpl={detail.tpl}
              sport={detail.sport}
              onToast={flashMsg}
              onAddToPlan={() => {
                setDetail(null)
                setLibTab('plans')
                setView('library')
              }}
            />
          )}
          {detail?.type === 'plan' && (
            <PlanDetail data={D} plan={detail.plan} onApply={() => onApplyLibraryPlan(detail.plan)} onToast={flashMsg} />
          )}
          {detail?.type === 'connector' && (
            <ConnectorDetail
              src={detail.src}
              onSync={() => syncSource(detail.src.id)}
              onBackfill={() => backfillSource(detail.src.id)}
              onDisconnect={() => disconnectSource(detail.src.id)}
            />
          )}
          {detail?.type === 'settings' && (
            <SettingsCenter
              profile={profile}
              settings={settings}
              onChange={patchSettings}
              onLogout={() => {
                window.location.href = '/login.html'
              }}
            />
          )}
          {!detail && view === 'dashboard' && (
            <Dashboard
              data={D}
              sport={sport}
              setSport={setSport}
              connected={connected}
              onConnect={goConnect}
              onOpenAI={() => openChat()}
              onAskAI={askAI}
              onOpenMetric={openMetric}
            />
          )}
          {!detail && view === 'training' && (
            <Training
              data={D}
              onOpenAITrain={openTrain}
              onOpenAIChat={() => openChat('请解读今日训练的 AI 适配调整')}
              onOpenActivity={openActivity}
              onLinkActivity={linkActivity}
              onCompleteToday={completeToday}
              markedDone={todayDone}
            />
          )}
          {!detail && view === 'library' && (
            <Library
              data={D}
              tab={libTab}
              setTab={setLibTab}
              onNewFromAI={openTrain}
              onOpenTemplate={openTemplate}
              onOpenPlan={openPlan}
              onApplyPlan={onApplyLibraryPlan}
            />
          )}
          {!detail && view === 'records' && (
            <Records data={D} connected={connected} onConnect={goConnect} onOpenActivity={openActivity} onCompare={() => openCompareModal()} />
          )}
          {!detail && view === 'weight' && <WeightModule weightLog={weightLog} profile={profile} onAdd={addWeight} today={TODAY} />}
          {!detail && view === 'connectors' && (
            <Connectors data={D} tab={connTab} setTab={setConnTab} connected={connected} onOpenConnector={openConnector} onConnect={connectSource} onToast={flashMsg} />
          )}
          {!detail && view === 'ai' && (
            <AIModule
              data={D}
              tab={aiTab}
              setTab={setAiTab}
              seed={seed}
              body={{ weight: currentWeight, bmi }}
              profile={profile}
              onSaved={(plan) => {
                // Actually persist the AI draft into 我的计划 (replace any
                // same-name plan), then route to the library so it's visible.
                setData((d) => ({
                  ...d,
                  library: { ...d.library, plans: [plan, ...d.library.plans.filter((p) => p.name !== plan.name)] },
                }))
                setLibTab('plans')
                setView('library')
                flashMsg(`已保存计划「${plan.name}」到训练库`)
              }}
              onApply={onApplyDraft}
            />
          )}
        </main>
        {flash && (
          <div
            role="status"
            style={{
              position: 'fixed',
              bottom: 28,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 60,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 18px',
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--r-pill)',
              boxShadow: 'var(--shadow-lg)',
              font: 'var(--fw-semibold) var(--fs-sm)/1 var(--font-sans)',
              color: 'var(--text-strong)',
            }}
          >
            <Icon name="check-circle-2" size={16} color="var(--green-500)" />
            {flash}
          </div>
        )}
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
        {compareOpen && (
          <CompareModal
            activities={D.records ?? D.activities}
            preselect={comparePreselect}
            onClose={() => setCompareOpen(false)}
            onConfirm={(ids) => {
              setCompareOpen(false)
              openCompare(ids)
            }}
          />
        )}
      </div>
    </SpecContext.Provider>
  )
}
