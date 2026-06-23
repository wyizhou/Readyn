import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Records, type RecordsProps } from './Records'
import { pageNums } from '../lib/paginate'
import { emptyData } from '../lib/emptyData'
import type { Activity, ApexData } from '../lib/types'

const recs: Activity[] = Array.from({ length: 25 }, (_, i) => ({
  id: 'r' + i,
  name: '活动' + i,
  sport: '跑步',
  key: 'run',
  icon: 'footprints',
  date: `2026-06-${String((i % 28) + 1).padStart(2, '0')}`,
  dist: '10.0 km',
  dur: '50:00',
  load: 50,
  loadSrc: 'HR-TRIMP',
  hr: 150,
  flag: 'ok',
  note: '',
}))
const data: ApexData = { ...emptyData, records: recs }

function renderRecords(overrides: Partial<RecordsProps> = {}) {
  const props = { data, connected: true, onConnect: vi.fn(), onOpenActivity: vi.fn(), ...overrides }
  render(<Records {...props} />)
  return props
}

describe('Records (P4)', () => {
  it('pageNums collapses with … beyond 7 pages', () => {
    expect(pageNums(1, 3)).toEqual([1, 2, 3])
    const p = pageNums(5, 20)
    expect(p).toContain('…')
    expect(p[0]).toBe(1)
    expect(p[p.length - 1]).toBe(20)
  })

  it('shows the empty state when not connected', () => {
    const onConnect = vi.fn()
    renderRecords({ connected: false, onConnect })
    expect(screen.getByText('暂无运动记录')).toBeInTheDocument()
  })

  it('paginates with a default page size of 10', () => {
    renderRecords()
    expect(screen.getByText('第 1–10 条 · 共 3 页')).toBeInTheDocument()
    expect(screen.getByText('活动0')).toBeInTheDocument()
    expect(screen.getByText('活动9')).toBeInTheDocument()
    expect(screen.queryByText('活动10')).not.toBeInTheDocument()
  })

  it('changes page size and resets to page 1', async () => {
    const user = userEvent.setup()
    renderRecords()
    await user.click(screen.getByRole('button', { name: '20' }))
    expect(screen.getByText('第 1–20 条 · 共 2 页')).toBeInTheDocument()
    expect(screen.getByText('活动19')).toBeInTheDocument()
  })

  it('navigates to the next page', async () => {
    const user = userEvent.setup()
    renderRecords()
    await user.click(screen.getByRole('button', { name: '下一页' }))
    expect(screen.getByText('第 11–20 条 · 共 3 页')).toBeInTheDocument()
    expect(screen.getByText('活动10')).toBeInTheDocument()
    expect(screen.queryByText('活动0')).not.toBeInTheDocument()
  })

  it('opens the activity detail on row click', async () => {
    const user = userEvent.setup()
    const { onOpenActivity } = renderRecords()
    await user.click(screen.getByText('活动3'))
    expect(onOpenActivity).toHaveBeenCalledWith(expect.objectContaining({ id: 'r3' }))
  })
})
