import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AIModule } from './AIModule'
import { emptyData, emptyProfile } from '../lib/emptyData'
import type { Profile } from '../lib/types'

// Regression for issue #32 (P7): AI 对话 — built-in fallback vs real model (local
// key, called directly from the browser), and the offline TrainTab is hidden.

function renderAI(profile: Profile) {
  render(
    <AIModule
      data={emptyData}
      tab="chat"
      setTab={vi.fn()}
      seed={null}
      body={{ weight: 65, bmi: 21 }}
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
    expect(screen.getByText(/运动科学专家 · 已载入/)).toBeInTheDocument()
    expect(screen.queryByText('AI 训练')).not.toBeInTheDocument()
  })

  it('falls back to built-in expert replies without an AI key', async () => {
    const user = userEvent.setup()
    renderAI(emptyProfile)
    await user.click(screen.getByRole('button', { name: '我的睡眠怎么样？' }))
    expect(await screen.findByText(/近 7 晚平均 7\.4h/, {}, { timeout: 4000 })).toBeInTheDocument()
  })

  it('calls the real model (browser→provider) when a key is configured', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '真实模型回复 ABC' } }] }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    renderAI({ ...emptyProfile, aiProvider: 'OpenAI', aiBase: 'https://api.example.com/v1', aiKey: 'sk-test', aiModel: 'gpt-4o' })
    await user.click(screen.getByRole('button', { name: '解读我的 HRV 趋势' }))
    expect(await screen.findByText('真实模型回复 ABC', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/v1/chat/completions', expect.objectContaining({ method: 'POST' }))
  })
})
