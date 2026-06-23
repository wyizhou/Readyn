import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MetricDetail } from './MetricDetail'
import { emptyData } from '../lib/emptyData'
import type { ApexData, MetricDeepDive } from '../lib/types'

// Regression for issue #30 (P5): metric deep-dive — global vs sport-specific +
// algorithm transparency + related-metric navigation.

const base: Omit<MetricDeepDive, 'name' | 'short' | 'value' | 'unit' | 'color'> = {
  delta: '+4',
  deltaTone: 'pos',
  status: '良好',
  statusTone: 'positive',
  definition: '逐次心跳间期的变异程度。',
  formula: 'RMSSD = √( Σ(ΔRR)² / (N−1) )',
  bands: [{ label: '良好', range: '> 65 ms', color: 'var(--green-500)', active: true }],
  factors: [{ label: '睡眠质量', impact: 'pos', v: '评分 84' }],
  ai: { text: '基线抬升，恢复良好。', tags: ['基线抬升'] },
  related: [],
}

const data: ApexData = {
  ...emptyData,
  hrv: [{ i: 0, v: 70, base: 60 }],
  metrics: {
    hrv: { ...base, name: '心率变异性 (HRV)', short: 'HRV', value: 71, unit: 'ms', color: 'var(--green-500)', source: 'garmin', scope: 'global', family: 'RMSSD 7 日基线', params: '夜间逐拍 RMSSD', related: ['ctl'] },
    ctl: { ...base, name: '慢性训练负荷', short: 'CTL', value: 78, unit: '', color: 'var(--blue-500)', source: 'readyn', scope: 'global' },
    vo2max_run: { ...base, name: 'VO₂max（跑步）', short: 'VO₂max', value: 56, unit: 'ml/kg/min', color: 'var(--blue-500)', source: 'garmin', scope: 'sport', sportKey: 'run', family: '设备估算' },
  },
}

describe('MetricDetail (P5)', () => {
  it('marks a global metric and shows its source + algorithm transparency', () => {
    render(<MetricDetail data={data} id="hrv" onOpenMetric={vi.fn()} />)
    expect(screen.getByText('全局 · 全运动汇总')).toBeInTheDocument()
    expect(screen.getAllByText('Garmin 直供').length).toBeGreaterThan(0)
    expect(screen.getByText('RMSSD = √( Σ(ΔRR)² / (N−1) )')).toBeInTheDocument()
    expect(screen.getByText('RMSSD 7 日基线')).toBeInTheDocument() // algorithm family
    expect(screen.getByText('夜间逐拍 RMSSD')).toBeInTheDocument() // params
  })

  it('marks a sport-specific metric with its sport', () => {
    render(<MetricDetail data={data} id="vo2max_run" onOpenMetric={vi.fn()} />)
    expect(screen.getByText('专项 · 跑步')).toBeInTheDocument()
  })

  it('navigates to a related metric', async () => {
    const user = userEvent.setup()
    const onOpenMetric = vi.fn()
    render(<MetricDetail data={data} id="hrv" onOpenMetric={onOpenMetric} />)
    await user.click(screen.getByRole('button', { name: /CTL/ }))
    expect(onOpenMetric).toHaveBeenCalledWith('ctl')
  })

  it('renders nothing for an unknown metric id', () => {
    const { container } = render(<MetricDetail data={data} id="nope" onOpenMetric={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })
})
