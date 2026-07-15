import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

// user_roles lookup chain: from().select().eq()
function mockRoles(roles: string[]) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: roles.map((name) => ({ roles: { name } })),
        error: null,
      }),
    }),
  }
}

describe('staff profile actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getStaffProfile', () => {
    it('rejects unauthenticated users', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const { getStaffProfile } = await import('./profile-actions')
      const result = await getStaffProfile('someone-else')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Not authenticated')
    })

    it("rejects non-admins reading another user's profile", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'doctor-1' } } })
      mockFrom.mockReturnValueOnce(mockRoles(['doctor']))

      const { getStaffProfile } = await import('./profile-actions')
      const result = await getStaffProfile('someone-else')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })
  })

  describe('updateStaffProfile', () => {
    it("rejects non-admins updating another user's profile", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'nurse-1' } } })
      mockFrom.mockReturnValueOnce(mockRoles(['nurse']))

      const { updateStaffProfile } = await import('./profile-actions')
      const result = await updateStaffProfile('someone-else', {
        name: 'New Name',
        phone: '',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('rejects invalid input', async () => {
      const { updateStaffProfile } = await import('./profile-actions')
      const result = await updateStaffProfile('user-1', { name: '', phone: '' })

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.name).toBeTruthy()
    })

    it('updates own department but never staff_code when a non-admin edits their own profile', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'doctor-1' } } })
      const staffProfileUpdates: Record<string, unknown>[] = []
      mockFrom.mockImplementation((table: string) => {
        if (table === 'user_roles') return mockRoles(['doctor'])
        if (table === 'staff_profiles') {
          return {
            update: vi.fn().mockImplementation((payload: Record<string, unknown>) => {
              staffProfileUpdates.push(payload)
              return { eq: vi.fn().mockResolvedValue({ error: null }) }
            }),
          }
        }
        if (table === 'users') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: 'doctor-1' },
                    error: null,
                  }),
                }),
              }),
            }),
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: 'doctor-1',
                    name: 'New Name',
                    email: 'doctor@drnote.com',
                    phone: null,
                    is_active: true,
                    created_at: '2026-01-01T00:00:00Z',
                    staff_profiles: { staff_code: 'DOC001', department: 'Cardiology' },
                    user_roles: [{ roles: { name: 'doctor' } }],
                  },
                  error: null,
                }),
              }),
            }),
          }
        }
        throw new Error(`unexpected table ${table}`)
      })

      const { updateStaffProfile } = await import('./profile-actions')
      const result = await updateStaffProfile('doctor-1', {
        name: 'New Name',
        phone: '',
        staff_code: 'HACKED',
        department: 'Cardiology',
      })

      expect(result.success).toBe(true)
      expect(staffProfileUpdates).toEqual([{ department: 'Cardiology' }])
      expect(result.data?.staffCode).toBe('DOC001')
    })
  })
})
