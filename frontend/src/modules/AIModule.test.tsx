import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AIModule } from './AIModule'
import { emptyData, emptyProfile } from '../lib/emptyData'
import type { ApexData, Profile } from '../lib/types'

// Regression for issue #32 (P7): AI 对话 — built-in fallback vs real model (local
// key, called directly from the browser), and the offline TrainTab is hidden.

const syncedData: ApexData = {
  ...emptyData,
  today: { ...emptyData.today, readiness: 78, hrv: 71, sleep: 7.4, weekLoad: 612 },
  pmc: [{ i: 0, ctl: 78, atl: 82, tsb: -4, load: 96 }],
}

function renderAI(profile: Profile, data: ApexData = emptyData) {
  render(
    <AIModule
      data={data}
      tab="chat"
      setTab={vi.fn()}
      seed={null}
      body={{ weight: 0, bmi: 0 }}
      profile={profile}
      onSaved={vi.fn()}
      onApply={vi.fn()}
    />,
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('AIModule chat (P7)', () => {
  it('hides the offline AI 训练 tab and shows the expert chat', () => {
    renderAI(emptyProfile)
    expect(screen.getByText('运动科学专家 · 等待同步数据')).toBeInTheDocument()
    expect(screen.queryByText(/已载入近 14 天数据/)).not.toBeInTheDocument()
    expect(screen.queryByText('78')).not.toBeInTheDocument()
    expect(screen.queryByText('AI 训练')).not.toBeInTheDocument()
  })

  it('does not fabricate built-in expert replies before data sync', async () => {
    const user = userEvent.setup()
    renderAI(emptyProfile)
    await user.click(screen.getByRole('button', { name: '我的睡眠怎么样？' }))
    expect(await screen.findByText(/还没有同步的训练或健康数据/, {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.queryByText(/近 7 晚平均 7\.4h/)).not.toBeInTheDocument()
  })

  it('calls the real model (browser→provider) when a key is configured', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '真实模型回复 ABC' } }] }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    renderAI({ ...emptyProfile, aiProvider: 'OpenAI', aiBase: 'https://api.example.com/v1', aiKey: 'sk-test', aiModel: 'gpt-4o' }, syncedData)
    await user.click(screen.getByRole('button', { name: '解读我的 HRV 趋势' }))
    expect(await screen.findByText('真实模型回复 ABC', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/v1/chat/completions', expect.objectContaining({ method: 'POST' }))
  })
})
