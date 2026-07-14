import { describe, it, expect, vi, beforeEach } from "vitest";

// Create mock functions for the chain
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockFrom = vi.fn();

// Build chain that returns itself at each step
const mockChain = {
  select: mockSelect,
  eq: mockEq,
  single: mockSingle,
  order: mockOrder,
};

// Each method returns mockChain to allow chaining
mockSelect.mockReturnValue(mockChain);
mockEq.mockReturnValue(mockChain);
mockOrder.mockReturnValue(mockChain);
mockSingle.mockResolvedValue({ data: null, error: null });

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

describe("getVisitSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup chain returns after clearAllMocks
    mockSelect.mockReturnValue(mockChain);
    mockEq.mockReturnValue(mockChain);
    mockOrder.mockReturnValue(mockChain);
    mockSingle.mockResolvedValue({ data: null, error: null });
    mockFrom.mockReturnValue(mockChain);
  });

  it("should return null when visit is not found", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "not found" } });

    const { getVisitSummary } = await import("./actions");
    const result = await getVisitSummary("nonexistent-id");

    expect(result).toBeNull();
    expect(mockFrom).toHaveBeenCalledWith("visits");
  });

  it("should return null when visit exists but RLS blocks access", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: "PGRST116", message: "Row not found" } });

    const { getVisitSummary } = await import("./actions");
    const result = await getVisitSummary("restricted-id");

    expect(result).toBeNull();
  });

  it("should return complete visit summary with all related data", async () => {
    const mockVisit = {
      id: "visit-123",
      patient_id: "patient-1",
      doctor_id: "doctor-1",
      status: "completed",
      chief_complaint: "Headache for 3 days",
      diagnosis_note: "Tension-type headache",
      visit_date: "2026-07-14",
      visit_type: "follow_up",
      created_at: "2026-07-14T10:00:00Z",
    };

    const mockPatient = { name: "John Doe", email: "john@example.com" };
    const mockDoctor = { name: "Dr. Smith", email: "smith@example.com" };
    const mockScreening = {
      height_cm: 175,
      weight_kg: 70,
      bmi: 22.9,
      bp_systolic: 120,
      bp_diastolic: 80,
      heart_rate: 72,
      temperature_c: 36.5,
      oxygen_saturation: 98,
    };

    // First call: fetch visit
    mockSingle
      .mockResolvedValueOnce({ data: mockVisit, error: null })
      // Patient
      .mockResolvedValueOnce({ data: mockPatient, error: null })
      // Doctor
      .mockResolvedValueOnce({ data: mockDoctor, error: null })
      // Screening
      .mockResolvedValueOnce({ data: mockScreening, error: null });

    // Promise.all calls - these use eq which returns mockChain, then resolve
    // Diagnoses and prescriptions don't use .single()
    mockSelect
      .mockReturnValueOnce(mockChain) // patient select
      .mockReturnValueOnce(mockChain) // doctor select
      .mockReturnValueOnce(mockChain) // screening select
      .mockReturnValueOnce(mockChain) // diagnoses select
      .mockReturnValueOnce(mockChain); // prescriptions select

    const { getVisitSummary } = await import("./actions");

    const result = await getVisitSummary("visit-123");

    // The result should have the visit data merged with related data
    expect(result).not.toBeNull();
    expect(mockFrom).toHaveBeenCalledWith("visits");
  });

  it("should handle visit with no doctor assigned", async () => {
    const mockVisit = {
      id: "visit-456",
      patient_id: "patient-2",
      doctor_id: null,
      status: "in_progress",
      chief_complaint: "Annual checkup",
      diagnosis_note: null,
      visit_date: "2026-07-14",
      visit_type: "initial",
      created_at: "2026-07-14T09:00:00Z",
    };

    const mockPatient = { name: "Jane Doe", email: "jane@example.com" };

    mockSingle
      .mockResolvedValueOnce({ data: mockVisit, error: null })
      .mockResolvedValueOnce({ data: mockPatient, error: null })
      .mockResolvedValueOnce({ data: null, error: null }); // no doctor

    const { getVisitSummary } = await import("./actions");
    const result = await getVisitSummary("visit-456");

    // Should not throw even with null doctor
    expect(result).not.toBeNull();
  });

  it("should handle visit with no screening data", async () => {
    const mockVisit = {
      id: "visit-789",
      patient_id: "patient-3",
      doctor_id: "doctor-2",
      status: "completed",
      chief_complaint: "Chest pain",
      diagnosis_note: "Rule out cardiac issues",
      visit_date: "2026-07-14",
      visit_type: "emergency",
      created_at: "2026-07-14T08:00:00Z",
    };

    mockSingle
      .mockResolvedValueOnce({ data: mockVisit, error: null })
      .mockResolvedValueOnce({ data: { name: "Bob", email: "bob@example.com" }, error: null })
      .mockResolvedValueOnce({ data: { name: "Dr. Lee", email: "lee@example.com" }, error: null })
      .mockResolvedValueOnce({ data: null, error: null }); // no screening

    const { getVisitSummary } = await import("./actions");
    const result = await getVisitSummary("visit-789");

    expect(result).not.toBeNull();
  });

  it("should handle visit with no diagnoses or prescriptions", async () => {
    const mockVisit = {
      id: "visit-000",
      patient_id: "patient-4",
      doctor_id: "doctor-3",
      status: "pending",
      chief_complaint: "Routine follow-up",
      diagnosis_note: null,
      visit_date: null,
      visit_type: "follow_up",
      created_at: "2026-07-14T07:00:00Z",
    };

    mockSingle
      .mockResolvedValueOnce({ data: mockVisit, error: null })
      .mockResolvedValueOnce({ data: { name: "Alice", email: "alice@example.com" }, error: null })
      .mockResolvedValueOnce({ data: { name: "Dr. Park", email: "park@example.com" }, error: null })
      .mockResolvedValueOnce({ data: null, error: null }); // no screening

    const { getVisitSummary } = await import("./actions");
    const result = await getVisitSummary("visit-000");

    expect(result).not.toBeNull();
  });
});
