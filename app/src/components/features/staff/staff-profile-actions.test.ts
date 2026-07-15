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

      const { getStaffProfile } = await import('./staff-profile-actions')
      const result = await getStaffProfile('someone-else')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Not authenticated')
    })

    it("rejects non-admins reading another user's profile", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'doctor-1' } } })
      mockFrom.mockReturnValueOnce(mockRoles(['doctor']))

      const { getStaffProfile } = await import('./staff-profile-actions')
      const result = await getStaffProfile('someone-else')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })
  })

  describe('updateStaffProfile', () => {
    it("rejects non-admins updating another user's profile", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'nurse-1' } } })
      mockFrom.mockReturnValueOnce(mockRoles(['nurse']))

      const { updateStaffProfile } = await import('./staff-profile-actions')
      const result = await updateStaffProfile('someone-else', {
        name: 'New Name',
        phone: '',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('rejects invalid input', async () => {
      const { updateStaffProfile } = await import('./staff-profile-actions')
      const result = await updateStaffProfile('user-1', { name: '', phone: '' })

      expect(result.success).toBe(false)
      expect(result.fieldErrors?.name).toBeTruthy()
    })

    it('does not touch staff_profiles when a non-admin updates their own profile', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'doctor-1' } } })
      const touchedTables: string[] = []
      mockFrom.mockImplementation((table: string) => {
        touchedTables.push(table)
        if (table === 'user_roles') return mockRoles(['doctor'])
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
                    staff_profiles: { staff_code: 'DOC001', department: 'GP' },
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

      const { updateStaffProfile } = await import('./staff-profile-actions')
      const result = await updateStaffProfile('doctor-1', {
        name: 'New Name',
        phone: '',
        staff_code: 'HACKED',
        department: 'HACKED',
      })

      expect(result.success).toBe(true)
      expect(touchedTables).not.toContain('staff_profiles')
      expect(result.data?.staffCode).toBe('DOC001')
    })
  })
})
