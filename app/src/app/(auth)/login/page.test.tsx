import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockLogin = vi.fn()

vi.mock("./actions", () => ({
  login: (...args: unknown[]) => mockLogin(...args),
}))

vi.mock("next/dist/client/components/redirect-error", () => ({
  isRedirectError: vi.fn(() => false),
}))

// ---------------------------------------------------------------------------
// Import component AFTER mocks
// ---------------------------------------------------------------------------

import LoginPage from "./page"

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders the welcome heading", () => {
      render(<LoginPage />)
      expect(screen.getByText("Welcome back")).toBeInTheDocument()
    })

    it("renders email and password fields", () => {
      render(<LoginPage />)
      expect(screen.getByLabelText("Email")).toBeInTheDocument()
      expect(screen.getByLabelText("Password")).toBeInTheDocument()
    })

    it("renders the sign in button", () => {
      render(<LoginPage />)
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
    })

    it("renders demo accounts section", () => {
      render(<LoginPage />)
      expect(screen.getByText("Demo Accounts")).toBeInTheDocument()
      expect(screen.getByText("Admin")).toBeInTheDocument()
      expect(screen.getByText("Doctor")).toBeInTheDocument()
      expect(screen.getByText("Nurse")).toBeInTheDocument()
      expect(screen.getByText("Receptionist")).toBeInTheDocument()
    })

    it("renders the Dr.Note branding", () => {
      render(<LoginPage />)
      expect(screen.getAllByText("Dr.Note").length).toBeGreaterThanOrEqual(1)
    })

    it("renders the tagline", () => {
      render(<LoginPage />)
      expect(screen.getByText(/Clinical notes/)).toBeInTheDocument()
    })
  })

  describe("Validation", () => {
    it("shows error when submitting empty form", async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      await user.click(screen.getByRole("button", { name: /sign in/i }))

      expect(await screen.findByText("Email is required")).toBeInTheDocument()
      expect(screen.getByText("Password is required")).toBeInTheDocument()
      expect(mockLogin).not.toHaveBeenCalled()
    })

    it("shows error for invalid email format", async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      await user.type(screen.getByLabelText("Email"), "not-an-email")
      await user.click(screen.getByRole("button", { name: /sign in/i }))

      // Zod email validation shows error for invalid format
      const error = await screen.findByText(/email/i)
      expect(error).toBeInTheDocument()
      expect(mockLogin).not.toHaveBeenCalled()
    })

    it("shows error for password shorter than 8 characters", async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      await user.type(screen.getByLabelText("Email"), "test@example.com")
      await user.type(screen.getByLabelText("Password"), "short")
      await user.click(screen.getByRole("button", { name: /sign in/i }))

      expect(await screen.findByText("Password must be at least 8 characters")).toBeInTheDocument()
      expect(mockLogin).not.toHaveBeenCalled()
    })
  })

  describe("Form submission", () => {
    it("calls login action with valid credentials", async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({ error: undefined })
      render(<LoginPage />)

      await user.type(screen.getByLabelText("Email"), "nurse@drnote.com")
      await user.type(screen.getByLabelText("Password"), "testpass123")
      await user.click(screen.getByRole("button", { name: /sign in/i }))

      expect(mockLogin).toHaveBeenCalledWith({
        email: "nurse@drnote.com",
        password: "testpass123",
      })
    })

    it("displays error message when login fails", async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({ error: "Wrong email or password. Please try again." })
      render(<LoginPage />)

      await user.type(screen.getByLabelText("Email"), "nurse@drnote.com")
      await user.type(screen.getByLabelText("Password"), "wrongpass123")
      await user.click(screen.getByRole("button", { name: /sign in/i }))

      expect(await screen.findByText("Wrong email or password. Please try again.")).toBeInTheDocument()
    })

    it("shows loading state during submission", async () => {
      const user = userEvent.setup()
      // Never resolves — keeps loading state
      mockLogin.mockReturnValue(new Promise(() => {}))
      render(<LoginPage />)

      await user.type(screen.getByLabelText("Email"), "nurse@drnote.com")
      await user.type(screen.getByLabelText("Password"), "testpass123")
      await user.click(screen.getByRole("button", { name: /sign in/i }))

      expect(await screen.findByText("Signing in...")).toBeInTheDocument()
    })

    it("disables form fields while loading", async () => {
      const user = userEvent.setup()
      mockLogin.mockReturnValue(new Promise(() => {}))
      render(<LoginPage />)

      await user.type(screen.getByLabelText("Email"), "nurse@drnote.com")
      await user.type(screen.getByLabelText("Password"), "testpass123")
      await user.click(screen.getByRole("button", { name: /sign in/i }))

      await screen.findByText("Signing in...")
      expect(screen.getByLabelText("Email")).toBeDisabled()
      expect(screen.getByLabelText("Password")).toBeDisabled()
      expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled()
    })

    it("displays generic error on unexpected exception", async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValue(new Error("Network error"))
      render(<LoginPage />)

      await user.type(screen.getByLabelText("Email"), "nurse@drnote.com")
      await user.type(screen.getByLabelText("Password"), "testpass123")
      await user.click(screen.getByRole("button", { name: /sign in/i }))

      expect(await screen.findByText("Something went wrong. Please try again.")).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("has associated labels for email and password inputs", () => {
      render(<LoginPage />)
      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")
      expect(emailInput).toBeInTheDocument()
      expect(passwordInput).toBeInTheDocument()
      expect(emailInput).toHaveAttribute("type", "email")
      expect(passwordInput).toHaveAttribute("type", "password")
    })

    it("has placeholder text for inputs", () => {
      render(<LoginPage />)
      expect(screen.getByPlaceholderText("name@hospital.com")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument()
    })
  })
})
