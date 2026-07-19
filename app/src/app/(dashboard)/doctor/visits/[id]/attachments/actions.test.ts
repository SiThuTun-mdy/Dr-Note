import { describe, it, expect, vi, beforeEach } from "vitest";
import { resetSupabaseMocks, mocks } from "@test-utils/supabase-mock";

// Valid UUIDs for tests
const VALID_VISIT_ID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_ATTACHMENT_ID = "660e8400-e29b-41d4-a716-446655440000";
const VALID_PATIENT_ID = "770e8400-e29b-41d4-a716-446655440000";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Attachment Server Actions", () => {
  beforeEach(() => {
    resetSupabaseMocks();
  });

  describe("getVisitAttachments", () => {
    it("should return attachments for a visit when user is the assigned doctor", async () => {
      const mockAttachments = [
        {
          id: "att-1",
          visit_id: VALID_VISIT_ID,
          file_path: "visits/visit-123/12345-photo.jpg",
          file_type: "image/jpeg",
          uploaded_by: "user-123",
          created_at: "2026-01-01T00:00:00Z",
        },
      ];
      // authorizeVisitAccess: from("visits")...single() → user is doctor
      mocks.mockSingle.mockResolvedValueOnce({
        data: { id: VALID_VISIT_ID, patient_id: VALID_PATIENT_ID, doctor_id: "user-123" },
        error: null,
      });
      // authorizeVisitAccess: rpc("has_permission") → not admin
      mocks.mockRpc.mockResolvedValueOnce({ data: false, error: null });
      // getVisitAttachments: from("attachments")...limit()
      mocks.mockLimit.mockResolvedValueOnce({ data: mockAttachments, error: null });

      const { getVisitAttachments } = await import("./actions");
      const results = await getVisitAttachments(VALID_VISIT_ID);

      expect(results).toEqual(mockAttachments);
      expect(mocks.mockFrom).toHaveBeenCalledWith("attachments");
    });

    it("should return empty array when user has no relationship to visit", async () => {
      // authorizeVisitAccess: user is neither doctor nor patient
      mocks.mockSingle.mockResolvedValueOnce({
        data: { id: VALID_VISIT_ID, patient_id: "other-patient", doctor_id: "other-doctor" },
        error: null,
      });
      mocks.mockRpc.mockResolvedValueOnce({ data: false, error: null });

      const { getVisitAttachments } = await import("./actions");
      const results = await getVisitAttachments(VALID_VISIT_ID);

      expect(results).toEqual([]);
    });

    it("should return empty array on error", async () => {
      // authorizeVisitAccess: user is doctor
      mocks.mockSingle.mockResolvedValueOnce({
        data: { id: VALID_VISIT_ID, patient_id: VALID_PATIENT_ID, doctor_id: "user-123" },
        error: null,
      });
      mocks.mockRpc.mockResolvedValueOnce({ data: false, error: null });
      // DB error
      mocks.mockLimit.mockResolvedValueOnce({
        data: null,
        error: { message: "database error" },
      });

      const { getVisitAttachments } = await import("./actions");
      const results = await getVisitAttachments(VALID_VISIT_ID);

      expect(results).toEqual([]);
    });
  });

  describe("getVisitAttachmentCount", () => {
    it("should return 0 when user has no relationship to visit", async () => {
      mocks.mockSingle.mockResolvedValueOnce({
        data: { id: VALID_VISIT_ID, patient_id: "other-patient", doctor_id: "other-doctor" },
        error: null,
      });
      mocks.mockRpc.mockResolvedValueOnce({ data: false, error: null });

      const { getVisitAttachmentCount } = await import("./actions");
      const result = await getVisitAttachmentCount(VALID_VISIT_ID);

      expect(result).toBe(0);
    });

    it("should return 0 for invalid visit ID", async () => {
      const { getVisitAttachmentCount } = await import("./actions");
      const result = await getVisitAttachmentCount("not-a-uuid");

      expect(result).toBe(0);
    });
  });

  describe("uploadAttachment", () => {
    it("should upload a file and create attachment record", async () => {
      const mockAttachment = {
        id: "att-new",
        visit_id: VALID_VISIT_ID,
        file_path: "visits/123/12345-photo.jpg",
        file_type: "image/jpeg",
        uploaded_by: "user-123",
        created_at: "2026-01-01T00:00:00Z",
      };

      // Mock visit check - first single call
      mocks.mockSingle
        .mockResolvedValueOnce({ data: { id: VALID_VISIT_ID }, error: null })
        // Mock insert result - second single call
        .mockResolvedValueOnce({ data: mockAttachment, error: null });

      const { uploadAttachment } = await import("./actions");
      const buffer = new ArrayBuffer(1024);
      const result = await uploadAttachment(
        VALID_VISIT_ID,
        "photo.jpg",
        "image/jpeg",
        1024,
        buffer
      );

      expect(result.success).toBe(true);
      expect(result.attachment).toEqual(mockAttachment);
    });

    it("should reject invalid visit ID", async () => {
      const { uploadAttachment } = await import("./actions");
      const buffer = new ArrayBuffer(1024);
      const result = await uploadAttachment(
        "not-a-uuid",
        "photo.jpg",
        "image/jpeg",
        1024,
        buffer
      );

      expect(result.error).toContain("Invalid visit ID");
    });

    it("should reject unsupported file types", async () => {
      const { uploadAttachment } = await import("./actions");
      const buffer = new ArrayBuffer(1024);
      const result = await uploadAttachment(
        VALID_VISIT_ID,
        "script.exe",
        "application/x-executable",
        1024,
        buffer
      );

      expect(result.error).toContain("not supported");
    });

    it("should reject files over 10MB", async () => {
      const { uploadAttachment } = await import("./actions");
      const buffer = new ArrayBuffer(1024);
      const result = await uploadAttachment(
        VALID_VISIT_ID,
        "large.jpg",
        "image/jpeg",
        10 * 1024 * 1024 + 1,
        buffer
      );

      expect(result.error).toContain("10MB");
    });

    it("should handle authentication errors", async () => {
      mocks.mockGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: "not authenticated" },
      });

      const { uploadAttachment } = await import("./actions");
      const buffer = new ArrayBuffer(1024);
      const result = await uploadAttachment(
        VALID_VISIT_ID,
        "photo.jpg",
        "image/jpeg",
        1024,
        buffer
      );

      expect(result.error).toContain("Authentication required");
    });

    it("should handle storage upload errors", async () => {
      // Mock visit check
      mocks.mockSingle.mockResolvedValueOnce({ data: { id: VALID_VISIT_ID }, error: null });
      mocks.mockUpload.mockResolvedValueOnce({ error: { message: "storage error" } });

      const { uploadAttachment } = await import("./actions");
      const buffer = new ArrayBuffer(1024);
      const result = await uploadAttachment(
        VALID_VISIT_ID,
        "photo.jpg",
        "image/jpeg",
        1024,
        buffer
      );

      expect(result.error).toContain("Failed to upload file");
    });
  });

  describe("deleteAttachment", () => {
    it("should delete an attachment successfully", async () => {
      // Mock fetch attachment — must include visit_id and uploaded_by
      mocks.mockSingle.mockResolvedValueOnce({
        data: {
          id: VALID_ATTACHMENT_ID,
          file_path: "visits/visit-123/12345-photo.jpg",
          uploaded_by: "user-123",
          visit_id: VALID_VISIT_ID,
        },
        error: null,
      });
      // Mock DB delete chain: from().delete().eq()
      mocks.mockDelete.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const { deleteAttachment } = await import("./actions");
      const result = await deleteAttachment(VALID_ATTACHMENT_ID, VALID_VISIT_ID);

      expect(result.success).toBe(true);
      expect(mocks.mockRemove).toHaveBeenCalledWith([
        "visits/visit-123/12345-photo.jpg",
      ]);
    });

    it("should handle attachment not found", async () => {
      mocks.mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: "not found" },
      });

      const { deleteAttachment } = await import("./actions");
      const result = await deleteAttachment("999e8400-e29b-41d4-a716-446655440000", VALID_VISIT_ID);

      expect(result.error).toBe("Attachment not found.");
    });
  });

  describe("getAttachmentDownloadUrl", () => {
    it("should generate a signed URL when user is the assigned doctor", async () => {
      // Mock fetch attachment
      mocks.mockSingle
        .mockResolvedValueOnce({
          data: { id: VALID_ATTACHMENT_ID, file_path: "visits/visit-123/12345-photo.jpg", visit_id: VALID_VISIT_ID },
          error: null,
        });
      // authorizeVisitAccess: visit fetch
      mocks.mockSingle
        .mockResolvedValueOnce({
          data: { id: VALID_VISIT_ID, patient_id: VALID_PATIENT_ID, doctor_id: "user-123" },
          error: null,
        });
      // authorizeVisitAccess: rpc — not admin
      mocks.mockRpc.mockResolvedValueOnce({ data: false, error: null });

      const { getAttachmentDownloadUrl } = await import("./actions");
      const result = await getAttachmentDownloadUrl(VALID_ATTACHMENT_ID);

      expect(result.url).toBe("https://example.com/signed-url");
    });

    it("should generate a signed URL when user is the patient", async () => {
      // Mock fetch attachment
      mocks.mockSingle
        .mockResolvedValueOnce({
          data: { id: VALID_ATTACHMENT_ID, file_path: "visits/visit-123/12345-photo.jpg", visit_id: VALID_VISIT_ID },
          error: null,
        });
      // authorizeVisitAccess: user is the patient (user-123 matches patient_id)
      mocks.mockSingle
        .mockResolvedValueOnce({
          data: { id: VALID_VISIT_ID, patient_id: "user-123", doctor_id: "other-doctor" },
          error: null,
        });
      mocks.mockRpc.mockResolvedValueOnce({ data: false, error: null });

      const { getAttachmentDownloadUrl } = await import("./actions");
      const result = await getAttachmentDownloadUrl(VALID_ATTACHMENT_ID);

      expect(result.url).toBe("https://example.com/signed-url");
    });

    it("should generate a signed URL when user is admin", async () => {
      // Explicitly reset rpc to avoid bleed-through from prior tests
      mocks.mockRpc.mockReset();
      mocks.mockRpc.mockResolvedValue({ data: false, error: null });
      mocks.mockRpc.mockResolvedValueOnce({ data: true, error: null });

      // Mock fetch attachment
      mocks.mockSingle
        .mockResolvedValueOnce({
          data: { id: VALID_ATTACHMENT_ID, file_path: "visits/visit-123/12345-photo.jpg", visit_id: VALID_VISIT_ID },
          error: null,
        });
      // authorizeVisitAccess: visit fetch (user is not doctor or patient)
      mocks.mockSingle
        .mockResolvedValueOnce({
          data: { id: VALID_VISIT_ID, patient_id: VALID_PATIENT_ID, doctor_id: "other-doctor" },
          error: null,
        });

      const { getAttachmentDownloadUrl } = await import("./actions");
      const result = await getAttachmentDownloadUrl(VALID_ATTACHMENT_ID);

      expect(result.url).toBe("https://example.com/signed-url");
    });

    it("should deny access when user has no relationship to visit", async () => {
      // Mock fetch attachment
      mocks.mockSingle
        .mockResolvedValueOnce({
          data: { id: VALID_ATTACHMENT_ID, file_path: "visits/visit-123/12345-photo.jpg", visit_id: VALID_VISIT_ID },
          error: null,
        });
      // authorizeVisitAccess: not doctor, not patient, not admin
      mocks.mockSingle.mockResolvedValueOnce({
        data: { id: VALID_VISIT_ID, patient_id: "other-patient", doctor_id: "other-doctor" },
        error: null,
      });
      mocks.mockRpc.mockResolvedValueOnce({ data: false, error: null });

      const { getAttachmentDownloadUrl } = await import("./actions");
      const result = await getAttachmentDownloadUrl(VALID_ATTACHMENT_ID);

      expect(result.error).toBe("Attachment not found.");
      expect(result.url).toBeUndefined();
    });

    it("should handle URL generation errors", async () => {
      // Mock fetch attachment
      mocks.mockSingle
        .mockResolvedValueOnce({
          data: { id: VALID_ATTACHMENT_ID, file_path: "visits/visit-123/12345-photo.jpg", visit_id: VALID_VISIT_ID },
          error: null,
        });
      // authorizeVisitAccess: user is doctor
      mocks.mockSingle
        .mockResolvedValueOnce({
          data: { id: VALID_VISIT_ID, patient_id: VALID_PATIENT_ID, doctor_id: "user-123" },
          error: null,
        });
      mocks.mockRpc.mockResolvedValueOnce({ data: false, error: null });
      // Signed URL fails
      mocks.mockCreateSignedUrl.mockResolvedValueOnce({
        data: null,
        error: { message: "storage error" },
      });

      const { getAttachmentDownloadUrl } = await import("./actions");
      const result = await getAttachmentDownloadUrl(VALID_ATTACHMENT_ID);

      expect(result.error).toContain("Failed to generate download link");
    });

    it("should return error for invalid attachment ID", async () => {
      const { getAttachmentDownloadUrl } = await import("./actions");
      const result = await getAttachmentDownloadUrl("not-a-uuid");

      expect(result.error).toBe("Invalid attachment ID.");
    });

    it("should return error when attachment not found", async () => {
      mocks.mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: "not found" },
      });

      const { getAttachmentDownloadUrl } = await import("./actions");
      const result = await getAttachmentDownloadUrl(VALID_ATTACHMENT_ID);

      expect(result.error).toBe("Attachment not found.");
    });
  });
});
