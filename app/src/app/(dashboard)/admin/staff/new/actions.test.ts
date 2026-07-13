import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUser = { id: 'admin-1' }
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
  name: 'Nu Nu Nurse',
  email: 'nurse@drnote.com',
  phone: '',
  staff_code: 'NUR001',
  department: 'General Medicine',
  role: 'nurse' as const,
}

function mockUserRolesLookup(roleNames: string[]) {
  mockFrom.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: roleNames.map((name) => ({ roles: { name } })),
        error: null,
      }),
    }),
  })
}

function mockStaffCodeLookup(existing: boolean) {
  mockFrom.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: existing ? [{ user_id: 'other-user' }] : [],
          error: null,
        }),
      }),
    }),
  })
}

function mockRoleIdLookup(id: number | null) {
  mockFrom.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: id === null ? null : { id },
          error: null,
        }),
      }),
    }),
  })
}

/** Queues the checks that run before signUp: admin roles, staff_code, role id. */
function mockPreSignUpChecks() {
  mockUserRolesLookup(['admin'])
  mockStaffCodeLookup(false)
  mockRoleIdLookup(3)
}

describe('onboardStaff', () => {
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

    const { onboardStaff } = await import('./actions')
    const result = await onboardStaff(validInput)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Not authenticated')
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('rejects non-admin roles (e.g. receptionist)', async () => {
    mockUserRolesLookup(['receptionist'])

    const { onboardStaff } = await import('./actions')
    const result = await onboardStaff(validInput)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('rejects invalid input before calling signUp', async () => {
    const { onboardStaff } = await import('./actions')
    const result = await onboardStaff({ ...validInput, staff_code: '' })

    expect(result.success).toBe(false)
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('rejects a taken staff code before creating the auth user', async () => {
    mockUserRolesLookup(['admin'])
    mockStaffCodeLookup(true)

    const { onboardStaff } = await import('./actions')
    const result = await onboardStaff(validInput)

    expect(result.success).toBe(false)
    expect(result.fieldErrors?.staff_code).toBe(
      'This staff code is already in use'
    )
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('fails before signUp when the role row is missing', async () => {
    mockUserRolesLookup(['admin'])
    mockStaffCodeLookup(false)
    mockRoleIdLookup(null)

    const { onboardStaff } = await import('./actions')
    const result = await onboardStaff(validInput)

    expect(result.success).toBe(false)
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('maps a duplicate-email signUp error to a field error', async () => {
    mockPreSignUpChecks()
    mockSignUp.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'User already registered' },
    })

    const { onboardStaff } = await import('./actions')
    const result = await onboardStaff(validInput)

    expect(result.success).toBe(false)
    expect(result.fieldErrors?.email).toBe('This email is already registered')
  })

  it('detects an existing email via the obfuscated no-identities user', async () => {
    // With email confirmation ON, Supabase signUp does not error for an
    // already-registered email — enumeration protection returns a fake user
    // with an empty identities array. No inserts may run against that id.
    mockPreSignUpChecks()
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: 'fake-obfuscated-id', identities: [] } },
      error: null,
    })

    const { onboardStaff } = await import('./actions')
    const result = await onboardStaff(validInput)

    expect(result.success).toBe(false)
    expect(result.fieldErrors?.email).toBe('This email is already registered')
    // mockFrom was only called for the three pre-signUp checks — no inserts.
    expect(mockFrom).toHaveBeenCalledTimes(3)
  })

  it('returns the temp password once on success', async () => {
    mockPreSignUpChecks()
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: 'new-staff-1', identities: [{ id: 'identity-1' }] } },
      error: null,
    })
    // users, staff_profiles, user_roles inserts
    for (let i = 0; i < 3; i++) {
      mockFrom.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null }),
      })
    }

    const { onboardStaff } = await import('./actions')
    const result = await onboardStaff(validInput)

    expect(result.success).toBe(true)
    expect(result.staffId).toBe('new-staff-1')
    expect(result.tempPassword).toBeTruthy()
    expect(result.tempPassword!.length).toBeGreaterThanOrEqual(16)
  })
})
