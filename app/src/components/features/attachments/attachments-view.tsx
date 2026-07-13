"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AttachmentUpload } from "./attachment-upload";
import { AttachmentList } from "./attachment-list";
import {
  getVisitAttachments,
  type AttachmentRecord,
} from "@/app/(dashboard)/doctor/visits/[id]/attachments/actions";

interface AttachmentsViewProps {
  visitId: string;
  initialAttachments: AttachmentRecord[];
}

export function AttachmentsView({
  visitId,
  initialAttachments,
}: AttachmentsViewProps) {
  const [attachments, setAttachments] = useState(initialAttachments);

  const refreshAttachments = async () => {
    const data = await getVisitAttachments(visitId);
    setAttachments(data);
  };

  const handleDelete = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Attachments</h1>
        <p className="text-muted-foreground">
          Upload and manage files for this visit
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Upload file</CardTitle>
            {attachments.length > 0 && (
              <Badge variant="secondary">{attachments.length}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <AttachmentUpload
            visitId={visitId}
            onUploadComplete={refreshAttachments}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Attached files</CardTitle>
        </CardHeader>
        <CardContent>
          <AttachmentList
            attachments={attachments}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}
