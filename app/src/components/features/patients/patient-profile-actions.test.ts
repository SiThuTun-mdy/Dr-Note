import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUser = { id: 'receptionist-1' }
const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

const validUpdate = {
  name: 'Jane Doe',
  phone: '0912345678',
  dob: '1990-01-01',
  gender: 'female' as const,
  nrc: '',
  religion: '',
  ethnicity: '',
  address: '',
}

const refetchedRow = {
  id: 'patient-1',
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '0912345678',
  // emergency_contacts.patient_id references patient_profiles.user_id, not
  // users.id, so PostgREST only embeds it nested under patient_profiles.
  patient_profiles: {
    nrc: null,
    dob: '1990-01-01',
    gender: 'female',
    religion: null,
    ethnicity: null,
    address: null,
    emergency_contacts: [],
  },
}

function mockRoleLookup(roleName: string) {
  mockFrom.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: [{ roles: { name: roleName } }],
        error: null,
      }),
    }),
  })
}

function mockUsersUpdateSuccess() {
  mockFrom.mockReturnValueOnce({
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'patient-1' }, error: null }),
        }),
      }),
    }),
  })
}

function mockProfileUpdateSuccess() {
  mockFrom.mockReturnValueOnce({
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: { user_id: 'patient-1' }, error: null }),
        }),
      }),
    }),
  })
}

function mockRefetchSuccess(row: typeof refetchedRow | null = refetchedRow) {
  mockFrom.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
      }),
    }),
  })
}

describe('updatePatientProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // mockReturnValueOnce queues survive clearAllMocks(); reset explicitly
    // so a test that short-circuits before consuming everything it queued
    // can't leak stale mocks into the next test.
    mockFrom.mockReset()
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
  })

  it('rejects invalid input before touching auth/database', async () => {
    const { updatePatientProfile } = await import('./patient-profile-actions')
    const result = await updatePatientProfile('patient-1', { ...validUpdate, name: '' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Please fix the highlighted fields.')
    expect(result.fieldErrors?.name).toBeTruthy()
    expect(mockGetUser).not.toHaveBeenCalled()
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('rejects an invalid dob before touching auth/database', async () => {
    const { updatePatientProfile } = await import('./patient-profile-actions')
    const result = await updatePatientProfile('patient-1', { ...validUpdate, dob: 'not-a-date' })

    expect(result.success).toBe(false)
    expect(result.fieldErrors?.dob).toBeTruthy()
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('rejects unauthenticated requests', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const { updatePatientProfile } = await import('./patient-profile-actions')
    const result = await updatePatientProfile('patient-1', validUpdate)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Not authenticated')
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('rejects roles without patients.update (e.g. doctor)', async () => {
    mockRoleLookup('doctor')

    const { updatePatientProfile } = await import('./patient-profile-actions')
    const result = await updatePatientProfile('patient-1', validUpdate)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
  })

  it('rejects roles without patients.update (e.g. nurse)', async () => {
    mockRoleLookup('nurse')

    const { updatePatientProfile } = await import('./patient-profile-actions')
    const result = await updatePatientProfile('patient-1', validUpdate)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
  })

  it('updates and returns the refreshed profile for an allowed role (receptionist)', async () => {
    mockRoleLookup('receptionist')
    mockUsersUpdateSuccess()
    mockProfileUpdateSuccess()
    mockRefetchSuccess()

    const { updatePatientProfile } = await import('./patient-profile-actions')
    const result = await updatePatientProfile('patient-1', validUpdate)

    expect(result.success).toBe(true)
    expect(result.data?.name).toBe('Jane Doe')
    expect(result.data?.gender).toBe('female')
  })

  it('updates for an allowed role (admin)', async () => {
    mockRoleLookup('admin')
    mockUsersUpdateSuccess()
    mockProfileUpdateSuccess()
    mockRefetchSuccess()

    const { updatePatientProfile } = await import('./patient-profile-actions')
    const result = await updatePatientProfile('patient-1', validUpdate)

    expect(result.success).toBe(true)
  })

  it('surfaces an error when the users update affects no rows (e.g. RLS no-op)', async () => {
    mockRoleLookup('receptionist')
    mockFrom.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    })

    const { updatePatientProfile } = await import('./patient-profile-actions')
    const result = await updatePatientProfile('patient-1', validUpdate)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unable to update patient. Please try again.')
  })

  it('surfaces an error when the users update fails with a DB error', async () => {
    mockRoleLookup('receptionist')
    mockFrom.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
          }),
        }),
      }),
    })

    const { updatePatientProfile } = await import('./patient-profile-actions')
    const result = await updatePatientProfile('patient-1', validUpdate)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unable to update patient. Please try again.')
  })

  it('surfaces an error when the patient_profiles update affects no rows', async () => {
    mockRoleLookup('receptionist')
    mockUsersUpdateSuccess()
    mockFrom.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    })

    const { updatePatientProfile } = await import('./patient-profile-actions')
    const result = await updatePatientProfile('patient-1', validUpdate)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unable to update patient. Please try again.')
  })

  it('reports a save-succeeded-but-refresh-failed error when the refetch fails', async () => {
    mockRoleLookup('receptionist')
    mockUsersUpdateSuccess()
    mockProfileUpdateSuccess()
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    })

    const { updatePatientProfile } = await import('./patient-profile-actions')
    const result = await updatePatientProfile('patient-1', validUpdate)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Saved, but could not refresh the page. Please reload.')
  })

  it('normalizes an array-shaped patient_profiles relation on refetch', async () => {
    mockRoleLookup('receptionist')
    mockUsersUpdateSuccess()
    mockProfileUpdateSuccess()
    mockRefetchSuccess({ ...refetchedRow, patient_profiles: [refetchedRow.patient_profiles] as never })

    const { updatePatientProfile } = await import('./patient-profile-actions')
    const result = await updatePatientProfile('patient-1', validUpdate)

    expect(result.success).toBe(true)
    expect(result.data?.gender).toBe('female')
  })
})
