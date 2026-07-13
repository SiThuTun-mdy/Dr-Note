import { describe, it, expect } from "vitest";
import {
  attachmentFileSchema,
  attachmentUploadSchema,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/validators/attachment";

describe("attachment validators", () => {
  describe("constants", () => {
    it("MAX_FILE_SIZE is 10MB", () => {
      expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
    });

    it("ALLOWED_MIME_TYPES includes all expected types", () => {
      expect(ALLOWED_MIME_TYPES).toContain("image/jpeg");
      expect(ALLOWED_MIME_TYPES).toContain("image/png");
      expect(ALLOWED_MIME_TYPES).toContain("image/gif");
      expect(ALLOWED_MIME_TYPES).toContain("image/webp");
      expect(ALLOWED_MIME_TYPES).toContain("application/pdf");
      expect(ALLOWED_MIME_TYPES).toContain("application/msword");
      expect(ALLOWED_MIME_TYPES).toContain(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      expect(ALLOWED_MIME_TYPES).toHaveLength(7);
    });
  });

  describe("attachmentFileSchema", () => {
    function createMockFile(
      name: string,
      type: string,
      size: number
    ): File {
      const buffer = new ArrayBuffer(size);
      return new File([buffer], name, { type });
    }

    describe("valid files", () => {
      it("accepts a valid JPEG image under 10MB", () => {
        const file = createMockFile("photo.jpg", "image/jpeg", 1024);
        const result = attachmentFileSchema.safeParse(file);
        expect(result.success).toBe(true);
      });

      it("accepts a valid PNG image", () => {
        const file = createMockFile("image.png", "image/png", 2048);
        const result = attachmentFileSchema.safeParse(file);
        expect(result.success).toBe(true);
      });

      it("accepts a valid GIF image", () => {
        const file = createMockFile("animation.gif", "image/gif", 4096);
        const result = attachmentFileSchema.safeParse(file);
        expect(result.success).toBe(true);
      });

      it("accepts a valid WebP image", () => {
        const file = createMockFile("modern.webp", "image/webp", 8192);
        const result = attachmentFileSchema.safeParse(file);
        expect(result.success).toBe(true);
      });

      it("accepts a valid PDF document", () => {
        const file = createMockFile("report.pdf", "application/pdf", 50000);
        const result = attachmentFileSchema.safeParse(file);
        expect(result.success).toBe(true);
      });

      it("accepts a valid DOC document", () => {
        const file = createMockFile(
          "document.doc",
          "application/msword",
          30000
        );
        const result = attachmentFileSchema.safeParse(file);
        expect(result.success).toBe(true);
      });

      it("accepts a valid DOCX document", () => {
        const file = createMockFile(
          "document.docx",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          40000
        );
        const result = attachmentFileSchema.safeParse(file);
        expect(result.success).toBe(true);
      });

      it("accepts a file at exactly 10MB", () => {
        const file = createMockFile(
          "large.jpg",
          "image/jpeg",
          MAX_FILE_SIZE
        );
        const result = attachmentFileSchema.safeParse(file);
        expect(result.success).toBe(true);
      });

      it("accepts a zero-byte file of valid type", () => {
        const file = createMockFile("empty.pdf", "application/pdf", 0);
        const result = attachmentFileSchema.safeParse(file);
        expect(result.success).toBe(true);
      });
    });

    describe("invalid files", () => {
      it("rejects a file larger than 10MB", () => {
        const file = createMockFile(
          "huge.jpg",
          "image/jpeg",
          MAX_FILE_SIZE + 1
        );
        const result = attachmentFileSchema.safeParse(file);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "File must be under 10MB"
          );
        }
      });

      it("rejects an EXE file", () => {
        const file = createMockFile("malware.exe", "application/x-msdownload", 1024);
        const result = attachmentFileSchema.safeParse(file);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain(
            "File type not supported"
          );
        }
      });

      it("rejects a ZIP file", () => {
        const file = createMockFile("archive.zip", "application/zip", 1024);
        const result = attachmentFileSchema.safeParse(file);
        expect(result.success).toBe(false);
      });

      it("rejects a TXT file", () => {
        const file = createMockFile("notes.txt", "text/plain", 1024);
        const result = attachmentFileSchema.safeParse(file);
        expect(result.success).toBe(false);
      });

      it("rejects a CSV file", () => {
        const file = createMockFile("data.csv", "text/csv", 1024);
        const result = attachmentFileSchema.safeParse(file);
        expect(result.success).toBe(false);
      });

      it("rejects an MP4 video", () => {
        const file = createMockFile("video.mp4", "video/mp4", 1024);
        const result = attachmentFileSchema.safeParse(file);
        expect(result.success).toBe(false);
      });

      it("rejects a file with empty MIME type", () => {
        const file = createMockFile("unknown", "", 1024);
        const result = attachmentFileSchema.safeParse(file);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("attachmentUploadSchema", () => {
    it("accepts a valid UUID visit ID", () => {
      const result = attachmentUploadSchema.safeParse({
        visitId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("rejects an invalid UUID", () => {
      const result = attachmentUploadSchema.safeParse({
        visitId: "not-a-uuid",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid visit ID");
      }
    });

    it("rejects an empty visit ID", () => {
      const result = attachmentUploadSchema.safeParse({
        visitId: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing visitId field", () => {
      const result = attachmentUploadSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects a numeric visit ID", () => {
      const result = attachmentUploadSchema.safeParse({
        visitId: 12345,
      });
      expect(result.success).toBe(false);
    });
  });
});
