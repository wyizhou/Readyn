import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompareModal } from './CompareModal'
import type { Activity } from '../lib/types'

const mk = (i: number): Activity => ({
  id: 'act' + i,
  name: '活动' + i,
  sport: '跑步',
  key: 'run',
  icon: 'footprints',
  date: `2026-06-${10 + i}`,
  dist: '10.0 km',
  dur: '50:00',
  load: 50 + i,
  loadSrc: 'HR-TRIMP',
  hr: 150,
  flag: 'ok',
  note: '',
})
const acts = Array.from({ length: 5 }, (_, i) => mk(i))

describe('CompareModal (#46 D)', () => {
  it('requires 2–4 selections before confirming', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<CompareModal activities={acts} onClose={vi.fn()} onConfirm={onConfirm} />)
    const start = screen.getByRole('button', { name: /开始对比/ })
    expect(start).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /活动0/ }))
    await user.click(screen.getByRole('button', { name: /活动1/ }))
    expect(start).toBeEnabled()
    await user.click(start)
    expect(onConfirm).toHaveBeenCalledWith(['act0', 'act1'])
  })

  it('caps the selection at 4', async () => {
    const user = userEvent.setup()
    render(<CompareModal activities={acts} onClose={vi.fn()} onConfirm={vi.fn()} />)
    for (let i = 0; i < 4; i++) await user.click(screen.getByRole('button', { name: new RegExp(`活动${i}`) }))
    // the 5th is now disabled (max 4)
    expect(screen.getByRole('button', { name: /活动4/ })).toBeDisabled()
  })
})
