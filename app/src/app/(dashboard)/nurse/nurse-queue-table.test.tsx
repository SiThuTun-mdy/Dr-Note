import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("next/navigation", () => ({
  useParams: vi.fn().mockReturnValue({ id: "visit-123" }),
  useRouter: vi.fn().mockReturnValue({ push: vi.fn() }),
}))

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// ---------------------------------------------------------------------------
// Import AFTER mocks
// ---------------------------------------------------------------------------

import { NurseQueueTable } from "./nurse-queue-table"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeVisit(overrides?: Partial<Parameters<typeof NurseQueueTable>[0]["data"][0]>) {
  return {
    id: "v-1",
    patientName: "Alice Johnson",
    status: "waiting",
    visitType: "general",
    chiefComplaint: "Headache for 3 days",
    visitDate: "2026-07-14",
    createdAt: new Date(Date.now() - 30 * 60_000).toISOString(), // 30 min ago
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("NurseQueueTable", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-07-14T10:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("Row rendering", () => {
    it("renders patient names", () => {
      render(<NurseQueueTable data={[makeVisit()]} />)
      expect(screen.getByText("Alice Johnson")).toBeInTheDocument()
    })

    it("renders visit type", () => {
      render(<NurseQueueTable data={[makeVisit()]} />)
      expect(screen.getByText("general")).toBeInTheDocument()
    })

    it("renders dash for null visit type", () => {
      render(<NurseQueueTable data={[makeVisit({ visitType: null })]} />)
      expect(screen.getByText("—")).toBeInTheDocument()
    })

    it("renders status badge", () => {
      render(<NurseQueueTable data={[makeVisit({ status: "waiting" })]} />)
      expect(screen.getByText("Waiting")).toBeInTheDocument()
    })

    it("renders different status badges", () => {
      render(<NurseQueueTable data={[makeVisit({ status: "screening" })]} />)
      expect(screen.getByText("Screening")).toBeInTheDocument()
    })

    it("renders chief complaint", () => {
      render(<NurseQueueTable data={[makeVisit()]} />)
      expect(screen.getByText("Headache for 3 days")).toBeInTheDocument()
    })

    it("renders dash for null chief complaint", () => {
      render(<NurseQueueTable data={[makeVisit({ chiefComplaint: null })]} />)
      const dashes = screen.getAllByText("—")
      expect(dashes.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe("Wait time calculation", () => {
    it("displays wait time in minutes for under 60 minutes", () => {
      const visit = makeVisit({
        createdAt: new Date("2026-07-14T09:30:00Z").toISOString(), // 30 min ago
      })
      render(<NurseQueueTable data={[visit]} />)
      expect(screen.getByText("30 min")).toBeInTheDocument()
    })

    it("displays wait time in hours and minutes for over 60 minutes", () => {
      const visit = makeVisit({
        createdAt: new Date("2026-07-14T07:45:00Z").toISOString(), // 2h 15m ago
      })
      render(<NurseQueueTable data={[visit]} />)
      expect(screen.getByText("2h 15m")).toBeInTheDocument()
    })

    it("displays 0 min for very recent visits", () => {
      const visit = makeVisit({
        createdAt: new Date("2026-07-14T09:59:00Z").toISOString(), // 1 min ago
      })
      render(<NurseQueueTable data={[visit]} />)
      expect(screen.getByText("1 min")).toBeInTheDocument()
    })
  })

  describe("Links", () => {
    it("links patient name to screening page", () => {
      const visit = makeVisit({ id: "visit-abc" })
      render(<NurseQueueTable data={[visit]} />)

      const link = screen.getByText("Alice Johnson")
      expect(link).toHaveAttribute("href", "/nurse/visits/visit-abc/screening")
    })
  })

  describe("Empty state", () => {
    it("shows empty message when no data", () => {
      render(<NurseQueueTable data={[]} />)
      expect(screen.getByText("No patients waiting for screening")).toBeInTheDocument()
    })
  })

  describe("Multiple rows", () => {
    it("renders multiple patients", () => {
      const visits = [
        makeVisit({ id: "v-1", patientName: "Alice" }),
        makeVisit({ id: "v-2", patientName: "Bob" }),
        makeVisit({ id: "v-3", patientName: "Carol" }),
      ]
      render(<NurseQueueTable data={visits} />)

      expect(screen.getByText("Alice")).toBeInTheDocument()
      expect(screen.getByText("Bob")).toBeInTheDocument()
      expect(screen.getByText("Carol")).toBeInTheDocument()
    })
  })

  describe("Search", () => {
    // Note: search tests use real timers to avoid conflicts with
    // the component's internal setInterval and userEvent.type.
    it("filters patients by name", async () => {
      vi.useRealTimers()
      const user = userEvent.setup()
      const visits = [
        makeVisit({ id: "v-1", patientName: "Alice Johnson" }),
        makeVisit({ id: "v-2", patientName: "Bob Smith" }),
      ]
      render(<NurseQueueTable data={visits} />)

      const searchInput = screen.getByPlaceholderText("Search by patient or complaint...")
      await user.type(searchInput, "Alice")

      expect(screen.getByText("Alice Johnson")).toBeInTheDocument()
      expect(screen.queryByText("Bob Smith")).not.toBeInTheDocument()
    })

    it("filters patients by chief complaint", async () => {
      vi.useRealTimers()
      const user = userEvent.setup()
      const visits = [
        makeVisit({ id: "v-1", patientName: "Alice", chiefComplaint: "Headache" }),
        makeVisit({ id: "v-2", patientName: "Bob", chiefComplaint: "Fever" }),
      ]
      render(<NurseQueueTable data={visits} />)

      const searchInput = screen.getByPlaceholderText("Search by patient or complaint...")
      await user.type(searchInput, "Fever")

      expect(screen.queryByText("Alice")).not.toBeInTheDocument()
      expect(screen.getByText("Bob")).toBeInTheDocument()
    })
  })
})
