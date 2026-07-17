import { describe, it, expect, vi, beforeEach } from "vitest";
import { resetSupabaseMocks, mocks } from "@test-utils/supabase-mock";

// Valid UUIDs for tests
const VALID_VISIT_ID = "550e8400-e29b-41d4-a716-446655440000";
const VALID_ATTACHMENT_ID = "660e8400-e29b-41d4-a716-446655440000";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Attachment Server Actions", () => {
  beforeEach(() => {
    resetSupabaseMocks();
  });

  describe("getVisitAttachments", () => {
    it("should return attachments for a visit", async () => {
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
      mocks.mockLimit.mockResolvedValueOnce({ data: mockAttachments, error: null });

      const { getVisitAttachments } = await import("./actions");
      const results = await getVisitAttachments(VALID_VISIT_ID);

      expect(results).toEqual(mockAttachments);
      expect(mocks.mockFrom).toHaveBeenCalledWith("attachments");
    });

    it("should return empty array on error", async () => {
      mocks.mockLimit.mockResolvedValueOnce({
        data: null,
        error: { message: "database error" },
      });

      const { getVisitAttachments } = await import("./actions");
      const results = await getVisitAttachments(VALID_VISIT_ID);

      expect(results).toEqual([]);
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
    it("should generate a signed URL", async () => {
      // Mock fetch attachment
      mocks.mockSingle
        .mockResolvedValueOnce({
          data: { id: VALID_ATTACHMENT_ID, file_path: "visits/visit-123/12345-photo.jpg", visit_id: VALID_VISIT_ID },
          error: null,
        })
        // Mock visit check
        .mockResolvedValueOnce({ data: { id: VALID_VISIT_ID }, error: null });

      const { getAttachmentDownloadUrl } = await import("./actions");
      const result = await getAttachmentDownloadUrl(VALID_ATTACHMENT_ID);

      expect(result.url).toBe("https://example.com/signed-url");
    });

    it("should handle URL generation errors", async () => {
      // Mock fetch attachment
      mocks.mockSingle
        .mockResolvedValueOnce({
          data: { id: VALID_ATTACHMENT_ID, file_path: "visits/visit-123/12345-photo.jpg", visit_id: VALID_VISIT_ID },
          error: null,
        })
        // Mock visit check
        .mockResolvedValueOnce({ data: { id: VALID_VISIT_ID }, error: null });
      mocks.mockCreateSignedUrl.mockResolvedValueOnce({
        data: null,
        error: { message: "storage error" },
      });

      const { getAttachmentDownloadUrl } = await import("./actions");
      const result = await getAttachmentDownloadUrl(VALID_ATTACHMENT_ID);

      expect(result.error).toContain("Failed to generate download link");
    });
  });
});
