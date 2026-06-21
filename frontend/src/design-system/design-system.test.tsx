import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button, Badge, Switch, Tabs, ProgressRing } from './index'

describe('Design system', () => {
  it('renders a button with its label', () => {
    render(<Button>开始</Button>)
    expect(screen.getByRole('button', { name: '开始' })).toBeInTheDocument()
  })

  it('fires onClick when the button is pressed', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders a badge with a tone', () => {
    render(<Badge tone="positive">OK</Badge>)
    expect(screen.getByText('OK')).toBeInTheDocument()
  })

  it('toggles the switch via onChange', async () => {
    const onChange = vi.fn()
    render(<Switch checked={false} onChange={onChange} label="自动同步" />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('switches active tab', async () => {
    const onChange = vi.fn()
    render(<Tabs tabs={['跑步', '攀岩']} onChange={onChange} />)
    await userEvent.click(screen.getByRole('tab', { name: '攀岩' }))
    expect(onChange).toHaveBeenCalledWith('攀岩')
  })

  it('shows the progress ring label', () => {
    render(<ProgressRing value={78} sublabel="就绪度" />)
    expect(screen.getByText('78')).toBeInTheDocument()
    expect(screen.getByText('就绪度')).toBeInTheDocument()
  })
})
