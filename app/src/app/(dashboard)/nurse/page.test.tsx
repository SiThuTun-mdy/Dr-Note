import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockGetNurseDashboardStats = vi.fn()

vi.mock("./actions", () => ({
  getNurseDashboardStats: () => mockGetNurseDashboardStats(),
}))

vi.mock("./nurse-queue-table", () => ({
  NurseQueueTable: ({ data }: { data: unknown[] }) => (
    <div data-testid="nurse-queue-table">
      <span>{data.length} patients</span>
    </div>
  ),
}))

// ---------------------------------------------------------------------------
// Import AFTER mocks
// ---------------------------------------------------------------------------

import NursePage from "./page"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeStats(overrides?: Partial<Awaited<ReturnType<typeof mockGetNurseDashboardStats>>>) {
  return {
    awaitingScreening: 3,
    inProgress: 2,
    completedToday: 5,
    screeningQueue: [
      {
        id: "v-1",
        patientName: "Alice",
        status: "waiting",
        visitType: "general",
        chiefComplaint: "Headache",
        visitDate: "2026-07-14",
        createdAt: "2026-07-14T08:00:00Z",
      },
    ],
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("NursePage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Stats cards", () => {
    it("renders awaiting screening count", async () => {
      mockGetNurseDashboardStats.mockResolvedValue(makeStats())
      render(await NursePage())

      expect(screen.getByText("Awaiting screening")).toBeInTheDocument()
      expect(screen.getByText("3")).toBeInTheDocument()
    })

    it("renders in progress count", async () => {
      mockGetNurseDashboardStats.mockResolvedValue(makeStats())
      render(await NursePage())

      expect(screen.getByText("In progress")).toBeInTheDocument()
      expect(screen.getByText("2")).toBeInTheDocument()
    })

    it("renders completed today count", async () => {
      mockGetNurseDashboardStats.mockResolvedValue(makeStats())
      render(await NursePage())

      expect(screen.getByText("Completed today")).toBeInTheDocument()
      expect(screen.getByText("5")).toBeInTheDocument()
    })

    it("renders zero values correctly", async () => {
      mockGetNurseDashboardStats.mockResolvedValue(makeStats({
        awaitingScreening: 0,
        inProgress: 0,
        completedToday: 0,
      }))
      render(await NursePage())

      const zeros = screen.getAllByText("0")
      expect(zeros.length).toBe(3)
    })
  })

  describe("Screening queue", () => {
    it("renders the screening queue heading", async () => {
      mockGetNurseDashboardStats.mockResolvedValue(makeStats())
      render(await NursePage())

      expect(screen.getByText("Screening queue")).toBeInTheDocument()
    })

    it("passes queue data to NurseQueueTable", async () => {
      const queue = [
        { id: "v-1", patientName: "Alice", status: "waiting", visitType: "general", chiefComplaint: "Headache", visitDate: "2026-07-14", createdAt: "2026-07-14T08:00:00Z" },
        { id: "v-2", patientName: "Bob", status: "waiting", visitType: "follow_up", chiefComplaint: "Fever", visitDate: "2026-07-14", createdAt: "2026-07-14T09:00:00Z" },
      ]
      mockGetNurseDashboardStats.mockResolvedValue(makeStats({ screeningQueue: queue }))
      render(await NursePage())

      expect(screen.getByTestId("nurse-queue-table")).toBeInTheDocument()
      expect(screen.getByText("2 patients")).toBeInTheDocument()
    })

    it("renders empty queue message", async () => {
      mockGetNurseDashboardStats.mockResolvedValue(makeStats({ screeningQueue: [] }))
      render(await NursePage())

      expect(screen.getByText("0 patients")).toBeInTheDocument()
    })
  })

  describe("Layout", () => {
    it("renders three stat cards in a grid", async () => {
      mockGetNurseDashboardStats.mockResolvedValue(makeStats())
      const { container } = render(await NursePage())

      const grid = container.querySelector(".grid")
      expect(grid).toBeInTheDocument()
      expect(grid?.children.length).toBe(3)
    })
  })
})
