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

  // ---- AI module control linkages (regression for issue #12) ----

  it('updates the AI draft in real time from a suggestion chip', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByText('AI 模块'))
    // The 训练 tab is default and shows the base draft.
    expect(screen.getByText('有氧容量强化 · 第 7 周')).toBeInTheDocument()
    // A suggestion chip («改成 4 周周期») must mutate the live draft canvas.
    await user.click(screen.getByRole('button', { name: '改成 4 周周期' }))
    expect(await screen.findByText('有氧容量强化 · 4 周周期', {}, { timeout: 4000 })).toBeInTheDocument()
  })

  it('sends a chat message and gets an expert reply', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByText('AI 模块'))
    await user.click(screen.getByText('AI 对话'))
    await user.click(screen.getByRole('button', { name: '我的睡眠怎么样？' }))
    // The user message lands and the AI replies (sleep branch of expertReply).
    expect(await screen.findByText(/近 7 晚平均 7\.4h/, {}, { timeout: 4000 })).toBeInTheDocument()
  })

  it('saves the AI draft into 训练库 · 我的计划', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByText('AI 模块'))
    await user.click(screen.getByRole('button', { name: /保存到训练库/ }))
    // Inline confirmation is immediate; then App routes to the library.
    expect(screen.getByText('已保存到训练库 · 我的计划')).toBeInTheDocument()
    expect(await screen.findByText(/已保存计划/, {}, { timeout: 4000 })).toBeInTheDocument()
    expect(topHeading()).toContain('训练库')
  })

  it('applies the AI draft to the training calendar with the plan name linked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByText('AI 模块'))
    await user.click(screen.getByRole('button', { name: /应用到日历/ }))
    expect(topHeading()).toContain('训练日历')
    // The applied plan name is linked through to the calendar subtitle.
    expect(screen.getAllByText(/有氧容量强化 · 第 7 周/).length).toBeGreaterThan(0)
  })

  it('switches between AI 训练 and AI 对话 tabs', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByText('AI 模块'))
    // 训练 default: draft canvas present.
    expect(screen.getByText('AI 草拟计划')).toBeInTheDocument()
    await user.click(screen.getByText('AI 对话'))
    // 对话: expert chat header present, draft canvas gone.
    expect(screen.getByText(/运动科学专家 · 已载入/)).toBeInTheDocument()
    expect(screen.queryByText('AI 草拟计划')).not.toBeInTheDocument()
  })
})
