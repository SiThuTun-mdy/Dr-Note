import { FileText, Image } from "lucide-react";

/**
 * Get the appropriate icon component for a file type.
 * Shared between upload and list components.
 */
export function getFileIcon(fileType: string | null) {
  if (!fileType) return FileText;
  if (fileType.startsWith("image/")) return Image;
  return FileText;
}

/**
 * Extract filename from a storage path like "visits/uuid/1234567890-photo.jpg"
 */
export function getFileName(filePath: string): string {
  const parts = filePath.split("/");
  const lastPart = parts[parts.length - 1] || "";
  // Remove timestamp prefix (e.g., "1234567890-")
  const match = lastPart.match(/^\d+-(.+)$/);
  return match ? match[1] : lastPart;
}

/**
 * Format file size for display.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Map MIME types to human-readable labels.
 */
export const fileTypeLabels: Record<string, string> = {
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "image/gif": "GIF",
  "image/webp": "WebP",
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
};
