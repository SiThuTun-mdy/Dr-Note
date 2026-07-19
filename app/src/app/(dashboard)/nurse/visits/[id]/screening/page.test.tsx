import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// ---------------------------------------------------------------------------
// Mocks — use vi.hoisted so variables are available in hoisted vi.mock calls
// ---------------------------------------------------------------------------

const { mockPush, mockCreateScreening } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockCreateScreening: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useParams: vi.fn().mockReturnValue({ id: "visit-123" }),
  useRouter: vi.fn().mockReturnValue({ push: mockPush }),
}))

vi.mock("./actions", () => ({
  createScreening: (...args: unknown[]) => mockCreateScreening(...args),
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// ---------------------------------------------------------------------------
// Import AFTER mocks
// ---------------------------------------------------------------------------

import ScreeningPage from "./page"
import { toast } from "sonner"

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ScreeningPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateScreening.mockResolvedValue({ success: true, doctorAssigned: true })
  })

  describe("Page layout", () => {
    it("renders the screening vitals heading", () => {
      render(<ScreeningPage />)
      expect(screen.getByText("Screening vitals")).toBeInTheDocument()
    })

    it("renders the subtitle", () => {
      render(<ScreeningPage />)
      expect(screen.getByText("Record patient vitals before doctor consultation.")).toBeInTheDocument()
    })

    it("renders the vital signs card", () => {
      render(<ScreeningPage />)
      expect(screen.getByText("Vital signs")).toBeInTheDocument()
    })

    it("renders the back to queue button", () => {
      render(<ScreeningPage />)
      expect(screen.getByText("Back to queue")).toBeInTheDocument()
    })

    it("renders the save screening button", () => {
      render(<ScreeningPage />)
      expect(screen.getByRole("button", { name: /save screening/i })).toBeInTheDocument()
    })
  })

  describe("Vital sign fields", () => {
    it("renders all 7 vital sign fields with correct labels", () => {
      render(<ScreeningPage />)

      expect(screen.getByText("Height")).toBeInTheDocument()
      expect(screen.getByText("Weight")).toBeInTheDocument()
      expect(screen.getByText("BP systolic")).toBeInTheDocument()
      expect(screen.getByText("BP diastolic")).toBeInTheDocument()
      expect(screen.getByText("Heart rate")).toBeInTheDocument()
      expect(screen.getByText("Temperature")).toBeInTheDocument()
      expect(screen.getByText("O₂ saturation")).toBeInTheDocument()
    })

    it("renders unit suffixes", () => {
      render(<ScreeningPage />)

      expect(screen.getByText("cm")).toBeInTheDocument()
      expect(screen.getByText("kg")).toBeInTheDocument()
      expect(screen.getAllByText("mmHg").length).toBe(2) // systolic + diastolic
      expect(screen.getByText("bpm")).toBeInTheDocument()
      expect(screen.getByText("°C")).toBeInTheDocument()
      expect(screen.getByText("%")).toBeInTheDocument()
    })

    it("renders number inputs with correct placeholders", () => {
      render(<ScreeningPage />)

      expect(screen.getByPlaceholderText("170")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("65")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("120")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("80")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("72")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("36.5")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("98")).toBeInTheDocument()
    })

    it("renders all inputs as number type", () => {
      render(<ScreeningPage />)
      const numberInputs = screen.getAllByRole("spinbutton")
      expect(numberInputs.length).toBe(7)
    })
  })

  describe("BMI calculation", () => {
    it("does not show BMI initially", () => {
      render(<ScreeningPage />)
      expect(screen.queryByText("BMI (calculated)")).not.toBeInTheDocument()
    })

    it("calculates BMI when height and weight are entered", async () => {
      const user = userEvent.setup()
      render(<ScreeningPage />)

      await user.type(screen.getByPlaceholderText("170"), "175")
      await user.type(screen.getByPlaceholderText("65"), "70")

      expect(screen.getByText("BMI (calculated)")).toBeInTheDocument()
      // BMI = 70 / (1.75^2) = 22.9
      expect(screen.getByText("22.9")).toBeInTheDocument()
    })

    it("hides BMI when height is cleared", async () => {
      const user = userEvent.setup()
      render(<ScreeningPage />)

      const heightInput = screen.getByPlaceholderText("170")
      await user.type(heightInput, "175")
      await user.type(screen.getByPlaceholderText("65"), "70")

      expect(screen.getByText("BMI (calculated)")).toBeInTheDocument()

      await user.clear(heightInput)

      expect(screen.queryByText("BMI (calculated)")).not.toBeInTheDocument()
    })
  })

  describe("Navigation", () => {
    it("navigates to queue when back button is clicked", async () => {
      const user = userEvent.setup()
      render(<ScreeningPage />)

      await user.click(screen.getByText("Back to queue"))
      expect(mockPush).toHaveBeenCalledWith("/queue")
    })
  })

  describe("Form submission", () => {
    it("calls createScreening with form values on submit", async () => {
      const user = userEvent.setup()
      render(<ScreeningPage />)

      await user.type(screen.getByPlaceholderText("170"), "175")
      await user.type(screen.getByPlaceholderText("65"), "70")
      await user.type(screen.getByPlaceholderText("120"), "120")
      await user.type(screen.getByPlaceholderText("80"), "80")
      await user.type(screen.getByPlaceholderText("72"), "72")
      await user.type(screen.getByPlaceholderText("36.5"), "36.5")
      await user.type(screen.getByPlaceholderText("98"), "98")

      await user.click(screen.getByRole("button", { name: /save screening/i }))

      expect(mockCreateScreening).toHaveBeenCalledWith("visit-123", {
        height_cm: 175,
        weight_kg: 70,
        bp_systolic: 120,
        bp_diastolic: 80,
        heart_rate: 72,
        temperature_c: 36.5,
        oxygen_saturation: 98,
      })
    })

    it("shows success toast and navigates on successful submission", async () => {
      const user = userEvent.setup()
      render(<ScreeningPage />)

      await user.type(screen.getByPlaceholderText("170"), "175")
      await user.type(screen.getByPlaceholderText("65"), "70")
      await user.type(screen.getByPlaceholderText("120"), "120")
      await user.type(screen.getByPlaceholderText("80"), "80")
      await user.type(screen.getByPlaceholderText("72"), "72")
      await user.type(screen.getByPlaceholderText("36.5"), "36.5")
      await user.type(screen.getByPlaceholderText("98"), "98")

      await user.click(screen.getByRole("button", { name: /save screening/i }))

      expect(toast.success).toHaveBeenCalledWith("Screening recorded", {
        description: "Visit advanced to doctor consultation.",
      })
      expect(mockPush).toHaveBeenCalledWith("/screening")
    })

    it("shows error toast when submission fails", async () => {
      mockCreateScreening.mockResolvedValue({ success: false, error: "Visit not found" })
      const user = userEvent.setup()
      render(<ScreeningPage />)

      await user.type(screen.getByPlaceholderText("170"), "175")
      await user.type(screen.getByPlaceholderText("65"), "70")
      await user.type(screen.getByPlaceholderText("120"), "120")
      await user.type(screen.getByPlaceholderText("80"), "80")
      await user.type(screen.getByPlaceholderText("72"), "72")
      await user.type(screen.getByPlaceholderText("36.5"), "36.5")
      await user.type(screen.getByPlaceholderText("98"), "98")

      await user.click(screen.getByRole("button", { name: /save screening/i }))

      expect(toast.error).toHaveBeenCalledWith("Visit not found")
    })

    it("shows generic error toast on unexpected exception", async () => {
      mockCreateScreening.mockRejectedValue(new Error("Network error"))
      const user = userEvent.setup()
      render(<ScreeningPage />)

      await user.type(screen.getByPlaceholderText("170"), "175")
      await user.type(screen.getByPlaceholderText("65"), "70")
      await user.type(screen.getByPlaceholderText("120"), "120")
      await user.type(screen.getByPlaceholderText("80"), "80")
      await user.type(screen.getByPlaceholderText("72"), "72")
      await user.type(screen.getByPlaceholderText("36.5"), "36.5")
      await user.type(screen.getByPlaceholderText("98"), "98")

      await user.click(screen.getByRole("button", { name: /save screening/i }))

      expect(toast.error).toHaveBeenCalledWith("An unexpected error occurred. Please try again.")
    })

    it("shows loading state while submitting", async () => {
      mockCreateScreening.mockReturnValue(new Promise(() => {}))
      const user = userEvent.setup()
      render(<ScreeningPage />)

      await user.type(screen.getByPlaceholderText("170"), "175")
      await user.type(screen.getByPlaceholderText("65"), "70")
      await user.type(screen.getByPlaceholderText("120"), "120")
      await user.type(screen.getByPlaceholderText("80"), "80")
      await user.type(screen.getByPlaceholderText("72"), "72")
      await user.type(screen.getByPlaceholderText("36.5"), "36.5")
      await user.type(screen.getByPlaceholderText("98"), "98")

      await user.click(screen.getByRole("button", { name: /save screening/i }))

      expect(await screen.findByText("Saving…")).toBeInTheDocument()
    })
  })
})
