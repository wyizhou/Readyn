import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SportFilter } from './SportFilter'
import { EmptyState } from './EmptyState'
import { SourceBadge, HowInfo } from './SourceBadge'
import { sports } from '../lib/taxonomy'

// Regression for issue #26 (P1 support layer): the sport filter, empty state,
// and source-transparency components the later phases all build on.

describe('P1 support layer', () => {
  it('SportFilter renders every sport and reports the selection', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SportFilter sports={sports} value="all" onChange={onChange} />)
    // 7 sports incl. 全部运动; the active one is marked.
    expect(screen.getAllByRole('button')).toHaveLength(sports.length)
    expect(screen.getByRole('button', { name: /全部运动/ })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: /跑步/ }))
    expect(onChange).toHaveBeenCalledWith('run')
  })

  it('EmptyState shows copy and fires the connect action', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(<EmptyState title="尚未连接数据源" desc="连接佳明后显示分析" onAction={onAction} />)
    expect(screen.getByText('尚未连接数据源')).toBeInTheDocument()
    expect(screen.getByText('连接佳明后显示分析')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /连接佳明/ }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('SourceBadge labels the data provenance', () => {
    render(<SourceBadge source="garmin" />)
    expect(screen.getByText('Garmin 直供')).toBeInTheDocument()
  })

  it('HowInfo reveals the "how calculated" popover with formula + source', async () => {
    const user = userEvent.setup()
    render(<HowInfo source="trainalyze" title="ACWR" definition="急慢性负荷比" formula="7d / 28d" />)
    // Closed by default — the transparency detail is not in the DOM yet.
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    await user.hover(screen.getByRole('button', { name: '如何计算' }))
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByText('7d / 28d')).toBeInTheDocument()
    expect(screen.getByText('Trainalyze 自算')).toBeInTheDocument()
  })
})
