import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConnectorDetail } from './ConnectorDetail'
import type { Connector } from '../lib/types'

// Regression for issue #46 (v9): 断开 requires a confirmation modal.

const src: Connector = {
  id: 'garmin-cn',
  name: '佳明 · 中国区',
  cat: '可穿戴设备',
  status: 'connected',
  icon: 'watch',
  color: '#007cc3',
  sync: '12 分钟前',
  metrics: ['跑步', 'HRV', '睡眠'],
  records: '5,204',
}

describe('ConnectorDetail — disconnect confirmation (v9)', () => {
  it('asks for confirmation before disconnecting', async () => {
    const user = userEvent.setup()
    const onDisconnect = vi.fn()
    render(<ConnectorDetail src={src} onSync={vi.fn()} onBackfill={vi.fn()} onDisconnect={onDisconnect} />)

    // Clicking 断开 opens a confirm modal; it does NOT disconnect immediately.
    await user.click(screen.getByRole('button', { name: '断开' }))
    expect(onDisconnect).not.toHaveBeenCalled()
    expect(screen.getByText('断开 佳明 · 中国区？')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '确认断开' }))
    expect(onDisconnect).toHaveBeenCalledTimes(1)
  })

  it('cancels without disconnecting', async () => {
    const user = userEvent.setup()
    const onDisconnect = vi.fn()
    render(<ConnectorDetail src={src} onSync={vi.fn()} onBackfill={vi.fn()} onDisconnect={onDisconnect} />)
    await user.click(screen.getByRole('button', { name: '断开' }))
    await user.click(screen.getByRole('button', { name: '取消' }))
    expect(onDisconnect).not.toHaveBeenCalled()
    expect(screen.queryByText('断开 佳明 · 中国区？')).not.toBeInTheDocument()
  })
})
