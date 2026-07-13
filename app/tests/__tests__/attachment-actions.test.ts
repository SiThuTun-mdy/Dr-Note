import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client before importing actions
const mockGetUser = vi.fn();
const mockUpload = vi.fn();
const mockRemove = vi.fn();
const mockCreateSignedUrl = vi.fn();
const mockRpc = vi.fn();

// Pre-create chains for each table so they're always available
const visitsChain = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn(),
};

const attachmentsChain = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn(),
};

const mockSupabaseClient = {
  auth: {
    getUser: mockGetUser,
  },
  from: vi.fn((table: string) => {
    if (table === "visits") return visitsChain;
    return attachmentsChain;
  }),
  storage: {
    from: vi.fn(() => ({
      upload: mockUpload,
      remove: mockRemove,
      createSignedUrl: mockCreateSignedUrl,
    })),
  },
  rpc: mockRpc,
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Import actions after mocks are set up
import {
  uploadAttachment,
  getVisitAttachments,
  deleteAttachment,
  getAttachmentDownloadUrl,
} from "@/app/(dashboard)/doctor/visits/[id]/attachments/actions";

describe("attachment server actions", () => {
  const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
  const VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440001";
  const mockUser = { id: "user-123" };
  const mockBuffer = new ArrayBuffer(1024);

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
  });

  describe("uploadAttachment", () => {
    it("returns error for invalid visit ID", async () => {
      const result = await uploadAttachment(
        "invalid-id",
        "photo.jpg",
        "image/jpeg",
        1024,
        mockBuffer
      );
      expect(result.error).toBe("Invalid visit ID.");
      expect(result.success).toBeUndefined();
    });

    it("returns error for unsupported file type", async () => {
      const result = await uploadAttachment(
        VALID_UUID,
        "malware.exe",
        "application/x-msdownload",
        1024,
        mockBuffer
      );
      expect(result.error).toContain("File type not supported");
    });

    it("returns error for file exceeding 10MB", async () => {
      const result = await uploadAttachment(
        VALID_UUID,
        "huge.jpg",
        "image/jpeg",
        11 * 1024 * 1024,
        mockBuffer
      );
      expect(result.error).toBe("File must be under 10MB.");
    });

    it("returns error when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const result = await uploadAttachment(
        VALID_UUID,
        "photo.jpg",
        "image/jpeg",
        1024,
        mockBuffer
      );
      expect(result.error).toBe("Authentication required.");
    });

    it("returns error when visit does not exist", async () => {
      visitsChain.single.mockResolvedValue({
        data: null,
        error: { message: "Not found" },
      });

      const result = await uploadAttachment(
        VALID_UUID,
        "photo.jpg",
        "image/jpeg",
        1024,
        mockBuffer
      );
      expect(result.error).toBe("Visit not found.");
    });

    it("returns error when storage upload fails", async () => {
      visitsChain.single.mockResolvedValue({
        data: { id: VALID_UUID },
        error: null,
      });
      mockUpload.mockResolvedValue({ error: { message: "Upload failed" } });

      const result = await uploadAttachment(
        VALID_UUID,
        "photo.jpg",
        "image/jpeg",
        1024,
        mockBuffer
      );
      expect(result.error).toBe("Failed to upload file. Please try again.");
    });

    it("returns error and cleans up when DB insert fails", async () => {
      visitsChain.single.mockResolvedValue({
        data: { id: VALID_UUID },
        error: null,
      });
      mockUpload.mockResolvedValue({ error: null });

      const mockSelectReturn = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Insert failed" },
        }),
      });
      attachmentsChain.insert.mockReturnValue({ select: mockSelectReturn });

      const result = await uploadAttachment(
        VALID_UUID,
        "photo.jpg",
        "image/jpeg",
        1024,
        mockBuffer
      );
      expect(result.error).toBe(
        "Failed to save attachment record. Please try again."
      );
      expect(mockRemove).toHaveBeenCalled();
    });

    it("sanitizes filename and returns success on valid upload", async () => {
      visitsChain.single.mockResolvedValue({
        data: { id: VALID_UUID },
        error: null,
      });
      mockUpload.mockResolvedValue({ error: null });

      const mockAttachment = {
        id: VALID_UUID_2,
        visit_id: VALID_UUID,
        file_path: `visits/${VALID_UUID}/12345-photo.jpg`,
        file_type: "image/jpeg",
        uploaded_by: mockUser.id,
        created_at: new Date().toISOString(),
      };
      const mockSelectReturn = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: mockAttachment,
          error: null,
        }),
      });
      attachmentsChain.insert.mockReturnValue({ select: mockSelectReturn });

      const result = await uploadAttachment(
        VALID_UUID,
        "my photo.jpg",
        "image/jpeg",
        1024,
        mockBuffer
      );
      expect(result.success).toBe(true);
      expect(result.attachment).toEqual(mockAttachment);
    });
  });

  describe("getVisitAttachments", () => {
    it("returns empty array for invalid UUID", async () => {
      const result = await getVisitAttachments("invalid-id");
      expect(result).toEqual([]);
    });

    it("returns empty array when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

      const result = await getVisitAttachments(VALID_UUID);
      expect(result).toEqual([]);
    });

    it("returns empty array on database error", async () => {
      attachmentsChain.limit.mockResolvedValue({
        data: null,
        error: { message: "DB error" },
      });

      const result = await getVisitAttachments(VALID_UUID);
      expect(result).toEqual([]);
    });

    it("returns attachments list on success", async () => {
      const mockAttachments = [
        {
          id: VALID_UUID_2,
          visit_id: VALID_UUID,
          file_path: "visits/123/1-photo.jpg",
          file_type: "image/jpeg",
          uploaded_by: mockUser.id,
          created_at: "2026-01-01T00:00:00Z",
        },
      ];
      attachmentsChain.limit.mockResolvedValue({
        data: mockAttachments,
        error: null,
      });

      const result = await getVisitAttachments(VALID_UUID);
      expect(result).toEqual(mockAttachments);
    });

    it("returns empty array for empty string", async () => {
      const result = await getVisitAttachments("");
      expect(result).toEqual([]);
    });
  });

  describe("deleteAttachment", () => {
    it("returns error for invalid attachment ID", async () => {
      const result = await deleteAttachment("invalid", VALID_UUID);
      expect(result.error).toBe("Invalid attachment ID.");
    });

    it("returns error for invalid visit ID", async () => {
      const result = await deleteAttachment(VALID_UUID, "invalid");
      expect(result.error).toBe("Invalid visit ID.");
    });

    it("returns error when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const result = await deleteAttachment(VALID_UUID, VALID_UUID_2);
      expect(result.error).toBe("Authentication required.");
    });

    it("returns error when attachment not found", async () => {
      attachmentsChain.single.mockResolvedValue({
        data: null,
        error: { message: "Not found" },
      });

      const result = await deleteAttachment(VALID_UUID, VALID_UUID_2);
      expect(result.error).toBe("Attachment not found.");
    });

    it("returns error when attachment does not belong to visit", async () => {
      attachmentsChain.single.mockResolvedValue({
        data: {
          id: VALID_UUID,
          file_path: "visits/123/1-photo.jpg",
          uploaded_by: mockUser.id,
          visit_id: "99999999-9999-9999-9999-999999999999",
        },
        error: null,
      });

      const result = await deleteAttachment(VALID_UUID, VALID_UUID_2);
      expect(result.error).toBe("Attachment does not belong to this visit.");
    });

    it("returns error when user lacks permission and is not uploader", async () => {
      attachmentsChain.single.mockResolvedValue({
        data: {
          id: VALID_UUID,
          file_path: "visits/123/1-photo.jpg",
          uploaded_by: "other-user",
          visit_id: VALID_UUID_2,
        },
        error: null,
      });
      mockRpc.mockResolvedValue({ data: false });

      const result = await deleteAttachment(VALID_UUID, VALID_UUID_2);
      expect(result.error).toBe(
        "You do not have permission to delete this attachment."
      );
    });

    it("allows uploader to delete their own attachment", async () => {
      attachmentsChain.single.mockResolvedValue({
        data: {
          id: VALID_UUID,
          file_path: "visits/123/1-photo.jpg",
          uploaded_by: mockUser.id,
          visit_id: VALID_UUID_2,
        },
        error: null,
      });
      mockRemove.mockResolvedValue({ error: null });

      const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });
      attachmentsChain.delete.mockReturnValue({ eq: mockDeleteEq });

      const result = await deleteAttachment(VALID_UUID, VALID_UUID_2);
      expect(result.success).toBe(true);
    });

    it("allows user with visits.update permission to delete", async () => {
      attachmentsChain.single.mockResolvedValue({
        data: {
          id: VALID_UUID,
          file_path: "visits/123/1-photo.jpg",
          uploaded_by: "other-user",
          visit_id: VALID_UUID_2,
        },
        error: null,
      });
      mockRpc.mockResolvedValue({ data: true });
      mockRemove.mockResolvedValue({ error: null });

      const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });
      attachmentsChain.delete.mockReturnValue({ eq: mockDeleteEq });

      const result = await deleteAttachment(VALID_UUID, VALID_UUID_2);
      expect(result.success).toBe(true);
    });

    it("returns error when storage delete fails", async () => {
      attachmentsChain.single.mockResolvedValue({
        data: {
          id: VALID_UUID,
          file_path: "visits/123/1-photo.jpg",
          uploaded_by: mockUser.id,
          visit_id: VALID_UUID_2,
        },
        error: null,
      });
      mockRemove.mockResolvedValue({ error: { message: "Storage error" } });

      const result = await deleteAttachment(VALID_UUID, VALID_UUID_2);
      expect(result.error).toBe(
        "Failed to delete file from storage. Please try again."
      );
    });
  });

  describe("getAttachmentDownloadUrl", () => {
    it("returns error for invalid attachment ID", async () => {
      const result = await getAttachmentDownloadUrl("invalid");
      expect(result.error).toBe("Invalid attachment ID.");
    });

    it("returns error when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const result = await getAttachmentDownloadUrl(VALID_UUID);
      expect(result.error).toBe("Authentication required.");
    });

    it("returns error when attachment not found", async () => {
      attachmentsChain.single.mockResolvedValue({
        data: null,
        error: { message: "Not found" },
      });

      const result = await getAttachmentDownloadUrl(VALID_UUID);
      expect(result.error).toBe("Attachment not found.");
    });

    it("returns error when visit not found", async () => {
      attachmentsChain.single.mockResolvedValue({
        data: {
          id: VALID_UUID,
          file_path: "visits/123/1-photo.jpg",
          visit_id: VALID_UUID_2,
        },
        error: null,
      });
      visitsChain.single.mockResolvedValue({
        data: null,
        error: { message: "Not found" },
      });

      const result = await getAttachmentDownloadUrl(VALID_UUID);
      expect(result.error).toBe("Visit not found.");
    });

    it("returns error when signed URL generation fails", async () => {
      attachmentsChain.single.mockResolvedValue({
        data: {
          id: VALID_UUID,
          file_path: "visits/123/1-photo.jpg",
          visit_id: VALID_UUID_2,
        },
        error: null,
      });
      visitsChain.single.mockResolvedValue({
        data: { id: VALID_UUID_2 },
        error: null,
      });
      mockCreateSignedUrl.mockResolvedValue({
        data: null,
        error: { message: "URL error" },
      });

      const result = await getAttachmentDownloadUrl(VALID_UUID);
      expect(result.error).toBe("Failed to generate download link.");
    });

    it("returns signed URL on success", async () => {
      attachmentsChain.single.mockResolvedValue({
        data: {
          id: VALID_UUID,
          file_path: "visits/123/1-photo.jpg",
          visit_id: VALID_UUID_2,
        },
        error: null,
      });
      visitsChain.single.mockResolvedValue({
        data: { id: VALID_UUID_2 },
        error: null,
      });
      mockCreateSignedUrl.mockResolvedValue({
        data: { signedUrl: "https://storage.example.com/signed-url" },
        error: null,
      });

      const result = await getAttachmentDownloadUrl(VALID_UUID);
      expect(result.url).toBe("https://storage.example.com/signed-url");
      expect(result.error).toBeUndefined();
    });
  });
});
