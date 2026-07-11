import { describe, it, expect } from "vitest"
import { loginSchema } from "@/lib/validators/auth"

describe("loginSchema", () => {
  describe("valid inputs", () => {
    it("accepts valid email and password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      })
      expect(result.success).toBe(true)
    })

    it("accepts email with subdomains", () => {
      const result = loginSchema.safeParse({
        email: "user@mail.example.com",
        password: "password123",
      })
      expect(result.success).toBe(true)
    })
  })

  describe("invalid emails", () => {
    it("rejects empty email", () => {
      const result = loginSchema.safeParse({
        email: "",
        password: "password123",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Email is required")
      }
    })

    it("rejects invalid email format", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Please enter a valid email address")
      }
    })

    it("rejects email without @", () => {
      const result = loginSchema.safeParse({
        email: "userexample.com",
        password: "password123",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("invalid passwords", () => {
    it("rejects empty password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password is required")
      }
    })

    it("rejects password shorter than 8 characters", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "short",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password must be at least 8 characters")
      }
    })

    it("accepts password with exactly 8 characters", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "12345678",
      })
      expect(result.success).toBe(true)
    })
  })

  describe("missing fields", () => {
    it("rejects missing email", () => {
      const result = loginSchema.safeParse({
        password: "password123",
      })
      expect(result.success).toBe(false)
    })

    it("rejects missing password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
      })
      expect(result.success).toBe(false)
    })
  })
})
