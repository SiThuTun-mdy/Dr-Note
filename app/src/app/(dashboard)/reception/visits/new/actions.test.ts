import { describe, it, expect, vi, beforeEach } from "vitest"

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockUser = { id: "receptionist-1" }
const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockInsert = vi.fn()
const mockRevalidatePath = vi.fn()
const mockRedirect = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function mockRoleLookup(roleName: string | null) {
  mockFrom.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: roleName ? [{ roles: { name: roleName } }] : [],
          error: null,
        }),
      }),
    }),
  })
}

function mockPatientLookup(found: boolean) {
  mockFrom.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: found ? { id: "patient-1" } : null,
          error: found ? null : { message: "Not found" },
        }),
      }),
    }),
  })
}

function mockDoctorLookup(found: boolean) {
  mockFrom.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: found ? { id: "doctor-1" } : null,
          error: found ? null : { message: "Not found" },
        }),
      }),
    }),
  })
}

function mockVisitInsert(success: boolean) {
  const chain = {
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue(
        success
          ? { data: { id: "visit-new-1" }, error: null }
          : { data: null, error: { message: "Insert failed" } }
      ),
    }),
  }
  mockFrom.mockReturnValueOnce({
    insert: vi.fn().mockReturnValue(chain),
  })
}

const validInput = {
  patientId: "550e8400-e29b-41d4-a716-446655440000",
  visitType: "consultation" as const,
  chiefComplaint: "Persistent headache",
  doctorId: null,
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("createVisit", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReset()
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
  })

  it("rejects invalid input before calling Supabase", async () => {
    const { createVisit } = await import("./actions")
    const result = await createVisit({
      patientId: "",
      visitType: "consultation",
      chiefComplaint: "",
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe("Please fix the highlighted fields.")
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it("rejects unauthenticated requests", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const { createVisit } = await import("./actions")
    const result = await createVisit(validInput)

    expect(result.success).toBe(false)
    expect(result.error).toBe("Not authenticated")
  })

  it("rejects roles without access (e.g. nurse)", async () => {
    mockRoleLookup("nurse")

    const { createVisit } = await import("./actions")
    const result = await createVisit(validInput)

    expect(result.success).toBe(false)
    expect(result.error).toBe("Unauthorized")
  })

  it("rejects when role lookup returns null", async () => {
    mockRoleLookup(null)

    const { createVisit } = await import("./actions")
    const result = await createVisit(validInput)

    expect(result.success).toBe(false)
    expect(result.error).toBe("Unauthorized")
  })

  it("returns field error when patient not found", async () => {
    mockRoleLookup("receptionist")
    mockPatientLookup(false)

    const { createVisit } = await import("./actions")
    const result = await createVisit(validInput)

    expect(result.success).toBe(false)
    expect(result.fieldErrors?.patientId).toBe("Patient not found")
  })

  it("returns field error when doctor not found", async () => {
    mockRoleLookup("receptionist")
    mockPatientLookup(true)
    mockDoctorLookup(false)

    const { createVisit } = await import("./actions")
    const result = await createVisit({
      ...validInput,
      doctorId: "660e8400-e29b-41d4-a716-446655440001",
    })

    expect(result.success).toBe(false)
    expect(result.fieldErrors?.doctorId).toBe("Doctor not found")
  })

  it("skips doctor verification when doctorId is null", async () => {
    mockRoleLookup("receptionist")
    mockPatientLookup(true)
    mockVisitInsert(true)

    const { createVisit } = await import("./actions")
    // redirect throws, so we catch it
    try {
      await createVisit(validInput)
    } catch {
      // redirect throws in test
    }

    // Only 2 from() calls: role lookup, patient lookup, insert
    // No doctor lookup call
    expect(mockFrom).toHaveBeenCalledTimes(3)
  })

  it("creates visit with correct fields and redirects on success", async () => {
    mockRoleLookup("admin")
    mockPatientLookup(true)
    mockVisitInsert(true)

    const { createVisit } = await import("./actions")
    try {
      await createVisit(validInput)
    } catch {
      // redirect throws
    }

    expect(mockRevalidatePath).toHaveBeenCalledWith("/reception")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/my-queue")
    expect(mockRedirect).toHaveBeenCalledWith("/my-queue")
  })

  it("allows admin role", async () => {
    mockRoleLookup("admin")
    mockPatientLookup(true)
    mockVisitInsert(true)

    const { createVisit } = await import("./actions")
    try {
      await createVisit(validInput)
    } catch {
      // redirect throws
    }

    expect(mockRedirect).toHaveBeenCalledWith("/my-queue")
  })

  it("allows receptionist role", async () => {
    mockRoleLookup("receptionist")
    mockPatientLookup(true)
    mockVisitInsert(true)

    const { createVisit } = await import("./actions")
    try {
      await createVisit(validInput)
    } catch {
      // redirect throws
    }

    expect(mockRedirect).toHaveBeenCalledWith("/my-queue")
  })

  it("handles visit insert failure gracefully", async () => {
    mockRoleLookup("receptionist")
    mockPatientLookup(true)
    mockVisitInsert(false)

    const { createVisit } = await import("./actions")
    const result = await createVisit(validInput)

    expect(result.success).toBe(false)
    expect(result.error).toBe("Unable to create visit. Please try again.")
  })

  it("inserts visit with status waiting and current user as receptionist", async () => {
    mockRoleLookup("receptionist")
    mockPatientLookup(true)

    let insertPayload: Record<string, unknown> = {}
    const insertMock = vi.fn().mockImplementation((payload: Record<string, unknown>) => {
      insertPayload = payload
      return {
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "visit-1" },
            error: null,
          }),
        }),
      }
    })
    mockFrom.mockReturnValueOnce({ insert: insertMock })

    const { createVisit } = await import("./actions")
    try {
      await createVisit(validInput)
    } catch {
      // redirect throws
    }

    expect(insertPayload.status).toBe("waiting")
    expect(insertPayload.receptionist_id).toBe("receptionist-1")
    expect(insertPayload.patient_id).toBe(validInput.patientId)
    expect(insertPayload.visit_type).toBe("consultation")
    expect(insertPayload.chief_complaint).toBe("Persistent headache")
    expect(insertPayload.visit_date).toBeDefined()
  })
})

describe("searchPatients", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReset()
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
  })

  it("returns empty array for unauthenticated users", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const { searchPatients } = await import("./actions")
    const results = await searchPatients("test")

    expect(results).toEqual([])
  })

  it("returns empty array for unauthorized roles", async () => {
    mockRoleLookup("nurse")

    const { searchPatients } = await import("./actions")
    const results = await searchPatients("test")

    expect(results).toEqual([])
  })

  it("returns patients when authorized", async () => {
    mockRoleLookup("receptionist")
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        or: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [
              {
                id: "p1",
                name: "John Doe",
                email: "john@example.com",
                patient_profiles: { nrc: "12345" },
              },
            ],
            error: null,
          }),
        }),
      }),
    })
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        ilike: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    })

    const { searchPatients } = await import("./actions")
    const results = await searchPatients("John")

    expect(results.length).toBe(1)
    expect(results[0].name).toBe("John Doe")
  })
})

describe("searchDoctors", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReset()
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
  })

  it("returns empty array for unauthenticated users", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    const { searchDoctors } = await import("./actions")
    const results = await searchDoctors("test")

    expect(results).toEqual([])
  })

  it("returns empty array for unauthorized roles", async () => {
    mockRoleLookup("nurse")

    const { searchDoctors } = await import("./actions")
    const results = await searchDoctors("test")

    expect(results).toEqual([])
  })

  it("returns only doctor-role users", async () => {
    mockRoleLookup("receptionist")
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        or: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [
              {
                id: "d1",
                name: "Dr. Smith",
                email: "smith@clinic.com",
                user_roles: [{ roles: { name: "doctor" } }],
              },
              {
                id: "d2",
                name: "Nurse Jones",
                email: "jones@clinic.com",
                user_roles: [{ roles: { name: "nurse" } }],
              },
            ],
            error: null,
          }),
        }),
      }),
    })

    const { searchDoctors } = await import("./actions")
    const results = await searchDoctors("Smith")

    expect(results.length).toBe(1)
    expect(results[0].name).toBe("Dr. Smith")
  })
})
