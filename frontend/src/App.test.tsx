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

  it('opens the profile modal from the sidebar', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /林 越/ }))
    expect(await screen.findByText('退出登录')).toBeInTheDocument()
  })

  it('marks today’s workout done and back in Training', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByText('训练日历'))
    const mark = screen.getByRole('button', { name: '标记完成' })
    await user.click(mark)
    expect(screen.getByRole('button', { name: /已完成 · 取消/ })).toBeInTheDocument()
  })

  it('applies a saved plan from the Library to the training calendar', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByText('训练库'))
    await user.click(screen.getByText('我的计划'))
    await user.click(screen.getAllByRole('button', { name: '应用' })[0])
    expect(topHeading()).toContain('训练日历')
  })

  it('applies the AI-drafted plan to the calendar', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation')).getByText('AI 模块'))
    await user.click(screen.getByRole('button', { name: '应用到日历' }))
    expect(topHeading()).toContain('训练日历')
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
