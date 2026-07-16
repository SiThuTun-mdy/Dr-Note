import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUser = { id: 'receptionist-1' }
const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockSignUp = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({
    auth: { signUp: mockSignUp },
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
