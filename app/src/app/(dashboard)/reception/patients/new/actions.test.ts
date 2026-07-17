import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUser = { id: 'receptionist-1' }
const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockSignUp = vi.fn()
const mockResetPasswordForEmail = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({
    auth: { signUp: mockSignUp, resetPasswordForEmail: mockResetPasswordForEmail },
  })),
}))

const validInput = {
  name: 'Jane Patient',
  email: 'jane.patient@example.com',
  phone: '',
  dob: '1990-01-01',
  gender: 'female' as const,
  nrc: '',
  religion: '',
  ethnicity: '',
  address: '123 Main Street',
}

function mockRoleLookup(roleName: string) {
  mockFrom.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: [{ roles: { name: roleName } }],
          error: null,
        }),
      }),
    }),
  })
}

describe('registerPatient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // clearAllMocks only clears call history — it leaves any queued
    // mockReturnValueOnce/mockResolvedValueOnce implementations in place,
    // which otherwise leak into the next test once a test short-circuits
    // before consuming everything it queued. mockReset() clears those too.
    mockFrom.mockReset()
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
  })

  it('rejects unauthenticated requests', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const { registerPatient } = await import('./actions')
    const result = await registerPatient(validInput)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Not authenticated')
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('rejects roles without patients.create (e.g. nurse)', async () => {
    mockRoleLookup('nurse')

    const { registerPatient } = await import('./actions')
    const result = await registerPatient(validInput)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('rejects invalid input before calling signUp', async () => {
    mockRoleLookup('receptionist')

    const { registerPatient } = await import('./actions')
    const result = await registerPatient({ ...validInput, email: 'not-an-email' })

    expect(result.success).toBe(false)
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  // Queues the from() mocks for every step after the role check succeeds:
  // roles lookup, then the users / patient_profiles / user_roles inserts.
  function mockHappyPathInserts() {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'role-patient' },
            error: null,
          }),
        }),
      }),
    })
    for (let i = 0; i < 3; i++) {
      mockFrom.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null }),
      })
    }
  }

  it('sends the set-password email after successful registration', async () => {
    mockRoleLookup('receptionist')
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: 'new-patient-1' } },
      error: null,
    })
    mockHappyPathInserts()
    mockResetPasswordForEmail.mockResolvedValueOnce({ error: null })

    const { registerPatient } = await import('./actions')
    const result = await registerPatient(validInput)

    expect(result.success).toBe(true)
    expect(result.patientId).toBe('new-patient-1')
    expect(result.emailSent).toBe(true)
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      validInput.email,
      expect.objectContaining({
        redirectTo: expect.stringContaining('/auth/confirm?next=/set-password'),
      })
    )
  })

  it('still succeeds (emailSent: false) when the email send fails', async () => {
    mockRoleLookup('receptionist')
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: 'new-patient-2' } },
      error: null,
    })
    mockHappyPathInserts()
    mockResetPasswordForEmail.mockResolvedValueOnce({
      error: { message: 'rate limit exceeded' },
    })

    const { registerPatient } = await import('./actions')
    const result = await registerPatient(validInput)

    expect(result.success).toBe(true)
    expect(result.patientId).toBe('new-patient-2')
    expect(result.emailSent).toBe(false)
  })

  it('maps a duplicate-email signUp error to a field error', async () => {
    mockRoleLookup('receptionist')
    mockSignUp.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'User already registered' },
    })

    const { registerPatient } = await import('./actions')
    const result = await registerPatient(validInput)

    expect(result.success).toBe(false)
    expect(result.fieldErrors?.email).toBe('This email is already registered')
  })
})
