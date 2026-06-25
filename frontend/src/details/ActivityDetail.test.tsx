import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActivityDetail } from './ActivityDetail'
import { emptyData } from '../lib/emptyData'
import type { Activity } from '../lib/types'

// Regression for issue #29 (P4): heterogeneous per-sport activity detail +
// activity-level load-source transparency + RPE backfill for HR-less sports.

const mk = (over: Partial<Activity>): Activity => ({
  id: 'x',
  name: '活动',
  sport: '跑步',
  key: 'run',
  icon: 'footprints',
  date: '今天',
  dist: '12.0 km',
  dur: '58:00',
  load: 96,
  loadSrc: 'HR-TRIMP',
  hr: 150,
  flag: 'ok',
  note: '',
  ...over,
})

const runAct = mk({ id: 'a1', name: '晨跑' })
const climbAct = mk({ id: 'a2', name: '抱石训练', sport: '攀岩', key: 'climb', icon: 'grip', dist: '—', dur: '1:30:00', load: 74, loadSrc: '主观 RPE', hr: 121 })
const rideAct = mk({ id: 'a3', name: '环城骑行', sport: '骑行', key: 'ride', icon: 'bike', dist: '46 km', dur: '1:30:00', loadSrc: '功率 TSS' })
const swimAct = mk({ id: 'a4', name: '游泳间歇', sport: '游泳', key: 'swim', icon: 'waves', dist: '2 km', dur: '42:00' })
const strengthAct = mk({ id: 'a5', name: '下肢力量', sport: '力量', key: 'strength', icon: 'dumbbell', dist: '—', dur: '1:05:00', loadSrc: '容量 + RPE' })

describe('ActivityDetail — load source + RPE (P4)', () => {
  it('labels the load-source bar by the activity loadSrc', () => {
    render(<ActivityDetail data={emptyData} act={runAct} spec={false} onToast={vi.fn()} />)
    expect(screen.getByText('负荷来源 · HR-TRIMP')).toBeInTheDocument()
  })

  it('does not offer RPE backfill for HR-based sports', () => {
    render(<ActivityDetail data={emptyData} act={runAct} spec={false} onToast={vi.fn()} />)
    expect(screen.queryByLabelText('RPE')).not.toBeInTheDocument()
  })

  it('offers RPE backfill for HR-less sports and recomputes the load (sRPE)', async () => {
    const user = userEvent.setup()
    const onToast = vi.fn()
    render(<ActivityDetail data={emptyData} act={climbAct} spec={false} onToast={onToast} />)
    expect(screen.getByText('负荷来源 · 主观 RPE')).toBeInTheDocument()
    const slider = screen.getByLabelText('RPE')
    // 1:30:00 = 90 min; RPE 8 → sRPE 720 AU.
    fireEvent.change(slider, { target: { value: '8' } })
    await user.click(screen.getByRole('button', { name: '补录' }))
    expect(onToast).toHaveBeenCalledWith(expect.stringContaining('720 AU'))
  })
})

describe('ActivityDetail — per-sport heterogeneity (P4)', () => {
  it('renders running blocks', () => {
    render(<ActivityDetail data={emptyData} act={runAct} spec={false} onToast={vi.fn()} />)
    expect(screen.getByText('配速 · 心率 · 海拔')).toBeInTheDocument()
    expect(screen.getByText('分段 (Splits)')).toBeInTheDocument()
  })

  it('renders cycling power blocks', () => {
    render(<ActivityDetail data={emptyData} act={rideAct} spec={false} onToast={vi.fn()} />)
    expect(screen.getByText('功率 · 心率')).toBeInTheDocument()
    expect(screen.getByText('功率指标')).toBeInTheDocument()
  })

  // issue #56: data curves carry Y reference values + a top-left X axis name.
  const svgText = (root: HTMLElement, re: RegExp): boolean =>
    Array.from(root.querySelectorAll('text')).some((t) => re.test(t.textContent ?? ''))

  it('labels the running curve with a 距离 km axis + bpm Y references (#56)', () => {
    const { container } = render(<ActivityDetail data={emptyData} act={runAct} spec={false} onToast={vi.fn()} />)
    expect(screen.getByText('距离 km')).toBeInTheDocument()
    expect(svgText(container, /\d+\s*bpm/)).toBe(true)
  })

  it('labels the cycling curve with a 时间 min axis + W Y references (#56)', () => {
    const { container } = render(<ActivityDetail data={emptyData} act={rideAct} spec={false} onToast={vi.fn()} />)
    expect(screen.getByText('时间 min')).toBeInTheDocument()
    expect(svgText(container, /\d+\s*W/)).toBe(true)
  })

  it('renders swimming SWOLF block', () => {
    render(<ActivityDetail data={emptyData} act={swimAct} spec={false} onToast={vi.fn()} />)
    expect(screen.getByText('分段 · SWOLF')).toBeInTheDocument()
  })

  it('renders strength movements block', () => {
    render(<ActivityDetail data={emptyData} act={strengthAct} spec={false} onToast={vi.fn()} />)
    expect(screen.getByText('动作 · 组次 · 容量')).toBeInTheDocument()
  })

  it('renders climbing sends block', () => {
    render(<ActivityDetail data={emptyData} act={climbAct} spec={false} onToast={vi.fn()} />)
    expect(screen.getByText('完攀记录')).toBeInTheDocument()
  })
})
