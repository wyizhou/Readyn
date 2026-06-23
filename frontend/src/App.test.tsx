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

  it('links a recorded weight into the sidebar footer and the profile modal', async () => {
    // Regression for issue #11: 体重记录 → 侧栏当前体重 / 个人资料体重 联动。
    const user = userEvent.setup()
    render(<App />)

    // Empty state: sidebar footer shows the fallback (height 0cm · target 0kg).
    expect(screen.getByText('0cm · 0kg')).toBeInTheDocument()

    // Record a new weight in the 体重记录 module.
    await user.click(within(screen.getByRole('navigation')).getByText('体重记录'))
    await user.type(screen.getByPlaceholderText('例如 65.6'), '70.3')
    await user.click(screen.getByRole('button', { name: '记录体重' }))

    // Sidebar footer (always mounted) now reflects the new current weight.
    const footer = screen.getByText('0cm · 70.3kg')
    expect(footer).toBeInTheDocument()

    // Opening the profile modal from that footer shows the same linked weight.
    await user.click(footer.closest('button') as HTMLElement)
    const linkLabel = await screen.findByText('当前体重 · 来自体重记录')
    const block = linkLabel.parentElement as HTMLElement
    expect(within(block).getByText(/70\.3/)).toBeInTheDocument()
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
})
