import { describe, it, expect } from "vitest";
import { attachmentFileSchema, attachmentUploadSchema } from "../attachment";

// Helper to create a mock File
function createMockFile(
  name: string,
  type: string,
  size: number
): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

describe("attachmentFileSchema", () => {
  it("should accept a valid JPEG file under 10MB", () => {
    const file = createMockFile("photo.jpg", "image/jpeg", 1024 * 100);
    const result = attachmentFileSchema.safeParse(file);
    expect(result.success).toBe(true);
  });

  it("should accept a valid PDF file under 10MB", () => {
    const file = createMockFile("report.pdf", "application/pdf", 1024 * 500);
    const result = attachmentFileSchema.safeParse(file);
    expect(result.success).toBe(true);
  });

  it("should accept a valid DOCX file under 10MB", () => {
    const file = createMockFile(
      "document.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      1024 * 200
    );
    const result = attachmentFileSchema.safeParse(file);
    expect(result.success).toBe(true);
  });

  it("should reject files over 10MB", () => {
    const file = createMockFile(
      "large.jpg",
      "image/jpeg",
      10 * 1024 * 1024 + 1
    );
    const result = attachmentFileSchema.safeParse(file);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("10MB");
    }
  });

  it("should reject unsupported file types", () => {
    const file = createMockFile("script.exe", "application/x-executable", 1024);
    const result = attachmentFileSchema.safeParse(file);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("not supported");
    }
  });

  it("should accept PNG files", () => {
    const file = createMockFile("image.png", "image/png", 1024);
    const result = attachmentFileSchema.safeParse(file);
    expect(result.success).toBe(true);
  });

  it("should accept GIF files", () => {
    const file = createMockFile("animation.gif", "image/gif", 1024);
    const result = attachmentFileSchema.safeParse(file);
    expect(result.success).toBe(true);
  });

  it("should accept WebP files", () => {
    const file = createMockFile("image.webp", "image/webp", 1024);
    const result = attachmentFileSchema.safeParse(file);
    expect(result.success).toBe(true);
  });

  it("should accept DOC files", () => {
    const file = createMockFile(
      "legacy.doc",
      "application/msword",
      1024
    );
    const result = attachmentFileSchema.safeParse(file);
    expect(result.success).toBe(true);
  });

  it("should reject MP4 video files", () => {
    const file = createMockFile("video.mp4", "video/mp4", 1024);
    const result = attachmentFileSchema.safeParse(file);
    expect(result.success).toBe(false);
  });
});

describe("attachmentUploadSchema", () => {
  it("should accept a valid UUID", () => {
    const result = attachmentUploadSchema.safeParse({
      visitId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("should reject an invalid UUID", () => {
    const result = attachmentUploadSchema.safeParse({
      visitId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing visitId", () => {
    const result = attachmentUploadSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
