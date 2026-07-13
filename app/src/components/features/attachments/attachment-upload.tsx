"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Image, X } from "lucide-react";
import { toast } from "sonner";
import { uploadAttachment } from "@/app/(dashboard)/doctor/visits/[id]/attachments/actions";
import { attachmentFileSchema } from "@/lib/validators/attachment";

interface AttachmentUploadProps {
  visitId: string;
  onUploadComplete?: () => void;
}

interface PendingFile {
  file: File;
  preview?: string;
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return Image;
  return FileText;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentUpload({
  visitId,
  onUploadComplete,
}: AttachmentUploadProps) {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      pendingFiles.forEach((pf) => {
        if (pf.preview) URL.revokeObjectURL(pf.preview);
      });
    };
  }, [pendingFiles]);

  const validateAndAddFiles = useCallback(
    (files: FileList | File[]) => {
      const newFiles: PendingFile[] = [];
      const errors: string[] = [];

      Array.from(files).forEach((file) => {
        const result = attachmentFileSchema.safeParse(file);
        if (result.success) {
          const preview = file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : undefined;
          newFiles.push({ file, preview });
        } else {
          const msg = result.error.issues[0]?.message || "Invalid file";
          errors.push(`${file.name}: ${msg}`);
        }
      });

      if (errors.length > 0) {
        toast.error(errors.join("\n"));
      }

      if (newFiles.length > 0) {
        setPendingFiles((prev) => [...prev, ...newFiles]);
      }
    },
    []
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndAddFiles(e.target.files);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => {
      const removed = prev[index];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const { file } of pendingFiles) {
      try {
        const buffer = await file.arrayBuffer();
        const result = await uploadAttachment(
          visitId,
          file.name,
          file.type,
          file.size,
          buffer
        );

        if (result.error) {
          failCount++;
          toast.error(`Failed to upload ${file.name}: ${result.error}`);
        } else {
          successCount++;
        }
      } catch {
        failCount++;
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    // Clean up previews
    pendingFiles.forEach((pf) => {
      if (pf.preview) URL.revokeObjectURL(pf.preview);
    });

    setPendingFiles([]);
    setUploading(false);

    if (successCount > 0) {
      toast.success(
        `${successCount} file${successCount > 1 ? "s" : ""} uploaded successfully`
      );
      onUploadComplete?.();
    }

    if (failCount > 0 && successCount === 0) {
      toast.error("All uploads failed. Please try again.");
    }
  };

  return (
    <Card>
      <CardContent className="pt-4">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="Upload files by clicking or dragging"
        >
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">
            Click to upload or drag and drop
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG, GIF, WebP, PDF, DOC, DOCX (max 10MB)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />

        {/* Pending files list */}
        {pendingFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">
              {pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""}{" "}
              ready to upload
            </p>
            <ul className="space-y-2">
              {pendingFiles.map((pf, index) => {
                const Icon = getFileIcon(pf.file.type);
                return (
                  <li
                    key={`${pf.file.name}-${index}`}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm">{pf.file.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatFileSize(pf.file.size)}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-11 w-11 shrink-0 p-0"
                      onClick={() => removePendingFile(index)}
                      disabled={uploading}
                      aria-label={`Remove ${pf.file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-2"
            >
              {uploading ? "Uploading..." : "Upload file"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
