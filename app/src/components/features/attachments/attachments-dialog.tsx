"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";
import { AttachmentUpload } from "./attachment-upload";
import { AttachmentList } from "./attachment-list";
import {
  getVisitAttachments,
  type AttachmentRecord,
} from "@/app/(dashboard)/doctor/visits/[id]/attachments/actions";

interface AttachmentsDialogProps {
  visitId: string;
  attachmentCount: number;
  disabled?: boolean;
}

export function AttachmentsDialog({
  visitId,
  attachmentCount,
  disabled,
}: AttachmentsDialogProps) {
  const [open, setOpen] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  const handleOpenChange = async (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen && !loaded) {
      const data = await getVisitAttachments(visitId);
      setAttachments(data);
      setLoaded(true);
    }
  };

  const refreshAttachments = async () => {
    const data = await getVisitAttachments(visitId);
    setAttachments(data);
  };

  const handleDelete = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="default" size="sm" disabled={disabled}>
            <Paperclip className="mr-1.5 h-4 w-4" />
            Manage files
            {attachmentCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {attachmentCount}
              </Badge>
            )}
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Attachments</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <AttachmentUpload
            visitId={visitId}
            onUploadComplete={refreshAttachments}
          />
          <AttachmentList attachments={attachments} onDelete={handleDelete} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
