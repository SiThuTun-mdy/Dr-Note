import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

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
// Helpers — build Supabase query-builder mock chains
// ---------------------------------------------------------------------------

/** Chain for `from('user_roles').select().eq().limit()`. */
function roleChain(roleName: string | null) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: roleName ? [{ roles: { name: roleName } }] : [],
          error: null,
        }),
      }),
    }),
  }
}

/** Chain for `from('visits').select().gte().lt().order()`. */
function visitsChain(
  rows: Array<Record<string, unknown>> | null,
  error: { message: string } | null = null,
) {
  return {
    select: vi.fn().mockReturnValue({
      gte: vi.fn().mockReturnValue({
        lt: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: rows, error }),
        }),
      }),
    }),
  }
}

/** Chain for `from('visits').select().eq().single()`. */
function singleVisitChain(
  row: Record<string, unknown> | null,
  error: { message: string } | null = null,
) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: row, error }),
      }),
    }),
  }
}

/** Chain for `from('visits').update().eq()`. */
function updateChain(error: { message: string } | null = null) {
  return {
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error }),
    }),
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("queue actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    mockRpc.mockResolvedValue({ data: true, error: null })
  })

  // ---------------------------------------------------------------------------
  // transitionVisitStatus
  // ---------------------------------------------------------------------------

  describe("transitionVisitStatus", () => {
    it("rejects unauthenticated users", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("visit-1", "screening")

      expect(result.success).toBe(false)
      expect(result.error).toBe("Not authenticated")
    })

    it("rejects missing visit ID", async () => {
      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("", "screening")

      expect(result.success).toBe(false)
      expect(result.error).toContain("Missing")
    })

    it("rejects when permission check fails", async () => {
      mockRpc.mockResolvedValue({ data: false, error: null })

      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("visit-1", "screening")

      expect(result.success).toBe(false)
      expect(result.error).toContain("permission")
    })

    it("rejects when user has no role", async () => {
      mockFrom.mockReturnValueOnce(roleChain(null))

      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("visit-1", "screening")

      expect(result.success).toBe(false)
      expect(result.error).toContain("Unable to determine your role")
    })

    it("rejects when visit does not exist", async () => {
      mockFrom
        .mockReturnValueOnce(roleChain("admin"))
        .mockReturnValueOnce(singleVisitChain(null, { message: "not found" }))

      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("visit-1", "screening")

      expect(result.success).toBe(false)
      expect(result.error).toBe("Visit not found")
    })

    it("rejects invalid transition (completed -> screening)", async () => {
      mockFrom
        .mockReturnValueOnce(roleChain("admin"))
        .mockReturnValueOnce(
          singleVisitChain({
            id: "visit-1",
            status: "completed",
            doctor_id: null,
          }),
        )

      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("visit-1", "screening")

      expect(result.success).toBe(false)
      expect(result.error).toContain("Invalid transition")
    })

    it("rejects nurse attempting screening -> with_doctor", async () => {
      mockFrom
        .mockReturnValueOnce(roleChain("nurse"))
        .mockReturnValueOnce(
          singleVisitChain({
            id: "visit-1",
            status: "screening",
            doctor_id: "doc-1",
          }),
        )

      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("visit-1", "with_doctor")

      expect(result.success).toBe(false)
      expect(result.error).toContain("cannot perform this transition")
    })

    it("rejects transition when no doctor is assigned", async () => {
      mockFrom
        .mockReturnValueOnce(roleChain("doctor"))
        .mockReturnValueOnce(
          singleVisitChain({
            id: "visit-1",
            status: "screening",
            doctor_id: null,
          }),
        )

      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("visit-1", "with_doctor")

      expect(result.success).toBe(false)
      expect(result.error).toContain("No doctor")
    })

    it("rejects when database update fails", async () => {
      mockFrom
        .mockReturnValueOnce(roleChain("doctor"))
        .mockReturnValueOnce(
          singleVisitChain({
            id: "visit-1",
            status: "screening",
            doctor_id: "doc-1",
          }),
        )
        .mockReturnValueOnce(updateChain({ message: "db error" }))

      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("visit-1", "with_doctor")

      expect(result.success).toBe(false)
      expect(result.error).toContain("Failed to update")
    })

    it("allows nurse to transition waiting -> screening", async () => {
      mockFrom
        .mockReturnValueOnce(roleChain("nurse"))
        .mockReturnValueOnce(
          singleVisitChain({
            id: "visit-1",
            status: "waiting",
            doctor_id: null,
          }),
        )
        .mockReturnValueOnce(updateChain())

      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("visit-1", "screening")

      expect(result.success).toBe(true)
    })

    it("allows doctor to transition screening -> with_doctor", async () => {
      mockFrom
        .mockReturnValueOnce(roleChain("doctor"))
        .mockReturnValueOnce(
          singleVisitChain({
            id: "visit-1",
            status: "screening",
            doctor_id: "doc-1",
          }),
        )
        .mockReturnValueOnce(updateChain())

      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("visit-1", "with_doctor")

      expect(result.success).toBe(true)
    })

    it("allows doctor to transition with_doctor -> completed", async () => {
      mockFrom
        .mockReturnValueOnce(roleChain("doctor"))
        .mockReturnValueOnce(
          singleVisitChain({
            id: "visit-1",
            status: "with_doctor",
            doctor_id: "doc-1",
          }),
        )
        .mockReturnValueOnce(updateChain())

      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("visit-1", "completed")

      expect(result.success).toBe(true)
    })

    it("allows admin to perform any valid transition", async () => {
      mockFrom
        .mockReturnValueOnce(roleChain("admin"))
        .mockReturnValueOnce(
          singleVisitChain({
            id: "visit-1",
            status: "waiting",
            doctor_id: null,
          }),
        )
        .mockReturnValueOnce(updateChain())

      const { transitionVisitStatus } = await import("./actions")
      const result = await transitionVisitStatus("visit-1", "screening")

      expect(result.success).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // getTodayVisits
  // ---------------------------------------------------------------------------

  describe("getTodayVisits", () => {
    it("returns error for unauthenticated user", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const { getTodayVisits } = await import("./actions")
      const result = await getTodayVisits()

      expect(result.data).toBeNull()
      expect(result.error).toBe("Not authenticated")
      expect(result.userRole).toBeNull()
    })

    it("returns today's visits with correct shape", async () => {
      const fakeVisit = {
        id: "v-1",
        patient_id: "p-1",
        doctor_id: "d-1",
        receptionist_id: "r-1",
        visit_type: "general",
        chief_complaint: "Headache",
        status: "waiting",
        visit_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        patient: { name: "Alice" },
        doctor: { name: "Dr. Bob" },
      }

      mockFrom
        .mockReturnValueOnce(roleChain("nurse"))
        .mockReturnValueOnce(visitsChain([fakeVisit]))

      const { getTodayVisits } = await import("./actions")
      const result = await getTodayVisits()

      expect(result.error).toBeNull()
      expect(result.userRole).toBe("nurse")
      expect(result.data).toHaveLength(1)
      expect(result.data![0]).toMatchObject({
        id: "v-1",
        patient_name: "Alice",
        doctor_name: "Dr. Bob",
        chief_complaint: "Headache",
        status: "waiting",
      })
    })

    it("maps missing patient name to 'Unknown' and null doctor to null", async () => {
      const fakeVisit = {
        id: "v-2",
        patient_id: "p-2",
        doctor_id: null,
        receptionist_id: null,
        visit_type: null,
        chief_complaint: null,
        status: "screening",
        visit_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        patient: null,
        doctor: null,
      }

      mockFrom
        .mockReturnValueOnce(roleChain("doctor"))
        .mockReturnValueOnce(visitsChain([fakeVisit]))

      const { getTodayVisits } = await import("./actions")
      const result = await getTodayVisits()

      expect(result.error).toBeNull()
      expect(result.data![0].patient_name).toBe("Unknown")
      expect(result.data![0].doctor_name).toBeNull()
      expect(result.data![0].chief_complaint).toBeNull()
    })

    it("returns empty data array when no visits today", async () => {
      mockFrom
        .mockReturnValueOnce(roleChain("admin"))
        .mockReturnValueOnce(visitsChain([]))

      const { getTodayVisits } = await import("./actions")
      const result = await getTodayVisits()

      expect(result.error).toBeNull()
      expect(result.data).toEqual([])
      expect(result.userRole).toBe("admin")
    })

    it("returns error when database query fails", async () => {
      mockFrom
        .mockReturnValueOnce(roleChain("nurse"))
        .mockReturnValueOnce(visitsChain(null, { message: "db error" }))

      const { getTodayVisits } = await import("./actions")
      const result = await getTodayVisits()

      expect(result.data).toBeNull()
      expect(result.error).toBe("Failed to fetch queue")
      expect(result.userRole).toBe("nurse")
    })

    it("returns null userRole when user has no role assigned", async () => {
      mockFrom
        .mockReturnValueOnce(roleChain(null))
        .mockReturnValueOnce(visitsChain([]))

      const { getTodayVisits } = await import("./actions")
      const result = await getTodayVisits()

      expect(result.error).toBeNull()
      expect(result.userRole).toBeNull()
      expect(result.data).toEqual([])
    })

    it("returns multiple visits sorted by created_at", async () => {
      const visit1 = {
        id: "v-1",
        patient_id: "p-1",
        doctor_id: "d-1",
        receptionist_id: null,
        visit_type: null,
        chief_complaint: "Fever",
        status: "completed",
        visit_date: new Date().toISOString(),
        created_at: "2026-07-13T08:00:00Z",
        patient: { name: "Bob" },
        doctor: { name: "Dr. Smith" },
      }
      const visit2 = {
        id: "v-2",
        patient_id: "p-2",
        doctor_id: null,
        receptionist_id: null,
        visit_type: null,
        chief_complaint: "Cough",
        status: "waiting",
        visit_date: new Date().toISOString(),
        created_at: "2026-07-13T09:00:00Z",
        patient: { name: "Carol" },
        doctor: null,
      }

      mockFrom
        .mockReturnValueOnce(roleChain("nurse"))
        .mockReturnValueOnce(visitsChain([visit1, visit2]))

      const { getTodayVisits } = await import("./actions")
      const result = await getTodayVisits()

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(2)
      // Data preserves order from the query (ordered by created_at ascending)
      expect(result.data![0].id).toBe("v-1")
      expect(result.data![1].id).toBe("v-2")
    })
  })
})
