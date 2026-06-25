import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActivityCompare } from './ActivityCompare'
import { emptyData } from '../lib/emptyData'
import type { Activity, ApexData } from '../lib/types'

const run1: Activity = { id: 'a1', name: '晨跑', sport: '跑步', key: 'run', icon: 'footprints', date: '今天', dist: '12.0 km', dur: '58:00', load: 96, loadSrc: 'HR-TRIMP', hr: 162, flag: 'high', note: '' }
const ride: Activity = { id: 'a2', name: '环城骑行', sport: '骑行', key: 'ride', icon: 'bike', date: '昨天', dist: '46.0 km', dur: '1:30:00', load: 88, loadSrc: '功率 TSS', hr: 141, flag: 'ok', note: '' }
const run2: Activity = { id: 'a3', name: '节奏跑', sport: '跑步', key: 'run', icon: 'footprints', date: '前天', dist: '10.0 km', dur: '52:00', load: 72, loadSrc: 'HR-TRIMP', hr: 150, flag: 'ok', note: '' }

const data: ApexData = { ...emptyData, activities: [run1, ride, run2] }

describe('ActivityCompare (#46 D · #53 v9)', () => {
  it('compares the selected activities with a metric table + HR overlay', () => {
    render(<ActivityCompare data={data} ids={['a1', 'a2']} onOpenActivity={vi.fn()} />)
    expect(screen.getByText('指标对比')).toBeInTheDocument()
    // names appear in the legend bar, table header and the overlay legend
    expect(screen.getAllByText('晨跑').length).toBeGreaterThan(0)
    expect(screen.getAllByText('环城骑行').length).toBeGreaterThan(0)
    expect(screen.getByText('负荷')).toBeInTheDocument()
    expect(screen.getByText('移动时间')).toBeInTheDocument()
    expect(screen.getByText('心率叠加 · 按进度对齐')).toBeInTheDocument()
  })

  it('shows the legend bar with 「调整」that re-opens the picker (#53)', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<ActivityCompare data={data} ids={['a1', 'a2']} onOpenActivity={vi.fn()} onEdit={onEdit} />)
    expect(screen.getByText('对比 2 条记录')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /调整/ }))
    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('adds a 平均配速 row + a 配速 overlay when every pick is a run (#53)', () => {
    render(<ActivityCompare data={data} ids={['a1', 'a3']} onOpenActivity={vi.fn()} />)
    expect(screen.getByText('平均配速')).toBeInTheDocument()
    expect(screen.getByText('配速叠加 · 按进度对齐')).toBeInTheDocument()
  })

  it('hides pace across mixed sports — only HR overlays (#53)', () => {
    render(<ActivityCompare data={data} ids={['a1', 'a2']} onOpenActivity={vi.fn()} />)
    expect(screen.queryByText('平均配速')).not.toBeInTheDocument()
    expect(screen.queryByText('配速叠加 · 按进度对齐')).not.toBeInTheDocument()
  })

  it('needs at least two valid activities', () => {
    render(<ActivityCompare data={data} ids={['a1']} onOpenActivity={vi.fn()} />)
    expect(screen.getByText(/需要至少 2 项/)).toBeInTheDocument()
  })
})
