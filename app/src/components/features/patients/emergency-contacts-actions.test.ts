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

const validContact = { name: 'Jane Emergency', relationship: 'Sister', phone: '0912345678' }

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

describe('addEmergencyContact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // mockReturnValueOnce queues survive clearAllMocks(); reset explicitly
    // so a test that short-circuits before consuming everything it queued
    // can't leak stale mocks into the next test.
    mockFrom.mockReset()
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
  })

  it('rejects unauthenticated requests', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const { addEmergencyContact } = await import('./emergency-contacts-actions')
    const result = await addEmergencyContact('patient-1', validContact)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Not authenticated')
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('rejects roles without patients.create (e.g. nurse)', async () => {
    mockRoleLookup('nurse')

    const { addEmergencyContact } = await import('./emergency-contacts-actions')
    const result = await addEmergencyContact('patient-1', validContact)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
  })

  it('rejects invalid input before touching the database', async () => {
    const { addEmergencyContact } = await import('./emergency-contacts-actions')
    const result = await addEmergencyContact('patient-1', { name: '', relationship: '', phone: '' })

    expect(result.success).toBe(false)
    // Validation runs before auth/role checks — no Supabase call at all.
    expect(mockFrom).not.toHaveBeenCalled()
    expect(mockGetUser).not.toHaveBeenCalled()
  })

  it('inserts and returns the created contact for an allowed role', async () => {
    mockRoleLookup('receptionist')
    const mockSingle = vi.fn().mockResolvedValue({
      data: { id: 'contact-1', name: 'Jane Emergency', relationship: 'Sister', phone: '0912345678' },
      error: null,
    })
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({ single: mockSingle }),
      }),
    })

    const { addEmergencyContact } = await import('./emergency-contacts-actions')
    const result = await addEmergencyContact('patient-1', validContact)

    expect(result.success).toBe(true)
    expect(result.data?.name).toBe('Jane Emergency')
  })

  it('surfaces a human error when the insert fails', async () => {
    mockRoleLookup('receptionist')
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
        }),
      }),
    })

    const { addEmergencyContact } = await import('./emergency-contacts-actions')
    const result = await addEmergencyContact('patient-1', validContact)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unable to add contact. Please try again.')
  })
})

describe('removeEmergencyContact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // mockReturnValueOnce queues survive clearAllMocks(); reset explicitly
    // so a test that short-circuits before consuming everything it queued
    // can't leak stale mocks into the next test.
    mockFrom.mockReset()
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
  })

  it('rejects unauthenticated requests', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const { removeEmergencyContact } = await import('./emergency-contacts-actions')
    const result = await removeEmergencyContact('contact-1')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Not authenticated')
  })

  it('rejects roles without patients.update (e.g. doctor)', async () => {
    mockRoleLookup('doctor')

    const { removeEmergencyContact } = await import('./emergency-contacts-actions')
    const result = await removeEmergencyContact('contact-1')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
  })

  it('deletes for an allowed role', async () => {
    mockRoleLookup('admin')
    mockFrom.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })

    const { removeEmergencyContact } = await import('./emergency-contacts-actions')
    const result = await removeEmergencyContact('contact-1')

    expect(result.success).toBe(true)
  })

  it('surfaces a human error when the delete fails', async () => {
    mockRoleLookup('admin')
    mockFrom.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'db error' } }),
      }),
    })

    const { removeEmergencyContact } = await import('./emergency-contacts-actions')
    const result = await removeEmergencyContact('contact-1')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unable to remove contact. Please try again.')
  })
})
