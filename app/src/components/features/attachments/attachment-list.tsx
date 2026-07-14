"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  Download,
  Trash2,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteAttachment,
  getAttachmentDownloadUrl,
  type AttachmentRecord,
} from "@/app/(dashboard)/doctor/visits/[id]/attachments/actions";
import { getFileIcon, getFileName, fileTypeLabels } from "./utils";

interface AttachmentListProps {
  attachments: AttachmentRecord[];
  onDelete?: (attachmentId: string) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AttachmentList({ attachments, onDelete }: AttachmentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDownload = async (attachment: AttachmentRecord) => {
    const result = await getAttachmentDownloadUrl(attachment.id);
    if (result.error) {
      toast.error(result.error);
    } else if (result.url) {
      // Create a temporary link to trigger download with proper filename
      const link = document.createElement("a");
      link.href = result.url;
      link.download = getFileName(attachment.file_path);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = async (attachmentId: string, visitId: string) => {
    setDeletingId(attachmentId);
    try {
      const result = await deleteAttachment(attachmentId, visitId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Attachment deleted");
        onDelete?.(attachmentId);
      }
    } catch {
      toast.error("Failed to delete attachment");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  if (attachments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <FileText className="mb-2 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium text-muted-foreground">
          No attachments yet
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload files to attach them to this visit
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => {
        const Icon = getFileIcon(attachment.file_type);
        const fileName = getFileName(attachment.file_path);
        const label = attachment.file_type
          ? fileTypeLabels[attachment.file_type] || "File"
          : "File";

        return (
          <Card key={attachment.id}>
            <CardContent className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{fileName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">
                      {label}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(attachment.created_at)}
                    </span>
                    {attachment.uploaded_by && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Uploaded
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-11 w-11 p-0"
                  onClick={() => handleDownload(attachment)}
                  aria-label={`Download ${fileName}`}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-11 w-11 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => setConfirmDeleteId(attachment.id)}
                  disabled={deletingId === attachment.id}
                  aria-label={`Delete ${fileName}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete attachment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (confirmDeleteId) {
                  const att = attachments.find((a) => a.id === confirmDeleteId);
                  if (att) {
                    handleDelete(confirmDeleteId, att.visit_id);
                  }
                }
              }}
              disabled={deletingId !== null}
            >
              {deletingId === confirmDeleteId ? "Deleting..." : "Delete file"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
