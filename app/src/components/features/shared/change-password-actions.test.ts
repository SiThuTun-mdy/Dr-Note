import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUser = { id: 'user-1', email: 'user@example.com' }
const mockGetUser = vi.fn()
const mockUpdateUser = vi.fn()
const mockSignInWithPassword = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser, updateUser: mockUpdateUser },
  })),
}))

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({
    auth: { signInWithPassword: mockSignInWithPassword },
  })),
}))

const validInput = {
  currentPassword: 'old-password-1',
  password: 'new-password-1',
  confirmPassword: 'new-password-1',
}

describe('changePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
  })

  it('rejects unauthenticated requests', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const { changePassword } = await import('./change-password-actions')
    const result = await changePassword(validInput)

    expect(result.success).toBe(false)
    expect(mockSignInWithPassword).not.toHaveBeenCalled()
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  it('rejects mismatched confirmation before any auth call', async () => {
    const { changePassword } = await import('./change-password-actions')
    const result = await changePassword({
      ...validInput,
      confirmPassword: 'different-password',
    })

    expect(result.success).toBe(false)
    expect(mockSignInWithPassword).not.toHaveBeenCalled()
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  it('rejects reusing the current password', async () => {
    const { changePassword } = await import('./change-password-actions')
    const result = await changePassword({
      currentPassword: 'same-password-1',
      password: 'same-password-1',
      confirmPassword: 'same-password-1',
    })

    expect(result.success).toBe(false)
    expect(mockSignInWithPassword).not.toHaveBeenCalled()
  })

  it('maps a wrong current password to a field error without updating', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { message: 'Invalid login credentials' },
    })

    const { changePassword } = await import('./change-password-actions')
    const result = await changePassword(validInput)

    expect(result.success).toBe(false)
    expect(result.fieldErrors?.currentPassword).toBe('Current password is incorrect')
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  it('updates the password after verifying the current one', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: null })
    mockUpdateUser.mockResolvedValueOnce({ error: null })

    const { changePassword } = await import('./change-password-actions')
    const result = await changePassword(validInput)

    expect(result.success).toBe(true)
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: mockUser.email,
      password: validInput.currentPassword,
    })
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: validInput.password })
  })

  it('returns a generic error when updateUser fails', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: null })
    mockUpdateUser.mockResolvedValueOnce({
      error: { message: 'boom' },
    })

    const { changePassword } = await import('./change-password-actions')
    const result = await changePassword(validInput)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unable to change your password. Please try again.')
  })
})
