import { describe, it, expect, vi, beforeEach } from "vitest";
import { resetSupabaseMocks, mocks } from "@test-utils/supabase-mock";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Diagnosis Server Actions", () => {
  beforeEach(() => {
    resetSupabaseMocks();
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
      expect(mocks.mockFrom).toHaveBeenCalledWith("visit_diagnoses");
      expect(mocks.mockInsert).toHaveBeenCalledWith({
        visit_id: "visit-123",
        diagnosis_id: "diag-456",
        diagnosis_type: "primary",
      });
    });

    it("should return error on duplicate diagnosis", async () => {
      mocks.mockSingle.mockResolvedValue({
        data: null,
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
      mocks.mockSingle.mockResolvedValue({
        data: null,
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
      expect(mocks.mockFrom).toHaveBeenCalledWith("visit_diagnoses");
      expect(mocks.mockDelete).toHaveBeenCalled();
      expect(mocks.mockEq).toHaveBeenCalledWith("id", "vd-123");
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
      expect(mocks.mockFrom).toHaveBeenCalledWith("visits");
      expect(mocks.mockUpdate).toHaveBeenCalledWith({
        diagnosis_note: "Patient shows signs of hypertension",
      });
      expect(mocks.mockEq).toHaveBeenCalledWith("id", "visit-123");
    });
  });

  describe("searchDiagnoses", () => {
    it("should search diagnoses by code or title", async () => {
      mocks.mockRange.mockResolvedValue({
        data: [
          { id: "1", code: "BA00", title: "Essential hypertension" },
        ],
        error: null,
      });

      const { searchDiagnoses } = await import("./actions");

      const results = await searchDiagnoses("BA00");

      expect(results).toHaveLength(1);
      expect(results[0].code).toBe("BA00");
      expect(mocks.mockFrom).toHaveBeenCalledWith("diagnoses");
      expect(mocks.mockOr).toHaveBeenCalledWith(
        "code.ilike.%BA00%,title.ilike.%BA00%"
      );
    });

    it("should strip filter metacharacters and wildcards from the query", async () => {
      mocks.mockRange.mockResolvedValue({ data: [], error: null });

      const { searchDiagnoses } = await import("./actions");

      await searchDiagnoses("Influenza, (virus) %_\\ not identified");

      expect(mocks.mockOr).toHaveBeenCalledWith(
        "code.ilike.%Influenza virus not identified%,title.ilike.%Influenza virus not identified%"
      );
    });

    it("should skip the filter when the query is only metacharacters", async () => {
      mocks.mockRange.mockResolvedValue({ data: [], error: null });

      const { searchDiagnoses } = await import("./actions");

      await searchDiagnoses(",()%_");

      expect(mocks.mockOr).not.toHaveBeenCalled();
    });

    it("should return empty array on error", async () => {
      mocks.mockRange.mockResolvedValue({
        data: null,
        error: { message: "database error" },
      });

      const { searchDiagnoses } = await import("./actions");

      const results = await searchDiagnoses("BA00");

      expect(results).toEqual([]);
    });
  });
});
