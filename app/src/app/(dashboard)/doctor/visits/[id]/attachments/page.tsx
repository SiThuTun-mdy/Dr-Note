import type { Metadata } from "next"
import { notFound } from "next/navigation";
import { getVisitWithDetails } from "../actions";
import { getVisitAttachments } from "./actions";
import { AttachmentsView } from "@/components/features/attachments/attachments-view";

export const metadata: Metadata = {
  title: "Attachments",
  description: "Visit attachments",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AttachmentsPage({ params }: PageProps) {
  const { id } = await params;

  // Verify visit exists
  const visit = await getVisitWithDetails(id);
  if (!visit) {
    notFound();
  }

  const attachments = await getVisitAttachments(id);

  return <AttachmentsView visitId={id} initialAttachments={attachments} />;
}
