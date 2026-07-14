import { z } from "zod";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const attachmentFileSchema = z
  .custom<File>()
  .refine((f) => f.size <= MAX_FILE_SIZE, "File must be under 10MB")
  .refine(
    (f) => ALLOWED_MIME_TYPES.includes(f.type as (typeof ALLOWED_MIME_TYPES)[number]),
    "File type not supported. Allowed: JPG, PNG, GIF, WebP, PDF, DOC, DOCX"
  );

export const attachmentUploadSchema = z.object({
  visitId: z.string().uuid("Invalid visit ID"),
});

export type AttachmentUploadInput = z.infer<typeof attachmentUploadSchema>;
