import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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
    range: '28d',
    setRange: vi.fn(),
    sport: 'all',
    setSport: vi.fn(),
    connected: true,
    onConnect: vi.fn(),
    onOpenAI: vi.fn(),
    onAskAI: vi.fn(),
    onOpenActivity: vi.fn(),
    onOpenMetric: vi.fn(),
    ...overrides,
  }
  render(<Dashboard {...props} />)
  return props
}

describe('Dashboard (P2 redesign)', () => {
  it('shows the all-sport core with source-transparency badges', () => {
    renderDash()
    expect(screen.getByText('就绪度')).toBeInTheDocument()
    // Garmin-sourced numbers (readiness/HRV/sleep) carry the 直供 badge.
    expect(screen.getAllByText('Garmin 直供').length).toBeGreaterThan(0)
    // The PMC (computed) section carries the Readyn 自算 badge.
    expect(screen.getByText('Readyn 自算')).toBeInTheDocument()
    // Recent activity row shows its load source.
    expect(screen.getByText('HR-TRIMP')).toBeInTheDocument()
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

  it('renders the connect empty state when not connected', () => {
    const onConnect = vi.fn()
    renderDash({ connected: false, onConnect })
    expect(screen.getByText('尚未连接数据源')).toBeInTheDocument()
    expect(screen.getAllByText('连接后显示').length).toBe(3)
  })
})
