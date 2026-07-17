import { vi } from "vitest";

// Hoisted mock functions — available in vi.mock factory
const { mockFrom, mockSelect, mockInsert, mockDelete, mockUpdate, mockEq, mockSingle, mockLimit, mockOrder, mockOr, mockRange, mockIs, mockGetUser, mockUpload, mockRemove, mockCreateSignedUrl, mockRpc } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockSelect: vi.fn(),
  mockInsert: vi.fn(),
  mockDelete: vi.fn(),
  mockUpdate: vi.fn(),
  mockEq: vi.fn(),
  mockSingle: vi.fn(),
  mockLimit: vi.fn(),
  mockOrder: vi.fn(),
  mockOr: vi.fn(),
  mockRange: vi.fn(),
  mockIs: vi.fn(),
  mockGetUser: vi.fn(),
  mockUpload: vi.fn(),
  mockRemove: vi.fn(),
  mockCreateSignedUrl: vi.fn(),
  mockRpc: vi.fn(),
}));

// Build chain that returns itself at each step
const mockChain = {
  select: mockSelect,
  insert: mockInsert,
  delete: mockDelete,
  update: mockUpdate,
  eq: mockEq,
  single: mockSingle,
  limit: mockLimit,
  order: mockOrder,
  or: mockOr,
  range: mockRange,
  is: mockIs,
};

// Each method returns mockChain to allow chaining
mockSelect.mockReturnValue(mockChain);
mockInsert.mockReturnValue(mockChain);
mockDelete.mockReturnValue(mockChain);
mockUpdate.mockReturnValue(mockChain);
mockEq.mockReturnValue(mockChain);
mockSingle.mockResolvedValue({ data: null, error: null });
mockLimit.mockResolvedValue({ data: [], error: null });
mockOrder.mockReturnValue(mockChain);
mockOr.mockReturnValue(mockChain);
mockRange.mockReturnValue(mockChain);
mockIs.mockReturnValue(mockChain);

// insert() returns a chain with select() → single()
const mockInsertChain = {
  select: vi.fn().mockReturnValue({
    single: mockSingle,
  }),
};
mockInsert.mockReturnValue(mockInsertChain);

const mockStorageFrom = vi.fn(() => ({
  upload: mockUpload,
  remove: mockRemove,
  createSignedUrl: mockCreateSignedUrl,
}));

const mockClient = {
  from: mockFrom,
  auth: {
    getUser: mockGetUser,
  },
  storage: {
    from: mockStorageFrom,
  },
  rpc: mockRpc,
};

// Mock the Supabase server client module
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => mockClient),
}));

/**
 * Resets all mocks to their default state.
 * Call this in beforeEach() for each test.
 */
export function resetSupabaseMocks() {
  vi.clearAllMocks();
  // Re-setup chain returns after clearAllMocks
  mockSelect.mockReturnValue(mockChain);
  mockInsert.mockReturnValue(mockChain);
  mockDelete.mockReturnValue(mockChain);
  mockUpdate.mockReturnValue(mockChain);
  mockEq.mockReturnValue(mockChain);
  mockSingle.mockResolvedValue({ data: null, error: null });
  mockLimit.mockResolvedValue({ data: [], error: null });
  mockOrder.mockReturnValue(mockChain);
  mockOr.mockReturnValue(mockChain);
  mockRange.mockReturnValue(mockChain);
  mockIs.mockReturnValue(mockChain);
  mockInsertChain.select.mockReturnValue({ single: mockSingle });
  mockInsert.mockReturnValue(mockInsertChain);
  mockFrom.mockReturnValue(mockChain);
  mockGetUser.mockResolvedValue({
    data: { user: { id: "user-123" } },
    error: null,
  });
  mockUpload.mockResolvedValue({ error: null });
  mockRemove.mockResolvedValue({ error: null });
  mockCreateSignedUrl.mockResolvedValue({
    data: { signedUrl: "https://example.com/signed-url" },
    error: null,
  });
  mockRpc.mockResolvedValue({ data: false, error: null });
}

/**
 * Exported mock references for direct access in tests.
 */
export const mocks = {
  mockFrom,
  mockSelect,
  mockInsert,
  mockDelete,
  mockUpdate,
  mockEq,
  mockSingle,
  mockLimit,
  mockOrder,
  mockOr,
  mockRange,
  mockIs,
  mockGetUser,
  mockUpload,
  mockRemove,
  mockCreateSignedUrl,
  mockStorageFrom,
  mockRpc,
};
