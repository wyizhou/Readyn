import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActivityDetail } from './ActivityDetail'
import { emptyData } from '../lib/emptyData'
import type { Activity } from '../lib/types'

// Regression for issue #29 (P4): activity-level load-source transparency + RPE
// backfill for HR-less sports.

const runAct: Activity = { id: 'a1', name: '晨跑', sport: '跑步', key: 'run', icon: 'footprints', date: '今天', dist: '12.0 km', dur: '58:00', load: 96, loadSrc: 'HR-TRIMP', hr: 162, flag: 'ok', note: '' }
const climbAct: Activity = { id: 'a2', name: '抱石训练', sport: '攀岩', key: 'climb', icon: 'grip', date: '今天', dist: '—', dur: '1:30:00', load: 74, loadSrc: '主观 RPE', hr: 121, flag: 'ok', note: '' }

describe('ActivityDetail — load source + RPE (P4)', () => {
  it('shows the load-source bar labelled by the activity loadSrc', () => {
    render(<ActivityDetail data={emptyData} act={runAct} spec={false} onToast={vi.fn()} />)
    expect(screen.getByText('负荷来源')).toBeInTheDocument()
    expect(screen.getByText('HR-TRIMP')).toBeInTheDocument()
  })

  it('does not offer RPE backfill for HR-based sports', () => {
    render(<ActivityDetail data={emptyData} act={runAct} spec={false} onToast={vi.fn()} />)
    expect(screen.queryByLabelText('RPE')).not.toBeInTheDocument()
  })

  it('offers RPE backfill for HR-less sports and recomputes the load (sRPE)', async () => {
    const user = userEvent.setup()
    const onToast = vi.fn()
    render(<ActivityDetail data={emptyData} act={climbAct} spec={false} onToast={onToast} />)
    expect(screen.getByText('主观 RPE')).toBeInTheDocument()
    const slider = screen.getByLabelText('RPE')
    // 1:30:00 = 90 min; RPE 8 → sRPE 720 AU.
    fireEvent.change(slider, { target: { value: '8' } })
    await user.click(screen.getByRole('button', { name: '补录' }))
    expect(onToast).toHaveBeenCalledWith(expect.stringContaining('720 AU'))
  })
})
