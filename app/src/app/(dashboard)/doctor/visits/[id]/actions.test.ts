import { describe, it, expect, vi, beforeEach } from "vitest";

// Create mock functions for the chain
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockLimit = vi.fn();
const mockOr = vi.fn();
const mockOrder = vi.fn();
const mockInsert = vi.fn();
const mockDelete = vi.fn();
const mockUpdate = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();

// Build chain that returns itself at each step
const mockChain = {
  select: mockSelect,
  insert: mockInsert,
  delete: mockDelete,
  update: mockUpdate,
  eq: mockEq,
  single: mockSingle,
  limit: mockLimit,
  order: mockOrder,
  or: mockOr,
};

// Each method returns mockChain to allow chaining
mockSelect.mockReturnValue(mockChain);
mockInsert.mockResolvedValue({ error: null });
mockDelete.mockReturnValue(mockChain);
mockUpdate.mockReturnValue(mockChain);
mockEq.mockReturnValue(mockChain);
mockSingle.mockResolvedValue({ data: null, error: null });
mockLimit.mockResolvedValue({ data: [], error: null });
mockOrder.mockReturnValue(mockChain);
mockOr.mockReturnValue(mockChain);

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Diagnosis Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup chain returns after clearAllMocks
    mockSelect.mockReturnValue(mockChain);
    mockDelete.mockReturnValue(mockChain);
    mockUpdate.mockReturnValue(mockChain);
    mockEq.mockReturnValue(mockChain);
    mockSingle.mockResolvedValue({ data: null, error: null });
    mockLimit.mockResolvedValue({ data: [], error: null });
    mockOrder.mockReturnValue(mockChain);
    mockOr.mockReturnValue(mockChain);
    mockInsert.mockResolvedValue({ error: null });
    mockFrom.mockReturnValue(mockChain);
  });

  describe("addDiagnosis", () => {
    it("should add a diagnosis to a visit", async () => {
      const { addDiagnosis } = await import("./actions");

      const result = await addDiagnosis({
        visit_id: "visit-123",
        diagnosis_id: "diag-456",
        diagnosis_type: "primary",
      });

      expect(result).toEqual({ success: true });
      expect(mockFrom).toHaveBeenCalledWith("visit_diagnoses");
      expect(mockInsert).toHaveBeenCalledWith({
        visit_id: "visit-123",
        diagnosis_id: "diag-456",
        diagnosis_type: "primary",
        notes: null,
      });
    });

    it("should return error on duplicate diagnosis", async () => {
      mockInsert.mockResolvedValue({
        error: { code: "23505", message: "duplicate key" },
      });

      const { addDiagnosis } = await import("./actions");

      const result = await addDiagnosis({
        visit_id: "visit-123",
        diagnosis_id: "diag-456",
        diagnosis_type: "primary",
      });

      expect(result).toEqual({
        error: "This diagnosis has already been added to this visit.",
      });
    });

    it("should return generic error on other failures", async () => {
      mockInsert.mockResolvedValue({
        error: { code: "OTHER", message: "database error" },
      });

      const { addDiagnosis } = await import("./actions");

      const result = await addDiagnosis({
        visit_id: "visit-123",
        diagnosis_id: "diag-456",
        diagnosis_type: "primary",
      });

      expect(result).toEqual({
        error: "Failed to add diagnosis. Please try again.",
      });
    });
  });

  describe("removeDiagnosis", () => {
    it("should remove a diagnosis from a visit", async () => {
      const { removeDiagnosis } = await import("./actions");

      const result = await removeDiagnosis({
        visit_diagnosis_id: "vd-123",
        visit_id: "visit-456",
      });

      expect(result).toEqual({ success: true });
      expect(mockFrom).toHaveBeenCalledWith("visit_diagnoses");
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("id", "vd-123");
    });
  });

  describe("saveDiagnosisNote", () => {
    it("should save the diagnosis note", async () => {
      const { saveDiagnosisNote } = await import("./actions");

      const result = await saveDiagnosisNote({
        visit_id: "visit-123",
        diagnosis_note: "Patient shows signs of hypertension",
      });

      expect(result).toEqual({ success: true });
      expect(mockFrom).toHaveBeenCalledWith("visits");
      expect(mockUpdate).toHaveBeenCalledWith({
        diagnosis_note: "Patient shows signs of hypertension",
      });
      expect(mockEq).toHaveBeenCalledWith("id", "visit-123");
    });
  });

  describe("searchDiagnoses", () => {
    it("should search diagnoses by code or title", async () => {
      mockLimit.mockResolvedValue({
        data: [
          { id: "1", code: "I10", title: "Essential hypertension" },
        ],
        error: null,
      });

      const { searchDiagnoses } = await import("./actions");

      const results = await searchDiagnoses("I10");

      expect(results).toHaveLength(1);
      expect(results[0].code).toBe("I10");
      expect(mockFrom).toHaveBeenCalledWith("diagnoses");
    });

    it("should return empty array on error", async () => {
      mockLimit.mockResolvedValue({
        data: null,
        error: { message: "database error" },
      });

      const { searchDiagnoses } = await import("./actions");

      const results = await searchDiagnoses("I10");

      expect(results).toEqual([]);
    });
  });
});
