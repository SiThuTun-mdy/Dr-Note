import { describe, it, expect, vi, beforeEach } from "vitest"

// Track which table is being queried
let currentTable = ""

const mockSelect = vi.fn().mockReturnThis()
const mockEq = vi.fn().mockReturnThis()
const mockOrder = vi.fn().mockReturnThis()
const mockIn = vi.fn().mockReturnThis()

const createMockChain = () => ({
  select: mockSelect,
  eq: mockEq,
  order: mockOrder,
  in: mockIn,
})

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn((table: string) => {
    currentTable = table
    return createMockChain()
  }),
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => mockSupabase),
}))

// Import after mocking
import { getPatientHistory } from "./actions"

describe("getPatientHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    currentTable = ""
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    })
  })

  it("returns error when patientId is empty", async () => {
    const result = await getPatientHistory("")
    expect(result.error).toBe("Patient ID is required")
    expect(result.data).toBeNull()
  })

  it("returns error when user is not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    })

    const result = await getPatientHistory("patient-1")
    expect(result.error).toBe("Not authenticated")
    expect(result.data).toBeNull()
  })

  it("returns empty array when patient has no visits", async () => {
    mockOrder.mockResolvedValue({ data: [], error: null })

    const result = await getPatientHistory("patient-1")
    expect(result.data).toEqual([])
    expect(result.error).toBeNull()
  })

  it("returns visits with diagnoses and prescription flags", async () => {
    const mockVisits = [
      {
        id: "visit-1",
        patient_id: "patient-1",
        doctor_id: "doctor-1",
        status: "completed",
        chief_complaint: "Headache",
        diagnosis_note: "Tension headache",
        visit_date: "2026-07-10T10:00:00Z",
        created_at: "2026-07-10T10:00:00Z",
      },
    ]

    // First call: visits query
    mockOrder.mockResolvedValue({ data: mockVisits, error: null })

    // Subsequent calls based on table
    mockSupabase.from.mockImplementation((table: string) => {
      const chain = createMockChain()
      if (table === "users") {
        chain.in.mockResolvedValue({
          data: [{ id: "doctor-1", name: "Dr. Smith" }],
        })
      } else if (table === "visit_diagnoses") {
        chain.in.mockResolvedValue({
          data: [
            {
              visit_id: "visit-1",
              diagnosis_type: "primary",
              diagnoses: { code: "R51", title: "Headache" },
            },
          ],
        })
      } else if (table === "prescriptions") {
        chain.in.mockResolvedValue({
          data: [{ visit_id: "visit-1" }],
        })
      }
      return chain
    })

    const result = await getPatientHistory("patient-1")

    expect(result.data).toHaveLength(1)
    expect(result.data![0].doctor_name).toBe("Dr. Smith")
    expect(result.data![0].diagnoses).toHaveLength(1)
    expect(result.data![0].diagnoses[0].code).toBe("R51")
    expect(result.data![0].has_prescription).toBe(true)
  })

  it("returns has_prescription false when no prescriptions exist", async () => {
    const mockVisits = [
      {
        id: "visit-2",
        patient_id: "patient-1",
        doctor_id: null,
        status: "waiting",
        chief_complaint: null,
        diagnosis_note: null,
        visit_date: "2026-07-12T14:00:00Z",
        created_at: "2026-07-12T14:00:00Z",
      },
    ]

    // First call: visits query
    mockOrder.mockResolvedValue({ data: mockVisits, error: null })

    // Subsequent calls based on table
    mockSupabase.from.mockImplementation((table: string) => {
      const chain = createMockChain()
      if (table === "users") {
        chain.in.mockResolvedValue({ data: [] })
      } else if (table === "visit_diagnoses") {
        chain.in.mockResolvedValue({ data: [] })
      } else if (table === "prescriptions") {
        chain.in.mockResolvedValue({ data: [] })
      }
      return chain
    })

    const result = await getPatientHistory("patient-1")

    expect(result.data).toHaveLength(1)
    expect(result.data![0].doctor_name).toBeNull()
    expect(result.data![0].diagnoses).toHaveLength(0)
    expect(result.data![0].has_prescription).toBe(false)
  })
})
