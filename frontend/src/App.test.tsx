import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

function topHeading(): string {
  return screen.getAllByRole('heading', { level: 1 })[0].textContent ?? ''
}

describe('App integration', () => {
  it('renders the dashboard by default', () => {
    render(<App />)
    expect(topHeading()).toContain('看板')
    expect(screen.getByText('AI 洞察')).toBeInTheDocument()
    expect(screen.getByText('就绪度')).toBeInTheDocument()
    // readiness value from mock data
    expect(screen.getByText('78')).toBeInTheDocument()
  })

  it('navigates between modules via the sidebar', async () => {
    const user = userEvent.setup()
    render(<App />)

    const nav = screen.getByRole('navigation')
    await user.click(within(nav).getByText('连接器'))
    expect(topHeading()).toContain('连接器')

    await user.click(within(nav).getByText('训练库'))
    expect(topHeading()).toContain('训练库')

    await user.click(within(nav).getByText('体重记录'))
    expect(topHeading()).toContain('体重记录')

    await user.click(within(nav).getByText('看板'))
    expect(topHeading()).toContain('看板')
  })

  it('opens an activity detail and returns via the back button', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Click the first recent-activity row (the threshold-interval run).
    await user.click(screen.getByText('阈值间歇 6×1km'))
    const back = await screen.findByRole('button', { name: /返回/ })
    expect(back).toBeInTheDocument()

    await user.click(back)
    expect(topHeading()).toContain('看板')
  })

  it('toggles the implementation-annotation (spec) layer', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /实现批注/ }))
    expect(screen.getByText(/实现批注已开启/)).toBeInTheDocument()
  })

  it('opens a metric deep-dive from a hero stat', async () => {
    const user = userEvent.setup()
    render(<App />)
    // The HRV hero tile is a button; clicking opens the metric detail.
    await user.click(screen.getByRole('button', { name: /HRV/ }))
    expect(topHeading()).toContain('HRV')
  })

  it('renders the training and AI modules without errors', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = screen.getByRole('navigation')
    await user.click(within(nav).getByText('训练日历'))
    expect(topHeading()).toContain('训练日历')
    await user.click(within(nav).getByText('AI 模块'))
    expect(topHeading()).toContain('AI 模块')
  })

  it('re-renders dashboard data when the time range is switched', async () => {
    const user = userEvent.setup()
    render(<App />)
    // Default range is 28 天.
    expect(screen.getByText('近 28 天 · 体能 / 疲劳 / 状态')).toBeInTheDocument()
    expect(screen.getByText('近 28 天负荷')).toBeInTheDocument()

    // Switching to 7 天 must drive the chart card + load aggregate to recompute.
    await user.click(screen.getByText('7 天'))
    expect(screen.getByText('近 7 天 · 体能 / 疲劳 / 状态')).toBeInTheDocument()
    expect(screen.getByText('近 7 天负荷')).toBeInTheDocument()

    // Switching to 赛季 selects the full series.
    await user.click(screen.getByText('赛季'))
    expect(screen.getByText('赛季 · 体能 / 疲劳 / 状态')).toBeInTheDocument()
    expect(screen.getByText('赛季负荷')).toBeInTheDocument()
  })

  it('opens the profile modal from the sidebar', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /林 越/ }))
    expect(await screen.findByText('退出登录')).toBeInTheDocument()
  })

  it('replaces today’s course and syncs detail + calendar', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByText('训练日历'))
    // Default scheduled session is shown (detail card + week grid + month cell).
    expect(screen.getAllByText('主动恢复 + 柔韧').length).toBeGreaterThan(0)

    // Open the replace picker, choose an alternative, confirm.
    await user.click(screen.getByRole('button', { name: /替换课程/ }))
    await user.click(await screen.findByText('轻松有氧跑'))
    await user.click(screen.getByRole('button', { name: '确认替换' }))

    // The replacement now appears everywhere today's course is shown, and the
    // original title is fully gone (detail, 本周安排 grid, month calendar).
    expect(screen.getAllByText('轻松有氧跑').length).toBeGreaterThan(0)
    expect(screen.queryByText('主动恢复 + 柔韧')).not.toBeInTheDocument()
  })

  it('cancelling the replace picker keeps the original course', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByText('训练日历'))
    await user.click(screen.getByRole('button', { name: /替换课程/ }))
    await user.click(await screen.findByRole('button', { name: '取消' }))
    expect(screen.getAllByText('主动恢复 + 柔韧').length).toBeGreaterThan(0)
    expect(screen.queryByText('轻松有氧跑')).not.toBeInTheDocument()
  })

  it('marks today’s workout done and back in Training', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByText('训练日历'))
    const mark = screen.getByRole('button', { name: '标记完成' })
    await user.click(mark)
    expect(screen.getByRole('button', { name: /已完成 · 取消/ })).toBeInTheDocument()
  })

  it('today completion persists across navigation', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = screen.getByRole('navigation')
    await user.click(within(nav).getByText('训练日历'))
    await user.click(screen.getByRole('button', { name: '标记完成' }))
    expect(screen.getByRole('button', { name: /已完成 · 取消/ })).toBeInTheDocument()

    // Navigate away and back — the completion must survive (state lives in App).
    await user.click(within(nav).getByText('看板'))
    await user.click(within(nav).getByText('训练日历'))
    expect(screen.getByRole('button', { name: /已完成 · 取消/ })).toBeInTheDocument()
  })

  it('applies a saved plan and links it into the training calendar', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByText('训练库'))
    await user.click(screen.getByText('我的计划'))
    await user.click(screen.getAllByRole('button', { name: '应用' })[0])
    expect(topHeading()).toContain('训练日历')
    // Linkage: the applied plan's name now drives the Training plan header.
    expect(screen.getByText('有氧容量强化 · 4 周')).toBeInTheDocument()
    expect(screen.getByText(/已应用计划/)).toBeInTheDocument()
  })

  it('applies the AI-drafted plan and links it into the calendar', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByText('AI 模块'))
    await user.click(screen.getByRole('button', { name: '应用到日历' }))
    expect(topHeading()).toContain('训练日历')
    // The drafted plan name appears as the calendar's week header.
    expect(screen.getByText('有氧容量强化 · 第 7 周')).toBeInTheDocument()
  })

  it('connects 佳明 · 中国区 and the synced activity shows in Training', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByText('连接器'))
    await user.click(screen.getByText('数据源市场'))
    // Scope to the Garmin-CN card, then run the connect wizard.
    let card: HTMLElement | null = screen.getByText('佳明 · 中国区')
    while (card && !within(card).queryByRole('button', { name: '连接' })) card = card.parentElement
    await user.click(within(card as HTMLElement).getByRole('button', { name: '连接' }))
    await user.click(screen.getByRole('button', { name: /授权/ }))
    await user.click(screen.getByRole('button', { name: '确认映射并同步' }))
    await user.click(screen.getByRole('button', { name: '完成' }))
    // Linkage: a freshly-synced unlinked activity now appears in Training.
    await user.click(within(screen.getByRole('navigation')).getByText('训练日历'))
    expect(screen.getByText('晨间有氧跑 (设备同步)')).toBeInTheDocument()
  })

  it('records a new weight entry that shows in the log', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByText('体重记录'))
    await user.type(screen.getByPlaceholderText('例如 65.6'), '70.3')
    await user.click(screen.getByRole('button', { name: '记录体重' }))
    expect(screen.getAllByText('70.3').length).toBeGreaterThan(0)
  })

  it('opens a training-library template detail and returns', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByText('训练库'))
    await user.click(screen.getByText('节奏跑 8km'))
    expect(topHeading()).toContain('节奏跑 8km')
    await user.click(await screen.findByRole('button', { name: /返回/ }))
    expect(topHeading()).toContain('训练库')
  })

  it('opens the settings center and toggles a notification preference', async () => {
    const user = userEvent.setup()
    render(<App />)
    // Profile modal → settings center.
    await user.click(screen.getByRole('button', { name: /林 越/ }))
    await user.click(await screen.findByRole('button', { name: /设置中心/ }))
    expect(topHeading()).toContain('设置中心')

    // Go to the notifications section.
    await user.click(screen.getByRole('button', { name: '通知与提醒' }))

    // Walk up from the label to the row that owns the switch (default off → on).
    let el: HTMLElement | null = screen.getByText('每周总结')
    while (el && !within(el).queryByRole('switch')) el = el.parentElement
    const sw = within(el as HTMLElement).getByRole('switch')
    expect(sw).toHaveAttribute('aria-checked', 'false')
    await user.click(sw)
    expect(sw).toHaveAttribute('aria-checked', 'true')
  })
})
