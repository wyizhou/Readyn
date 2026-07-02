import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dashboard, type DashboardProps } from './Dashboard'
import { emptyData } from '../lib/emptyData'
import type { ApexData } from '../lib/types'

// Regression for issue #27 (P2): the redesigned multisport dashboard — all-sport
// aggregate core, source-transparency badges, and sport-filter-driven cards.

const connected: ApexData = {
  ...emptyData,
  today: { ...emptyData.today, readiness: 78, hrv: 71, hrvDelta: 4, rhr: 47, rhrDelta: -2, sleep: 7.4, sleepScore: 84, acwr: 1.18, ctl: 78, atl: 82, tsb: -4, weekLoad: 612, weekLoadDelta: 8 },
  pmc: [{ i: 0, ctl: 78, atl: 82, tsb: -4, load: 96 }],
  activities: [
    { id: 'a1', name: '阈值间歇 6×1km', sport: '跑步', key: 'run', icon: 'footprints', date: '今天', dist: '12.4 km', dur: '58:12', load: 96, loadSrc: 'HR-TRIMP', hr: 162, flag: 'high', note: '' },
  ],
  disciplineSplit: [
    { name: '跑步', key: 'run', icon: 'footprints', load: 196, pct: 64, color: 'var(--blue-500)', trend: [1, 2, 3] },
    { name: '其他', key: 'other', icon: 'more-horizontal', load: 24, pct: 36, color: 'var(--ink-500)', trend: [1] },
  ],
}

function renderDash(overrides: Partial<DashboardProps> = {}) {
  const props = {
    data: connected,
    sport: 'all',
    setSport: vi.fn(),
    connected: true,
    onConnect: vi.fn(),
    onOpenAI: vi.fn(),
    onAskAI: vi.fn(),
    onOpenMetric: vi.fn(),
    ...overrides,
  }
  render(<Dashboard {...props} />)
  return props
}

describe('Dashboard (P2 redesign)', () => {
  it('shows the all-sport core with source-transparency badges', () => {
    renderDash()
    const loadMetrics = screen.getByRole('region', { name: '负荷指标' })
    expect(loadMetrics).toBeInTheDocument()
    expect(within(loadMetrics).getByText('Fatigue / ATL')).toBeInTheDocument()
    expect(within(loadMetrics).getByText('Fitness / CTL')).toBeInTheDocument()
    expect(within(loadMetrics).getByText('Stress Balance / TSB')).toBeInTheDocument()
    expect(within(loadMetrics).getByText('Workload Ratio / A:C')).toBeInTheDocument()
    expect(within(loadMetrics).getByText('Easy TRIMP')).toBeInTheDocument()
    expect(within(loadMetrics).getByText('待算法字段')).toBeInTheDocument()
    expect(within(loadMetrics).queryByText('HRV')).not.toBeInTheDocument()
    expect(within(loadMetrics).queryByText('静息心率')).not.toBeInTheDocument()
    expect(within(loadMetrics).queryByText('睡眠')).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: '体能趋势' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '下一次训练建议' })).toBeInTheDocument()

    const sourceFormula = screen.getByRole('region', { name: '来源证据与公式说明' })
    expect(within(sourceFormula).getByLabelText('如何计算')).toBeInTheDocument()
    expect(within(sourceFormula).getByText('Trainalyze 自算')).toBeInTheDocument()

    expect(screen.getByText('Fatigue / ATL')).toBeInTheDocument()
    // Garmin-sourced numbers (readiness/HRV/sleep) carry the 直供 badge.
    expect(screen.getAllByText('Garmin 直供').length).toBeGreaterThan(0)
    // The PMC (computed) section carries the Trainalyze 自算 badge.
    expect(screen.getAllByText('Trainalyze 自算').length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText('如何计算').length).toBeGreaterThan(0)
    expect(screen.getByText('体能趋势')).toBeInTheDocument()
    expect(screen.getByText('下一次训练建议')).toBeInTheDocument()
    expect(screen.getByText('暂无下一次训练建议')).toBeInTheDocument()
    // The recent-activities table now lives in the Records module, not here.
    expect(screen.queryByText('近期活动')).not.toBeInTheDocument()
  })

  it('renders the next-workout recommendation from existing workout data only', () => {
    renderDash({
      data: {
        ...connected,
        workout: {
          ...emptyData.workout,
          title: '节奏跑 40 分钟',
          sport: '跑步',
          when: '明天',
          target: 'Z3',
          load: 72,
          duration: '40 min',
          rationale: '来自已应用训练计划。',
        },
      },
    })
    expect(screen.getByText('节奏跑 40 分钟')).toBeInTheDocument()
    expect(screen.getByText('72 AU')).toBeInTheDocument()
    expect(screen.queryByText('暂无下一次训练建议')).not.toBeInTheDocument()
  })

  it('prompts to pick a sport for specialty metrics when on 全部运动', () => {
    renderDash({ sport: 'all' })
    expect(screen.getByText(/项目专属指标/)).toBeInTheDocument()
  })

  it('filters to a sport from the discipline legend', async () => {
    const user = userEvent.setup()
    const { setSport } = renderDash({ sport: 'all' })
    const runButtons = screen.getAllByRole('button', { name: /跑步/ })
    await user.click(runButtons[0])
    expect(setSport).toHaveBeenCalledWith('run')
  })

  it('uses a fixed 近 6 周 PMC window (no time-range switch, issue #52)', () => {
    renderDash()
    // v9: the PMC card title is the fixed 近 6 周 window…
    expect(screen.getByText('近 6 周 · 体能 / 疲劳 / 状态')).toBeInTheDocument()
    // …and the old 7天/28天/赛季 range labels are gone from the dashboard.
    expect(screen.queryByText('近 28 天')).not.toBeInTheDocument()
    expect(screen.queryByText('赛季')).not.toBeInTheDocument()
  })

  it('colours the 本周概览 sparklines per metric (蓝/紫/绿|琥珀, issue #55)', () => {
    renderDash()
    const sparkColor = (label: string): string | null => {
      const row = screen.getByText(label).closest('div')?.parentElement as HTMLElement
      return row.querySelector('path[stroke]')?.getAttribute('stroke') ?? null
    }
    expect(sparkColor('本周负荷')).toBe('var(--blue-500)')
    expect(sparkColor('疲劳 ATL')).toBe('var(--violet-500)')
    // tsb = -4 (< 0) → 状态 TSB sparkline is amber.
    expect(sparkColor('状态 TSB')).toBe('var(--amber-500)')
  })

  it('renders the connect empty state when not connected', () => {
    const onConnect = vi.fn()
    renderDash({ connected: false, onConnect })
    expect(screen.getByText('尚未连接数据源')).toBeInTheDocument()
    expect(screen.getByText('下一次训练建议')).toBeInTheDocument()
    expect(screen.getByText('Fatigue / ATL')).toBeInTheDocument()
    expect(screen.getByText('Easy TRIMP')).toBeInTheDocument()
    expect(screen.getAllByText('连接后显示').length).toBe(6)
  })
})
