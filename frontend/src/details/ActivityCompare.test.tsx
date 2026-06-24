import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivityCompare } from './ActivityCompare'
import { emptyData } from '../lib/emptyData'
import type { ApexData } from '../lib/types'

const data: ApexData = {
  ...emptyData,
  activities: [
    { id: 'a1', name: '晨跑', sport: '跑步', key: 'run', icon: 'footprints', date: '今天', dist: '12.0 km', dur: '58:00', load: 96, loadSrc: 'HR-TRIMP', hr: 162, flag: 'high', note: '' },
    { id: 'a2', name: '环城骑行', sport: '骑行', key: 'ride', icon: 'bike', date: '昨天', dist: '46.0 km', dur: '1:30:00', load: 88, loadSrc: '功率 TSS', hr: 141, flag: 'ok', note: '' },
  ],
}

describe('ActivityCompare (#46 D)', () => {
  it('compares the selected activities with a metric table + HR overlay', () => {
    render(<ActivityCompare data={data} ids={['a1', 'a2']} onOpenActivity={vi.fn()} />)
    expect(screen.getByText('指标对比')).toBeInTheDocument()
    // names appear in both the table header and the overlay legend
    expect(screen.getAllByText('晨跑').length).toBeGreaterThan(0)
    expect(screen.getAllByText('环城骑行').length).toBeGreaterThan(0)
    expect(screen.getByText('负荷')).toBeInTheDocument()
    expect(screen.getByText('心率叠加 · 按进度对齐')).toBeInTheDocument()
  })

  it('needs at least two valid activities', () => {
    render(<ActivityCompare data={data} ids={['a1']} onOpenActivity={vi.fn()} />)
    expect(screen.getByText(/需要至少 2 项/)).toBeInTheDocument()
  })
})
