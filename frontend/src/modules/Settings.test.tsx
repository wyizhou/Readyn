import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsCenter } from './Settings'
import { defaultSettings } from '../lib/defaultSettings'
import { emptyProfile } from '../lib/emptyData'

// Regression for issue #31 (P6): the settings source/algorithm matrix.

describe('SettingsCenter — source/algorithm matrix (P6)', () => {
  it('shows the algorithm transparency matrix with source badges', async () => {
    const user = userEvent.setup()
    render(<SettingsCenter profile={{ ...emptyProfile, maxHR: 189 }} settings={defaultSettings} onChange={vi.fn()} onLogout={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: '数据来源与算法' }))
    expect(screen.getByText('ACWR（急慢性负荷比）')).toBeInTheDocument()
    expect(screen.getByText('训练就绪度')).toBeInTheDocument()
    expect(screen.getAllByText('Trainalyze 自算').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Garmin 直供').length).toBeGreaterThan(0)
  })
})
