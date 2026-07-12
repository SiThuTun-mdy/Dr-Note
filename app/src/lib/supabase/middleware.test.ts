import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Supabase SSR — single mock instance shared across all tests
const mockGetUser = vi.fn()
const mockLimit = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockFrom = vi.fn()
const mockCreateServerClient = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: (...args: unknown[]) => mockCreateServerClient(...args),
}))

// Set up the default chain: from().select().eq().limit()
mockFrom.mockReturnValue({ select: mockSelect })
mockSelect.mockReturnValue({ eq: mockEq })
mockEq.mockReturnValue({ limit: mockLimit })

mockCreateServerClient.mockImplementation(() => ({
  auth: { getUser: mockGetUser },
  from: mockFrom,
}))

// Import AFTER mock setup
import { updateSession } from './middleware'

describe('middleware - updateSession', () => {
  function createRequest(pathname: string) {
    return new NextRequest(new URL(`http://localhost:3000${pathname}`))
  }

  it('redirects unauthenticated user to /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    mockLimit.mockResolvedValue({ data: [], error: null })

    const request = createRequest('/admin')
    const response = await updateSession(request)

    expect(response).toBeDefined()
    expect(response.headers.get('location')).toContain('/login')
  })

  it('allows unauthenticated user to access /login', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const request = createRequest('/login')
    const response = await updateSession(request)

    // Should not redirect - passes through
    expect(response.headers.get('location')).toBeNull()
  })

  it('redirects authenticated user from /login to their dashboard', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockLimit.mockResolvedValue({
      data: [{ roles: { name: 'doctor' } }],
      error: null,
    })

    const request = createRequest('/login')
    const response = await updateSession(request)

    expect(response.headers.get('location')).toContain('/doctor')
  })

  it('redirects authenticated user from / to their dashboard', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockLimit.mockResolvedValue({
      data: [{ roles: { name: 'admin' } }],
      error: null,
    })

    const request = createRequest('/')
    const response = await updateSession(request)

    expect(response.headers.get('location')).toContain('/admin')
  })

  it('allows admin to access /admin routes', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockLimit.mockResolvedValue({
      data: [{ roles: { name: 'admin' } }],
      error: null,
    })

    const request = createRequest('/admin')
    const response = await updateSession(request)

    expect(response.headers.get('location')).toBeNull()
  })

  it('redirects nurse to own dashboard when accessing /admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockLimit.mockResolvedValue({
      data: [{ roles: { name: 'nurse' } }],
      error: null,
    })

    const request = createRequest('/admin/users')
    const response = await updateSession(request)

    expect(response.headers.get('location')).toContain('/nurse')
  })

  it('redirects doctor to own dashboard when accessing /reception', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockLimit.mockResolvedValue({
      data: [{ roles: { name: 'doctor' } }],
      error: null,
    })

    const request = createRequest('/reception')
    const response = await updateSession(request)

    expect(response.headers.get('location')).toContain('/doctor')
  })

  it('allows receptionist to access /reception routes', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockLimit.mockResolvedValue({
      data: [{ roles: { name: 'receptionist' } }],
      error: null,
    })

    const request = createRequest('/reception')
    const response = await updateSession(request)

    expect(response.headers.get('location')).toBeNull()
  })
})
