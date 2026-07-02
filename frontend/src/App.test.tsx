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
  it('renders the dashboard empty state when no source is connected', () => {
    // With no backend reachable in jsdom there is no data, so the redesigned
    // dashboard (P2) shows the connect empty state + greyed placeholder cards.
    render(<App />)
    expect(topHeading()).toContain('总览')
    expect(screen.getByText('尚未连接数据源')).toBeInTheDocument()
    expect(screen.getByText('就绪度')).toBeInTheDocument() // placeholder card label
    expect(screen.getByText('下一次训练建议')).toBeInTheDocument()
    expect(screen.getAllByText('连接后显示').length).toBeGreaterThan(0)
    expect(screen.queryByText(/dashboard\.html/)).not.toBeInTheDocument()
    // The connect CTA routes to the connectors module.
    expect(screen.getByRole('button', { name: /连接佳明/ })).toBeInTheDocument()
  })

  it('navigates between modules via the sidebar', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = screen.getByRole('navigation')

    // Open Design v0.1.0 shell: 5 top-level nav items and one health submenu.
    expect(within(nav).getByRole('button', { name: /01 总览/ })).toBeInTheDocument()
    expect(within(nav).getByRole('button', { name: /02 活动/ })).toBeInTheDocument()
    expect(within(nav).getByRole('button', { name: /03 健康/ })).toBeInTheDocument()
    expect(within(nav).getByRole('button', { name: /04 连接/ })).toBeInTheDocument()
    expect(within(nav).getByRole('button', { name: /05 教练/ })).toBeInTheDocument()
    expect(within(nav).getByRole('button', { name: '睡眠' })).toBeInTheDocument()
    expect(within(nav).getByRole('button', { name: '体重' })).toBeInTheDocument()
    expect(within(nav).queryByText('看板')).not.toBeInTheDocument()
    expect(within(nav).queryByText('运动记录')).not.toBeInTheDocument()
    expect(within(nav).queryByText('体重记录')).not.toBeInTheDocument()
    expect(within(nav).queryByText('连接器')).not.toBeInTheDocument()
    expect(within(nav).queryByText('AI 模块')).not.toBeInTheDocument()
    expect(within(nav).queryByText('训练日历')).not.toBeInTheDocument()
    expect(within(nav).queryByText('训练库')).not.toBeInTheDocument()

    await user.click(within(nav).getByRole('button', { name: /04 连接/ }))
    expect(topHeading()).toContain('连接')
    await user.click(within(nav).getByRole('button', { name: /02 活动/ }))
    expect(topHeading()).toContain('活动')
    await user.click(within(nav).getByRole('button', { name: /05 教练/ }))
    expect(topHeading()).toContain('教练')
    await user.click(within(nav).getByRole('button', { name: /03 健康/ }))
    expect(topHeading()).toContain('睡眠')
    expect(screen.getByText('睡眠数据骨架')).toBeInTheDocument()
    await user.click(within(nav).getByRole('button', { name: '体重' }))
    expect(topHeading()).toContain('体重')
    expect(screen.getByText('暂无体重记录')).toBeInTheDocument()
    await user.click(within(nav).getByRole('button', { name: /01 总览/ }))
    expect(topHeading()).toContain('总览')
  })

  it('does not show the dev-only spec-annotation toggle in the topbar (v9)', () => {
    render(<App />)
    expect(screen.queryByRole('button', { name: /实现批注/ })).not.toBeInTheDocument()
  })

  it('dashboard topbar shows a read-only connection status, no range/sync controls (issue #52)', () => {
    // Offline → not connected → the topbar status reads 未连接 (read-only).
    render(<App />)
    expect(screen.getByRole('status', { name: '未连接' })).toBeInTheDocument()
    // The old 7天/28天/赛季 range switch and the global 同步 button are gone.
    expect(screen.queryByRole('button', { name: /^同步$/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: '28 天' })).not.toBeInTheDocument()
    expect(screen.queryByText('赛季')).not.toBeInTheDocument()
  })

  it('records a new weight entry that shows in the log (optimistic, offline)', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = screen.getByRole('navigation')
    await user.click(within(nav).getByRole('button', { name: '体重' }))
    await user.type(screen.getByPlaceholderText('例如 65.6'), '70.3')
    await user.click(screen.getByRole('button', { name: '记录体重' }))
    expect(screen.getAllByText('70.3').length).toBeGreaterThan(0)
  })

  it('links a recorded weight into the sidebar footer and the profile modal', async () => {
    // Regression for issue #11: 健康 / 体重 → 侧栏当前体重 / 个人资料体重 联动。
    const user = userEvent.setup()
    render(<App />)

    // Empty state: sidebar footer shows the fallback (height 0cm · target 0kg).
    expect(screen.getByText('0cm · 0kg')).toBeInTheDocument()

    // Record a new weight in the 健康 / 体重 module.
    await user.click(within(screen.getByRole('navigation')).getByRole('button', { name: '体重' }))
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

  it('connectors empty state opens the real Garmin login modal (P3)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByRole('button', { name: /04 连接/ }))
    // Offline → not connected → empty state with the Garmin login CTA.
    expect(screen.getByText('尚未连接佳明')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /登录佳明/ }))
    // Real account login modal (not a mock OAuth wizard).
    expect(await screen.findByText('佳明账号（邮箱/手机）')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /登录并授权同步/ })).toBeInTheDocument()
  })

  it('connectors empty state shows the Garmin-only "更多数据源即将开放" hint (v9)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByRole('button', { name: /04 连接/ }))
    // v9: no market grid / connectable cards; just the Garmin CTA + coming-soon hint.
    expect(screen.queryByText('可连接的数据源')).not.toBeInTheDocument()
    expect(screen.getByText(/更多数据源即将开放/)).toBeInTheDocument()
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

  // ---- AI module control linkages (regression for issue #12) ----

  // ---- AI 对话 (P7: AI module is the expert chat; the 训练 tab is offline) ----

  it('AI module opens straight to the expert chat (训练 tab offline)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByRole('button', { name: /05 教练/ }))
    expect(screen.getByText('运动科学专家 · 等待同步数据')).toBeInTheDocument()
    expect(screen.queryByText(/已载入近 14 天数据/)).not.toBeInTheDocument()
    // The offline course-generation tab/canvas is not rendered.
    expect(screen.queryByText('AI 草拟计划')).not.toBeInTheDocument()
    expect(screen.queryByText('AI 训练')).not.toBeInTheDocument()
  })

  it('does not fabricate expert metrics before data sync', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByRole('button', { name: /05 教练/ }))
    await user.click(screen.getByRole('button', { name: '我的睡眠怎么样？' }))
    expect(await screen.findByText(/还没有同步的训练或健康数据/, {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.queryByText(/近 7 晚平均 7\.4h/)).not.toBeInTheDocument()
  })
})
