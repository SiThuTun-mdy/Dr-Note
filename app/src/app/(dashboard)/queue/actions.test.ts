import { describe, it, expect, vi, beforeEach } from "vitest"

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------

const mockUser = { id: "user-1" }
const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockRpc = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
    rpc: mockRpc,
  })),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("queue actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    mockRpc.mockResolvedValue({ data: true, error: null })
  })

  describe("transitionVisitStatus", () => {
    it("rejects unauthenticated users", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("visit-1", "screening")

      expect(result.success).toBe(false)
      expect(result.error).toBe("Not authenticated")
    })

    it("rejects invalid transition (completed → screening)", async () => {
      // Role check: admin
      mockFrom
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [{ roles: { name: "admin" } }],
                error: null,
              }),
            }),
          }),
        })
        // Visit fetch
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "visit-1", status: "completed", doctor_id: null },
                error: null,
              }),
            }),
          }),
        })

      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("visit-1", "screening")

      expect(result.success).toBe(false)
      expect(result.error).toContain("Invalid transition")
    })

    it("allows nurse to transition waiting → screening", async () => {
      // Role check: nurse
      mockFrom
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [{ roles: { name: "nurse" } }],
                error: null,
              }),
            }),
          }),
        })
        // Visit fetch
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "visit-1", status: "waiting", doctor_id: null },
                error: null,
              }),
            }),
          }),
        })
        // Update
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        })

      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("visit-1", "screening")

      expect(result.success).toBe(true)
    })

    it("rejects nurse attempting screening → with_doctor", async () => {
      // Role check: nurse
      mockFrom
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [{ roles: { name: "nurse" } }],
                error: null,
              }),
            }),
          }),
        })
        // Visit fetch
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "visit-1", status: "screening", doctor_id: "doc-1" },
                error: null,
              }),
            }),
          }),
        })

      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("visit-1", "with_doctor")

      expect(result.success).toBe(false)
      expect(result.error).toContain("cannot perform this transition")
    })

    it("allows doctor to transition screening → with_doctor", async () => {
      // Role check: doctor
      mockFrom
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [{ roles: { name: "doctor" } }],
                error: null,
              }),
            }),
          }),
        })
        // Visit fetch
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "visit-1", status: "screening", doctor_id: "doc-1" },
                error: null,
              }),
            }),
          }),
        })
        // Update
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        })

      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("visit-1", "with_doctor")

      expect(result.success).toBe(true)
    })

    it("allows doctor to transition with_doctor → completed", async () => {
      // Role check: doctor
      mockFrom
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [{ roles: { name: "doctor" } }],
                error: null,
              }),
            }),
          }),
        })
        // Visit fetch
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "visit-1", status: "with_doctor", doctor_id: "doc-1" },
                error: null,
              }),
            }),
          }),
        })
        // Update
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        })

      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("visit-1", "completed")

      expect(result.success).toBe(true)
    })

    it("rejects transition when no doctor is assigned (screening → with_doctor)", async () => {
      // Role check: doctor
      mockFrom
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [{ roles: { name: "doctor" } }],
                error: null,
              }),
            }),
          }),
        })
        // Visit fetch — no doctor_id
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "visit-1", status: "screening", doctor_id: null },
                error: null,
              }),
            }),
          }),
        })

      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("visit-1", "with_doctor")

      expect(result.success).toBe(false)
      expect(result.error).toContain("No doctor")
    })

    it("rejects missing visit ID", async () => {
      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("", "screening")

      expect(result.success).toBe(false)
      expect(result.error).toContain("Missing")
    })
  })
})
