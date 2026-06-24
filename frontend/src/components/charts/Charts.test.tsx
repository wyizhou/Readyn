import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { PMCChart, HRVChart } from './Charts'
import { relDayLabels } from '../../lib/chartAxis'
import type { HrvPoint, PmcPoint } from '../../lib/types'

// Regression for issue #46 E: charts get an X axis.

describe('chart X axis (v9)', () => {
  it('relDayLabels builds 「−Nd … 今天」', () => {
    expect(relDayLabels(1)).toEqual(['今天'])
    expect(relDayLabels(3)).toEqual(['−2d', '−1d', '今天'])
    expect(relDayLabels(28)[2]).toBe('今天')
  })

  it('PMCChart renders a date X axis ending at 今天', () => {
    const pmc: PmcPoint[] = [
      { i: 0, ctl: 60, atl: 62, tsb: -2, load: 70 },
      { i: 1, ctl: 61, atl: 60, tsb: 1, load: 80 },
      { i: 2, ctl: 62, atl: 58, tsb: 4, load: 90 },
    ]
    const { getByText } = render(<PMCChart data={pmc} />)
    expect(getByText('今天')).toBeInTheDocument()
    expect(getByText('−2d')).toBeInTheDocument()
  })

  it('HRVChart renders a date X axis', () => {
    const hrv: HrvPoint[] = [
      { i: 0, v: 64, base: 62 },
      { i: 1, v: 68, base: 63 },
      { i: 2, v: 71, base: 64 },
    ]
    const { getByText } = render(<HRVChart data={hrv} />)
    expect(getByText('今天')).toBeInTheDocument()
  })
})
