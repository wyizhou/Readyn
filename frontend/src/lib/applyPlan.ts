// Turns a plan (a saved LibraryPlan, or an AI-drafted week) into the data the
// Training calendar renders: a 7-day Plan plus today's Workout. This is what
// makes "应用到训练日历" actually link through to the calendar / 今日训练.
import type { LibraryPlan, Plan, PlanDay, Workout } from './types'

const WD = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
// Keep the week aligned with the rest of the mock (today = 周四 06-18).
const DATES = ['06-15', '06-16', '06-17', '06-18', '06-19', '06-20', '06-21']
const TODAY_IDX = 3

export interface DayInput {
  t: string
  sport: string
  load: number
  dur?: string
}

function statusFor(i: number, sport: string): PlanDay['status'] {
  if (sport === '休息' || sport === '') return 'rest'
  if (i < TODAY_IDX) return 'done'
  if (i === TODAY_IDX) return 'today'
  return 'planned'
}

function estDur(load: number): string {
  return load <= 0 ? '—' : `${Math.max(30, Math.round(load * 0.7))}min`
}

function buildDays(items: DayInput[]): PlanDay[] {
  return items.slice(0, 7).map((it, i) => {
    const status = statusFor(i, it.sport)
    const dur = it.dur ?? estDur(it.load)
    return {
      d: WD[i],
      date: DATES[i],
      status,
      items: [{ t: it.t, sport: status === 'rest' ? '休息' : it.sport, load: it.load, done: status === 'done', dur }],
    }
  })
}

function workoutFromDays(name: string, days: PlanDay[]): Workout {
  const today = days[TODAY_IDX]
  const it = today.items[0]
  return {
    title: it.t,
    sport: it.sport,
    when: '今天 · 建议 17:00 前',
    target: 'Z2 · 按计划目标强度',
    load: it.load,
    duration: it.dur,
    rationale: `已根据计划「${name}」生成今日课程。可在下方查看分段并标记完成，完成后由设备同步实际数据。`,
    steps: [
      { t: '热身', d: '10 min', z: 'Z1' },
      { t: it.t, d: it.dur, z: 'Z2', note: '按目标强度执行' },
      { t: '放松拉伸', d: '10 min', z: 'Z1' },
    ],
  }
}

function compliance(days: PlanDay[]): number {
  const active = days.filter((d) => d.status !== 'rest')
  if (!active.length) return 0
  const done = active.filter((d) => d.status === 'done').length
  return Math.round((done / active.length) * 100)
}

export interface AppliedPlan {
  plan: Plan
  workout: Workout
}

export function planFromDays(name: string, focus: string, items: DayInput[]): AppliedPlan {
  const days = buildDays(items)
  return { plan: { week: name, focus, compliance: compliance(days), days }, workout: workoutFromDays(name, days) }
}

// A saved LibraryPlan has no per-day breakdown, so synthesize a sensible week
// from its disciplines (mock — the task explicitly allows mock linkage).
export function planFromLibrary(p: LibraryPlan): AppliedPlan {
  const s = p.sports.length ? p.sports : ['跑步']
  const pick = (i: number) => s[i % s.length]
  const longSport = s.includes('登山') ? '登山' : pick(0)
  const week: DayInput[] = [
    { t: '阈值间歇', sport: pick(0), load: 88 },
    { t: '力量 + 技术', sport: pick(1), load: 72 },
    { t: '轻松有氧 Z2', sport: '跑步', load: 46 },
    { t: '主动恢复', sport: '徒步', load: 28 },
    { t: '难度耐力', sport: pick(2), load: 56 },
    { t: '长距离', sport: longSport, load: 120 },
    { t: '完全休息', sport: '休息', load: 0 },
  ]
  return planFromDays(p.name, p.goal, week)
}
