import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileModal } from './Profile'
import { emptyProfile } from '../lib/emptyData'

// Regression for issue #31 (P6): profile modal multi-sport (disciplines) select.

describe('ProfileModal — disciplines multi-select (P6)', () => {
  it('toggles a sport discipline on and off', async () => {
    // delay: null keeps userEvent off fake timers so clicks don't stall under
    // full-suite parallel load (same de-flake as the Connectors MFA test, #49).
    const user = userEvent.setup({ delay: null })
    render(
      <ProfileModal
        profile={emptyProfile}
        setProfile={vi.fn()}
        weightLog={[]}
        today="2026-06-18"
        onAddWeight={vi.fn()}
        onOpenSettings={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    const chip = screen.getByRole('button', { name: /跑步/ })
    expect(chip).toHaveAttribute('aria-pressed', 'false')
    await user.click(chip)
    expect(screen.getByRole('button', { name: /跑步/ })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: /跑步/ }))
    expect(screen.getByRole('button', { name: /跑步/ })).toHaveAttribute('aria-pressed', 'false')
  }, 15000)
})
