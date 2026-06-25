import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { emptyData } from './lib/emptyData'
import { defaultSettings } from './lib/defaultSettings'
import type { ApexData } from './lib/types'

// Regression for issue #61: 断开 must close the v10 loop — `connected` is derived
// from synced data, so disconnecting has to land the app on the 未连接 empty state.
// We mock the backend so App boots into a CONNECTED state, then drive the
// disconnect flow through the real UI and assert it falls back to the empty state.

const connectedData: ApexData = {
  ...emptyData,
  today: { ...emptyData.today, readiness: 78, hrv: 71, rhr: 47, sleep: 7.4, ctl: 78, atl: 82, tsb: -4 },
  pmc: [{ i: 0, ctl: 78, atl: 82, tsb: -4, load: 96 }],
  activities: [
    { id: 'a1', name: '晨跑', sport: '跑步', key: 'run', icon: 'footprints', date: '今天', dist: '12.0 km', dur: '58:00', load: 96, loadSrc: 'HR-TRIMP', hr: 162, flag: 'high', note: '' },
  ],
  connectors: [{ id: 'garmin-cn', name: '佳明 · 中国区', cat: '可穿戴设备', status: 'connected', icon: 'watch', color: '#007cc3', sync: '12 分钟前', metrics: ['跑步', 'HRV', '睡眠'], records: '5,204' }],
}

vi.mock('./lib/api', () => ({
  api: {
    bootstrap: vi.fn(() => Promise.resolve(connectedData)),
    getSettings: vi.fn(() => Promise.resolve(defaultSettings)),
    saveSettings: vi.fn(() => Promise.resolve(defaultSettings)),
    updateProfile: vi.fn(() => Promise.resolve()),
    addWeight: vi.fn(() => Promise.resolve([])),
    garminSync: vi.fn(() => Promise.resolve({ activities: 0, hrv: 0, sleep: 0, weight: 0, lastSync: '' })),
  },
}))

// Imported after the mock is registered.
const { default: App } = await import('./App')

describe('App — disconnect closes the v10 loop (#61)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('disconnect → confirm → lands on the 未连接 empty state', async () => {
    const user = userEvent.setup({ delay: null })
    render(<App />)

    // Boots connected: the topbar shows the read-only 已连接佳明(CN) status.
    expect(await screen.findByRole('status', { name: '已连接佳明(CN)' }, { timeout: 4000 })).toBeInTheDocument()

    // Go to 连接器 → open the Garmin connector detail via 配置.
    await user.click(within(screen.getByRole('navigation')).getByText('连接器'))
    await user.click(await screen.findByRole('button', { name: /配置/ }))

    // Disconnect with the confirmation step.
    await user.click(screen.getByRole('button', { name: '断开' }))
    await user.click(screen.getByRole('button', { name: '确认断开' }))

    // The loop closes: connected flips false → connectors 未连接 empty state with
    // the Garmin re-login CTA.
    expect(await screen.findByRole('button', { name: /登录佳明（中国区）/ })).toBeInTheDocument()
  }, 15000)
})
