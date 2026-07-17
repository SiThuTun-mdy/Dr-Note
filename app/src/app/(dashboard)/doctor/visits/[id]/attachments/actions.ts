"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  attachmentUploadSchema,
  uuidSchema,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/validators/attachment";

const BUCKET_NAME = "visit-attachments";

export interface AttachmentRecord {
  id: string;
  visit_id: string;
  file_path: string;
  file_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface UploadAttachmentResult {
  success?: boolean;
  attachment?: AttachmentRecord;
  error?: string;
}

export async function uploadAttachment(
  visitId: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  fileBuffer: ArrayBuffer
): Promise<UploadAttachmentResult> {
  // Step 1: Validate input
  const parsed = attachmentUploadSchema.safeParse({ visitId });
  if (!parsed.success) {
    return { error: "Invalid visit ID." };
  }

  // Step 2: Validate file type
  if (!ALLOWED_MIME_TYPES.includes(fileType as (typeof ALLOWED_MIME_TYPES)[number])) {
    return { error: "File type not supported. Allowed: JPG, PNG, GIF, WebP, PDF, DOC, DOCX." };
  }

  // Step 3: Validate file size
  if (fileSize > MAX_FILE_SIZE) {
    return { error: "File must be under 10MB." };
  }

  // Step 4: Get authenticated user
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("[uploadAttachment] Auth failed:", authError?.message);
    return { error: "Authentication required." };
  }

  // Step 5: Verify visit exists
  const { data: visit, error: visitError } = await supabase
    .from("visits")
    .select("id")
    .eq("id", visitId)
    .single();

  if (visitError || !visit) {
    console.error("[uploadAttachment] Visit not found:", visitError?.message, { visit_id: visitId });
    return { error: "Visit not found." };
  }

  // Step 6: Upload to Supabase Storage
  const timestamp = Date.now();
  // Sanitize filename: remove path separators and control characters
  const sanitizedFileName = fileName.replace(/[^\w.\-]/g, "_");
  const storagePath = `visits/${visitId}/${timestamp}-${sanitizedFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileBuffer, {
      contentType: fileType,
      upsert: false,
    });

  if (uploadError) {
    console.error("[uploadAttachment] Storage upload failed:", uploadError.message, { visit_id: visitId, path: storagePath });
    return { error: "Failed to upload file. Please try again." };
  }

  // Step 7: Insert record into attachments table
  const { data: attachment, error: insertError } = await supabase
    .from("attachments")
    .insert({
      visit_id: visitId,
      file_path: storagePath,
      file_type: fileType,
      uploaded_by: user.id,
    })
    .select("id, visit_id, file_path, file_type, uploaded_by, created_at")
    .single();

  if (insertError) {
    console.error("[uploadAttachment] DB insert failed:", insertError.message, { visit_id: visitId, path: storagePath });
    // Attempt to clean up the uploaded file if DB insert fails
    await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    return { error: "Failed to save attachment record. Please try again." };
  }

  revalidatePath(`/doctor/visits/${visitId}`);
  return { success: true, attachment };
}

export async function getVisitAttachments(
  visitId: string
): Promise<AttachmentRecord[]> {
  // Validate visit ID format
  if (!uuidSchema.safeParse(visitId).success) {
    return [];
  }

  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("attachments")
    .select("id, visit_id, file_path, file_type, uploaded_by, created_at")
    .eq("visit_id", visitId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return [];
  }

  return data || [];
}

export async function getVisitAttachmentCount(
  visitId: string
): Promise<number> {
  // Validate visit ID format
  if (!uuidSchema.safeParse(visitId).success) {
    return 0;
  }

  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return 0;
  }

  const { count, error } = await supabase
    .from("attachments")
    .select("id", { count: "exact", head: true })
    .eq("visit_id", visitId);

  if (error) {
    return 0;
  }

  return count || 0;
}

export async function deleteAttachment(
  attachmentId: string,
  visitId: string
): Promise<{ success?: boolean; error?: string }> {
  // Validate inputs
  if (!uuidSchema.safeParse(attachmentId).success) {
    return { error: "Invalid attachment ID." };
  }
  if (!uuidSchema.safeParse(visitId).success) {
    return { error: "Invalid visit ID." };
  }

  const supabase = await createClient();

  // Step 1: Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("[deleteAttachment] Auth failed:", authError?.message);
    return { error: "Authentication required." };
  }

  // Step 2: Fetch the attachment record to get file_path
  const { data: attachment, error: fetchError } = await supabase
    .from("attachments")
    .select("id, file_path, uploaded_by, visit_id")
    .eq("id", attachmentId)
    .single();

  if (fetchError || !attachment) {
    console.error("[deleteAttachment] Not found:", fetchError?.message, { attachment_id: attachmentId });
    return { error: "Attachment not found." };
  }

  // Step 3: Verify the attachment belongs to the specified visit
  if (attachment.visit_id !== visitId) {
    return { error: "Attachment does not belong to this visit." };
  }

  // Step 4: Authorization check — user must be the uploader or have visits.update permission
  const isUploader = attachment.uploaded_by === user.id;
  if (!isUploader) {
    const { data: hasPermission } = await supabase.rpc("has_permission", {
      perm: "visits.update",
    });
    if (!hasPermission) {
      return { error: "You do not have permission to delete this attachment." };
    }
  }

  // Step 5: Delete from Storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([attachment.file_path]);

  if (storageError) {
    console.error("[deleteAttachment] Storage delete failed:", storageError.message, { path: attachment.file_path });
    return { error: "Failed to delete file from storage. Please try again." };
  }

  // Step 6: Delete record from attachments table
  const { error: deleteError } = await supabase
    .from("attachments")
    .delete()
    .eq("id", attachmentId);

  if (deleteError) {
    console.error("[deleteAttachment] DB delete failed:", deleteError.message, { attachment_id: attachmentId });
    return { error: "Failed to delete attachment record. Please try again." };
  }

  revalidatePath(`/doctor/visits/${visitId}`);
  return { success: true };
}

export async function getAttachmentDownloadUrl(
  attachmentId: string
): Promise<{ url?: string; error?: string }> {
  // Validate attachment ID format
  if (!uuidSchema.safeParse(attachmentId).success) {
    return { error: "Invalid attachment ID." };
  }

  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("[getAttachmentDownloadUrl] Auth failed:", authError?.message);
    return { error: "Authentication required." };
  }

  // Fetch the attachment record to verify access and get file_path
  const { data: attachment, error: fetchError } = await supabase
    .from("attachments")
    .select("id, file_path, visit_id")
    .eq("id", attachmentId)
    .single();

  if (fetchError || !attachment) {
    console.error("[getAttachmentDownloadUrl] Not found:", fetchError?.message, { attachment_id: attachmentId });
    return { error: "Attachment not found." };
  }

  // Verify the user can read the associated visit
  // Use generic error message to avoid leaking visit existence information
  const { error: visitError } = await supabase
    .from("visits")
    .select("id")
    .eq("id", attachment.visit_id)
    .single();

  if (visitError) {
    return { error: "Attachment not found." };
  }

  // Generate signed URL
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(attachment.file_path, 3600); // 1 hour expiry

  if (error) {
    console.error("[getAttachmentDownloadUrl] Signed URL failed:", error.message, { path: attachment.file_path });
    return { error: "Failed to generate download link." };
  }

  return { url: data.signedUrl };
}
