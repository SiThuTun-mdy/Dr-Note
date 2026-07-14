import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

// Mock server actions
vi.mock(
  "@/app/(dashboard)/doctor/visits/[id]/attachments/actions",
  () => ({
    uploadAttachment: vi.fn(),
    getVisitAttachments: vi.fn(),
    deleteAttachment: vi.fn(),
    getAttachmentDownloadUrl: vi.fn(),
  })
);

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { AttachmentUpload } from "@/components/features/attachments/attachment-upload";
import { AttachmentList } from "@/components/features/attachments/attachment-list";
import { AttachmentsView } from "@/components/features/attachments/attachments-view";
import {
  uploadAttachment,
  deleteAttachment,
  getAttachmentDownloadUrl,
} from "@/app/(dashboard)/doctor/visits/[id]/attachments/actions";
import { toast } from "sonner";

const mockUploadAttachment = vi.mocked(uploadAttachment);
const mockDeleteAttachment = vi.mocked(deleteAttachment);
const mockGetAttachmentDownloadUrl = vi.mocked(getAttachmentDownloadUrl);
const mockToast = vi.mocked(toast);

function createMockFile(name: string, type: string, size: number): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

// Polyfill DataTransfer for jsdom
class PolyfillDataTransferItem {
  kind: "file" | "string" = "file";
  type: string;
  file: File | null;
  constructor(kind: "file" | "string", type: string, data?: string | File) {
    this.kind = kind;
    this.type = type;
    this.file = typeof data === "object" ? data : null;
  }
  getAsString(callback: (data: string) => void) {
    callback("");
  }
}

class PolyfillDataTransfer {
  files: File[] = [];
  items: PolyfillDataTransferItem[] = [];
  types: string[] = [];
  dropEffect = "none";
  effectAllowed = "uninitialized";
  addFile(file: File) {
    this.files.push(file);
    this.items.push(new PolyfillDataTransferItem("file", file.type, file));
    this.types.push(file.type);
  }
  clearData() {}
  setData() {}
  getData() {
    return "";
  }
  setDragImage() {}
}

// Helper to get the hidden file input
function getFileInput(): HTMLInputElement {
  return document.querySelector('input[type="file"]') as HTMLInputElement;
}

// Helper to simulate file selection via fireEvent (works in jsdom)
function selectFiles(files: File[]) {
  const fileInput = getFileInput();
  // Use polyfill DataTransfer
  const dataTransfer = new PolyfillDataTransfer();
  files.forEach((f) => dataTransfer.addFile(f));
  Object.defineProperty(fileInput, "files", {
    value: dataTransfer.files,
    writable: true,
  });
  fireEvent.change(fileInput);
}

// Helper to get the Upload file submit button (not the drop zone)
function getUploadButton(): HTMLElement {
  const buttons = screen.getAllByRole("button");
  return buttons.find(
    (btn) =>
      btn.textContent?.trim() === "Upload file" ||
      btn.textContent?.trim() === "Uploading..."
  )!;
}

describe("AttachmentUpload component", () => {
  const VISIT_ID = "550e8400-e29b-41d4-a716-446655440000";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the drop zone with instructions", () => {
    render(<AttachmentUpload visitId={VISIT_ID} />);
    expect(
      screen.getByText("Click to upload or drag and drop")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/JPG, PNG, GIF, WebP, PDF, DOC, DOCX/)
    ).toBeInTheDocument();
  });

  it("renders file input with correct accept attributes", () => {
    render(<AttachmentUpload visitId={VISIT_ID} />);
    const fileInput = getFileInput();
    expect(fileInput).toBeInTheDocument();
    expect(fileInput.accept).toBe(
      ".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
    );
    expect(fileInput.multiple).toBe(true);
  });

  it("does not show pending files list when no files selected", () => {
    render(<AttachmentUpload visitId={VISIT_ID} />);
    expect(screen.queryByText(/ready to upload/)).not.toBeInTheDocument();
  });

  it("accepts valid files via file input", () => {
    render(<AttachmentUpload visitId={VISIT_ID} />);

    const file = createMockFile("test.jpg", "image/jpeg", 1024);
    selectFiles([file]);

    expect(screen.getByText("1 file ready to upload")).toBeInTheDocument();
    expect(screen.getByText("test.jpg")).toBeInTheDocument();
  });

  it("rejects invalid file types with toast error", () => {
    render(<AttachmentUpload visitId={VISIT_ID} />);

    const file = createMockFile(
      "malware.exe",
      "application/x-msdownload",
      1024
    );
    selectFiles([file]);

    expect(mockToast.error).toHaveBeenCalled();
    expect(screen.queryByText("malware.exe")).not.toBeInTheDocument();
  });

  it("rejects files over 10MB with toast error", () => {
    render(<AttachmentUpload visitId={VISIT_ID} />);

    const file = createMockFile("huge.jpg", "image/jpeg", 11 * 1024 * 1024);
    selectFiles([file]);

    expect(mockToast.error).toHaveBeenCalled();
  });

  it("allows removing a pending file", () => {
    render(<AttachmentUpload visitId={VISIT_ID} />);

    const file = createMockFile("test.jpg", "image/jpeg", 1024);
    selectFiles([file]);

    expect(screen.getByText("1 file ready to upload")).toBeInTheDocument();

    const removeButton = screen.getByRole("button", {
      name: /Remove test\.jpg/,
    });
    fireEvent.click(removeButton);

    expect(screen.queryByText(/ready to upload/)).not.toBeInTheDocument();
  });

  it("calls uploadAttachment on upload button click", async () => {
    mockUploadAttachment.mockResolvedValue({
      success: true,
      attachment: {
        id: "att-1",
        visit_id: VISIT_ID,
        file_path: "visits/123/1-photo.jpg",
        file_type: "image/jpeg",
        uploaded_by: "user-1",
        created_at: "2026-01-01T00:00:00Z",
      },
    });

    const onUploadComplete = vi.fn();
    render(
      <AttachmentUpload
        visitId={VISIT_ID}
        onUploadComplete={onUploadComplete}
      />
    );

    const file = createMockFile("photo.jpg", "image/jpeg", 1024);
    selectFiles([file]);

    expect(screen.getByText("1 file ready to upload")).toBeInTheDocument();

    const uploadButton = getUploadButton();
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockUploadAttachment).toHaveBeenCalledWith(
        VISIT_ID,
        "photo.jpg",
        "image/jpeg",
        1024,
        expect.any(ArrayBuffer)
      );
    });

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "1 file uploaded successfully"
      );
      expect(onUploadComplete).toHaveBeenCalled();
    });
  });

  it("shows uploading state while upload is in progress", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolveUpload: (value: any) => void;
    mockUploadAttachment.mockImplementation(
      () => new Promise((resolve) => { resolveUpload = resolve; })
    );

    render(<AttachmentUpload visitId={VISIT_ID} />);

    const file = createMockFile("photo.jpg", "image/jpeg", 1024);
    selectFiles([file]);

    expect(screen.getByText("1 file ready to upload")).toBeInTheDocument();

    const uploadButton = getUploadButton();
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText("Uploading...")).toBeInTheDocument();
    });

    resolveUpload!({ success: true });
  });

  it("shows toast error when upload fails", async () => {
    mockUploadAttachment.mockResolvedValue({
      error: "Server error",
    });

    render(<AttachmentUpload visitId={VISIT_ID} />);

    const file = createMockFile("photo.jpg", "image/jpeg", 1024);
    selectFiles([file]);

    expect(screen.getByText("1 file ready to upload")).toBeInTheDocument();

    const uploadButton = getUploadButton();
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to upload photo.jpg")
      );
    });
  });
});

describe("AttachmentList component", () => {
  const VISIT_ID = "550e8400-e29b-41d4-a716-446655440000";
  const ATTACHMENT_ID = "660e8400-e29b-41d4-a716-446655440001";

  const mockAttachments = [
    {
      id: ATTACHMENT_ID,
      visit_id: VISIT_ID,
      file_path: `visits/${VISIT_ID}/12345-photo.jpg`,
      file_type: "image/jpeg",
      uploaded_by: "user-1",
      created_at: "2026-07-14T10:30:00Z",
    },
    {
      id: "770e8400-e29b-41d4-a716-446655440002",
      visit_id: VISIT_ID,
      file_path: `visits/${VISIT_ID}/12346-report.pdf`,
      file_type: "application/pdf",
      uploaded_by: "user-1",
      created_at: "2026-07-14T11:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows empty state when no attachments exist", () => {
    render(<AttachmentList attachments={[]} />);
    expect(screen.getByText("No attachments yet")).toBeInTheDocument();
    expect(
      screen.getByText("Upload files to attach them to this visit")
    ).toBeInTheDocument();
  });

  it("renders attachment cards with file names", () => {
    render(<AttachmentList attachments={mockAttachments} />);
    expect(screen.getByText("photo.jpg")).toBeInTheDocument();
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
  });

  it("displays file type badges", () => {
    render(<AttachmentList attachments={mockAttachments} />);
    expect(screen.getByText("JPEG")).toBeInTheDocument();
    expect(screen.getByText("PDF")).toBeInTheDocument();
  });

  it("displays formatted dates", () => {
    render(<AttachmentList attachments={mockAttachments} />);
    const dateTexts = screen.getAllByText(/2026/);
    expect(dateTexts.length).toBeGreaterThan(0);
  });

  it("displays upload indicator when uploaded_by is set", () => {
    render(<AttachmentList attachments={mockAttachments} />);
    const uploadedBadges = screen.getAllByText("Uploaded");
    expect(uploadedBadges.length).toBe(2);
  });

  it("has download buttons with correct aria labels", () => {
    render(<AttachmentList attachments={mockAttachments} />);
    expect(
      screen.getByRole("button", { name: /Download photo\.jpg/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Download report\.pdf/ })
    ).toBeInTheDocument();
  });

  it("has delete buttons with correct aria labels", () => {
    render(<AttachmentList attachments={mockAttachments} />);
    expect(
      screen.getByRole("button", { name: /Delete photo\.jpg/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Delete report\.pdf/ })
    ).toBeInTheDocument();
  });

  it("calls getAttachmentDownloadUrl on download click", async () => {
    mockGetAttachmentDownloadUrl.mockResolvedValue({
      url: "https://storage.example.com/signed-url",
    });

    render(<AttachmentList attachments={mockAttachments} />);

    const downloadButton = screen.getByRole("button", {
      name: /Download photo\.jpg/,
    });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockGetAttachmentDownloadUrl).toHaveBeenCalledWith(
        ATTACHMENT_ID
      );
    });
  });

  // Helper to find dialog content rendered in base-ui portal
  function getDialogContent(): HTMLElement | null {
    return document.querySelector('[data-slot="alert-dialog-content"]');
  }

  function getDialogText(text: string): HTMLElement | null {
    const dialog = getDialogContent();
    if (!dialog) return null;
    return dialog.querySelector(`p, span, div`)?.textContent?.includes(text)
      ? (dialog.querySelector("p, span, div") as HTMLElement)
      : null;
  }

  async function waitForDialogOpen() {
    await waitFor(() => {
      const dialog = getDialogContent();
      expect(dialog).not.toBeNull();
    });
  }

  it("shows confirmation dialog on delete click", async () => {
    render(<AttachmentList attachments={mockAttachments} />);

    const deleteButton = screen.getByRole("button", {
      name: /Delete photo\.jpg/,
    });
    fireEvent.click(deleteButton);

    await waitForDialogOpen();

    const dialog = getDialogContent();
    expect(dialog).toBeInTheDocument();
    expect(dialog!.textContent).toContain("Delete attachment");
    expect(dialog!.textContent).toContain(
      "Are you sure you want to delete this file?"
    );
    expect(dialog!.textContent).toContain("Cancel");
    expect(dialog!.textContent).toContain("Delete file");
  });

  it("calls deleteAttachment on confirm delete", async () => {
    mockDeleteAttachment.mockResolvedValue({ success: true });

    const onDelete = vi.fn();
    render(
      <AttachmentList attachments={mockAttachments} onDelete={onDelete} />
    );

    const deleteButton = screen.getByRole("button", {
      name: /Delete photo\.jpg/,
    });
    fireEvent.click(deleteButton);

    await waitForDialogOpen();

    // Click the Delete file button inside the dialog
    const dialog = getDialogContent()!;
    const deleteFileButton = Array.from(dialog.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("Delete file")
    );
    expect(deleteFileButton).toBeDefined();
    fireEvent.click(deleteFileButton!);

    await waitFor(() => {
      expect(mockDeleteAttachment).toHaveBeenCalledWith(
        ATTACHMENT_ID,
        VISIT_ID
      );
      expect(mockToast.success).toHaveBeenCalledWith("Attachment deleted");
      expect(onDelete).toHaveBeenCalledWith(ATTACHMENT_ID);
    });
  });

  it("shows error toast when delete fails", async () => {
    mockDeleteAttachment.mockResolvedValue({ error: "Permission denied" });

    render(<AttachmentList attachments={mockAttachments} />);

    const deleteButton = screen.getByRole("button", {
      name: /Delete photo\.jpg/,
    });
    fireEvent.click(deleteButton);

    await waitForDialogOpen();

    const dialog = getDialogContent()!;
    const deleteFileButton = Array.from(dialog.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("Delete file")
    );
    fireEvent.click(deleteFileButton!);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Permission denied");
    });
  });

  it("shows deleting state on the confirm button", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolveDelete: (value: any) => void;
    mockDeleteAttachment.mockImplementation(
      () => new Promise((resolve) => { resolveDelete = resolve; })
    );

    render(<AttachmentList attachments={mockAttachments} />);

    const deleteButton = screen.getByRole("button", {
      name: /Delete photo\.jpg/,
    });
    fireEvent.click(deleteButton);

    await waitForDialogOpen();

    const dialog = getDialogContent()!;
    const deleteFileButton = Array.from(dialog.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("Delete file")
    );
    fireEvent.click(deleteFileButton!);

    await waitFor(() => {
      expect(dialog.textContent).toContain("Deleting...");
    });

    resolveDelete!({ success: true });

    await waitFor(() => {
      // After delete completes, dialog should close or show "Delete file" again
      const updatedDialog = getDialogContent();
      if (updatedDialog) {
        expect(updatedDialog.textContent).not.toContain("Deleting...");
      }
    });
  });

  it("can cancel delete confirmation", async () => {
    render(<AttachmentList attachments={mockAttachments} />);

    const deleteButton = screen.getByRole("button", {
      name: /Delete photo\.jpg/,
    });
    fireEvent.click(deleteButton);

    await waitForDialogOpen();

    const dialog = getDialogContent()!;
    const cancelButton = Array.from(dialog.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("Cancel")
    );
    expect(cancelButton).toBeDefined();
    fireEvent.click(cancelButton!);

    await waitFor(() => {
      const closedDialog = getDialogContent();
      // Dialog should be closed or have no content
      if (closedDialog) {
        expect(closedDialog.textContent).not.toContain(
          "Are you sure you want to delete this file?"
        );
      }
    });
  });
});

describe("AttachmentsView component", () => {
  const VISIT_ID = "550e8400-e29b-41d4-a716-446655440000";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the page heading", () => {
    render(
      <AttachmentsView visitId={VISIT_ID} initialAttachments={[]} />
    );
    expect(screen.getByText("Attachments")).toBeInTheDocument();
    expect(
      screen.getByText("Upload and manage files for this visit")
    ).toBeInTheDocument();
  });

  it("renders upload section", () => {
    render(
      <AttachmentsView visitId={VISIT_ID} initialAttachments={[]} />
    );
    expect(screen.getByText("Upload file")).toBeInTheDocument();
    expect(
      screen.getByText("Click to upload or drag and drop")
    ).toBeInTheDocument();
  });

  it("renders attached files section", () => {
    render(
      <AttachmentsView visitId={VISIT_ID} initialAttachments={[]} />
    );
    expect(screen.getByText("Attached files")).toBeInTheDocument();
  });

  it("shows empty state when no initial attachments", () => {
    render(
      <AttachmentsView visitId={VISIT_ID} initialAttachments={[]} />
    );
    expect(screen.getByText("No attachments yet")).toBeInTheDocument();
  });

  it("shows attachment count badge when attachments exist", () => {
    const attachments = [
      {
        id: "1",
        visit_id: VISIT_ID,
        file_path: "visits/123/1-a.jpg",
        file_type: "image/jpeg",
        uploaded_by: "user-1",
        created_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "2",
        visit_id: VISIT_ID,
        file_path: "visits/123/2-b.pdf",
        file_type: "application/pdf",
        uploaded_by: "user-1",
        created_at: "2026-01-01T00:00:00Z",
      },
    ];

    render(
      <AttachmentsView visitId={VISIT_ID} initialAttachments={attachments} />
    );
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders initial attachments in the list", () => {
    const attachments = [
      {
        id: "1",
        visit_id: VISIT_ID,
        file_path: "visits/123/1-document.pdf",
        file_type: "application/pdf",
        uploaded_by: "user-1",
        created_at: "2026-01-01T00:00:00Z",
      },
    ];

    render(
      <AttachmentsView visitId={VISIT_ID} initialAttachments={attachments} />
    );
    expect(screen.getByText("document.pdf")).toBeInTheDocument();
    expect(screen.getByText("PDF")).toBeInTheDocument();
  });
});
