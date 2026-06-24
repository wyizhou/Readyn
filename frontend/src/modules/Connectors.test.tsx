import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock the API boundary so the real Garmin login/MFA flow runs without a backend.
const { garminConnect, garminMfa } = vi.hoisted(() => ({ garminConnect: vi.fn(), garminMfa: vi.fn() }))
vi.mock('../lib/api', () => ({ api: { garminConnect, garminMfa } }))

import { Connectors, type ConnectorsProps } from './Connectors'
import { emptyData } from '../lib/emptyData'
import type { ApexData } from '../lib/types'

function renderConn(overrides: Partial<ConnectorsProps> = {}) {
  const props: ConnectorsProps = {
    data: emptyData,
    tab: 'connected',
    setTab: vi.fn(),
    connected: false,
    onOpenConnector: vi.fn(),
    onConnect: vi.fn(),
    onToast: vi.fn(),
    ...overrides,
  }
  render(<Connectors {...props} />)
  return props
}

describe('Connectors (P3)', () => {
  beforeEach(() => {
    garminConnect.mockReset()
    garminMfa.mockReset()
  })

  it('drives the real login → MFA → success flow', async () => {
    garminConnect.mockResolvedValue({ needsMfa: true, mfaToken: 'tok' })
    garminMfa.mockResolvedValue({ activities: 3, hrv: 5, sleep: 4, weight: 2 })
    // delay:null removes userEvent's per-keystroke delay — this case types 6 MFA
    // digits and was flaky against the 5s default under full-suite parallelism (#49).
    const user = userEvent.setup({ delay: null })
    const { onConnect } = renderConn({ connected: false })

    expect(screen.getByText('尚未连接任何数据源')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /登录佳明/ }))
    await user.type(screen.getByPlaceholderText('you@example.com'), 'a@b.cn')
    await user.type(screen.getByPlaceholderText('输入密码'), 'pw')
    await user.click(screen.getByRole('button', { name: /登录并授权同步/ }))

    // MFA phase: six single-digit inputs.
    const digits = await screen.findAllByLabelText(/验证码第/)
    expect(digits).toHaveLength(6)
    for (let i = 0; i < 6; i++) await user.type(digits[i], String(i + 1))
    await user.click(screen.getByRole('button', { name: '验证' }))

    expect(await screen.findByText('已连接佳明(CN)')).toBeInTheDocument()
    expect(screen.getByText(/已同步 3 项活动/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '进入看板' }))
    expect(onConnect).toHaveBeenCalled()
    expect(garminConnect).toHaveBeenCalledWith('a@b.cn', 'pw')
    expect(garminMfa).toHaveBeenCalledWith('tok', '123456')
  }, 15000)

  it('surfaces a clear error when login fails', async () => {
    garminConnect.mockRejectedValue(new Error('POST /garmin/connect → 502'))
    const user = userEvent.setup({ delay: null })
    renderConn({ connected: false })
    await user.click(screen.getByRole('button', { name: /登录佳明/ }))
    await user.type(screen.getByPlaceholderText('you@example.com'), 'a@b.cn')
    await user.type(screen.getByPlaceholderText('输入密码'), 'pw')
    await user.click(screen.getByRole('button', { name: /登录并授权同步/ }))
    expect(await screen.findByText('登录失败')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument()
  })

  it('shows derived stats + tabs when connected', () => {
    const data: ApexData = {
      ...emptyData,
      connectors: [{ ...emptyData.connectors[0], status: 'connected', records: '5,204', sync: '12 分钟前' }],
      activities: [
        { id: 'a', name: '抱石训练', sport: '攀岩', key: 'climb', icon: 'grip', date: '今天', dist: '—', dur: '1:00', load: 70, loadSrc: '主观 RPE', hr: 120, flag: 'ok', note: '' },
      ],
    }
    renderConn({ data, connected: true })
    expect(screen.getByText('累计记录')).toBeInTheDocument()
    expect(screen.getAllByText('5,204').length).toBeGreaterThan(0)
    expect(screen.getByText('待补录 RPE')).toBeInTheDocument() // derived: 1 RPE activity
    // v9: Garmin-only — 数据源市场 tab removed; only 已连接 / 统一规范 remain.
    expect(screen.queryByText('数据源市场')).not.toBeInTheDocument()
    expect(screen.getByText('统一规范')).toBeInTheDocument()
    expect(screen.getByText(/更多数据源即将开放/)).toBeInTheDocument()
  })
})
