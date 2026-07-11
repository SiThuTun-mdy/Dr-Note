import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUser = { id: 'admin-1' }
const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('admin users actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
  })

  describe('getUsers', () => {
    it('rejects non-admin users', async () => {
      // Admin role check returns doctor
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [{ roles: { name: 'doctor' } }],
              error: null,
            }),
          }),
        }),
      })

      const { getUsers } = await import('./actions')
      const result = await getUsers()

      expect(result.error).toBe('Unauthorized')
    })
  })

  describe('getRoles', () => {
    it('returns all roles', async () => {
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [{ id: 1, name: 'admin' }, { id: 2, name: 'doctor' }],
            error: null,
          }),
        }),
      })

      const { getRoles } = await import('./actions')
      const result = await getRoles()

      expect(result.data).toHaveLength(2)
      expect(result.data?.[0].name).toBe('admin')
    })
  })

  describe('toggleUserActive', () => {
    it('prevents admin from deactivating themselves', async () => {
      const { toggleUserActive } = await import('./actions')
      const result = await toggleUserActive('admin-1', false)

      expect(result.success).toBe(false)
      expect(result.error).toContain('cannot deactivate')
    })
  })
})
