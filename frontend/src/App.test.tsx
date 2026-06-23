import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// The mock data is gone: with no backend reachable in jsdom, the app renders the
// empty skeleton. These tests cover that honest empty-state reality plus the
// behaviours that survive without seeded data (navigation, spec layer, local
// weight entry, and the real Garmin connect modal).

function topHeading(): string {
  return screen.getAllByRole('heading', { level: 1 })[0].textContent ?? ''
}

describe('App integration (empty-state / real-data)', () => {
  it('renders the dashboard with empty states and no crash', () => {
    render(<App />)
    expect(topHeading()).toContain('看板')
    expect(screen.getByText('就绪度')).toBeInTheDocument()
    expect(screen.getByText('AI 洞察')).toBeInTheDocument()
    // Charts with no data render the shared placeholder instead of crashing.
    expect(screen.getAllByText('暂无数据').length).toBeGreaterThan(0)
  })

  it('navigates between modules via the sidebar', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = screen.getByRole('navigation')

    await user.click(within(nav).getByText('连接器'))
    expect(topHeading()).toContain('连接器')
    await user.click(within(nav).getByText('训练库'))
    expect(topHeading()).toContain('训练库')
    // Training calendar + AI modules must render on empty data without crashing.
    await user.click(within(nav).getByText('训练日历'))
    expect(topHeading()).toContain('训练日历')
    await user.click(within(nav).getByText('AI 模块'))
    expect(topHeading()).toContain('AI')
    await user.click(within(nav).getByText('体重记录'))
    expect(topHeading()).toContain('体重记录')
    await user.click(within(nav).getByText('看板'))
    expect(topHeading()).toContain('看板')
  })

  it('toggles the implementation-annotation (spec) layer', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /实现批注/ }))
    expect(screen.getByText(/实现批注已开启/)).toBeInTheDocument()
  })

  it('records a new weight entry that shows in the log (optimistic, offline)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByText('体重记录'))
    await user.type(screen.getByPlaceholderText('例如 65.6'), '70.3')
    await user.click(screen.getByRole('button', { name: '记录体重' }))
    expect(screen.getAllByText('70.3').length).toBeGreaterThan(0)
  })

  it('shows 佳明 · 中国区 in the market and opens the real credential login modal', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByText('连接器'))
    await user.click(screen.getByText('数据源市场'))

    // Scope to the Garmin-CN card and start the connect flow.
    let card: HTMLElement | null = screen.getByText('佳明 · 中国区')
    while (card && !within(card).queryByRole('button', { name: '连接' })) card = card.parentElement
    await user.click(within(card as HTMLElement).getByRole('button', { name: '连接' }))

    // The modal now collects real account credentials (not a mock OAuth wizard).
    expect(await screen.findByText('佳明账号 (邮箱/手机)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /登录并同步/ })).toBeInTheDocument()
  })

  it('renders the connectors schema tab empty without crashing', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByText('连接器'))
    await user.click(screen.getByText('统一规范'))
    // No fabricated schema rows; the canonical-model explainer still renders.
    expect(screen.getByText(/统一数据模型/)).toBeInTheDocument()
  })

  // ---- Profile & settings persistence (regression for issue #13) ----

  // Sidebar footer (the only profile entry point) → 个人资料 → 设置中心.
  async function openSettings(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByText('0cm · 0kg').closest('button') as HTMLElement)
    await user.click(screen.getByRole('button', { name: /设置中心/ }))
  }

  it('persists a settings toggle across section navigation (lifted state)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openSettings(user)
    await user.click(screen.getByRole('button', { name: '通知与提醒' }))
    // 每周总结 defaults OFF (4th notification switch).
    expect(screen.getAllByRole('switch')[3]).toHaveAttribute('aria-checked', 'false')
    await user.click(screen.getAllByRole('switch')[3])
    expect(screen.getAllByRole('switch')[3]).toHaveAttribute('aria-checked', 'true')
    // Leave the section and come back — the value must survive (App-level state,
    // not the unmounted section component's local state).
    await user.click(screen.getByRole('button', { name: '单位' }))
    await user.click(screen.getByRole('button', { name: '通知与提醒' }))
    expect(screen.getAllByRole('switch')[3]).toHaveAttribute('aria-checked', 'true')
  })

  it('prompts for a missing API key when testing the AI connection', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('0cm · 0kg').closest('button') as HTMLElement)
    // Click 测试连接 with no key entered — must surface the missing-key prompt.
    await user.click(screen.getByRole('button', { name: '测试连接' }))
    expect(await screen.findByText('请先填入 API Key', {}, { timeout: 4000 })).toBeInTheDocument()
  })

  it('locks appearance to dark and marks 浅色 as disabled / 即将推出', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openSettings(user)
    await user.click(screen.getByRole('button', { name: '外观' }))
    expect(screen.getByText('深色')).toBeInTheDocument()
    expect(screen.getByText('当前')).toBeInTheDocument()
    expect(screen.getByText('浅色')).toBeInTheDocument()
    expect(screen.getByText('即将推出')).toBeInTheDocument()
  })
})
