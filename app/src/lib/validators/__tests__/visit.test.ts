import { describe, it, expect } from "vitest"
import { visitCreationSchema } from "@/lib/validators/visit"

describe("visitCreationSchema", () => {
  const validInput = {
    patientId: "550e8400-e29b-41d4-a716-446655440000",
    visitType: "consultation" as const,
    chiefComplaint: "Persistent headache for 3 days",
    doctorId: null,
  }

  describe("valid inputs", () => {
    it("accepts valid input with all required fields", () => {
      const result = visitCreationSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it("accepts valid input with a doctor assigned", () => {
      const result = visitCreationSchema.safeParse({
        ...validInput,
        doctorId: "660e8400-e29b-41d4-a716-446655440001",
      })
      expect(result.success).toBe(true)
    })

    it("accepts null doctorId (optional)", () => {
      const result = visitCreationSchema.safeParse({
        ...validInput,
        doctorId: null,
      })
      expect(result.success).toBe(true)
    })

    it("accepts undefined doctorId (optional)", () => {
      const result = visitCreationSchema.safeParse({
        patientId: validInput.patientId,
        visitType: validInput.visitType,
        chiefComplaint: validInput.chiefComplaint,
      })
      expect(result.success).toBe(true)
    })

    it("accepts all valid visit types", () => {
      const types = [
        "consultation",
        "follow_up",
        "emergency",
        "screening",
      ] as const
      for (const visitType of types) {
        const result = visitCreationSchema.safeParse({
          ...validInput,
          visitType,
        })
        expect(result.success).toBe(true)
      }
    })

    it("accepts chief complaint at max length (500 chars)", () => {
      const result = visitCreationSchema.safeParse({
        ...validInput,
        chiefComplaint: "a".repeat(500),
      })
      expect(result.success).toBe(true)
    })
  })

  describe("invalid patientId", () => {
    it("rejects empty patientId", () => {
      const result = visitCreationSchema.safeParse({
        ...validInput,
        patientId: "",
      })
      expect(result.success).toBe(false)
    })

    it("rejects non-UUID patientId", () => {
      const result = visitCreationSchema.safeParse({
        ...validInput,
        patientId: "not-a-uuid",
      })
      expect(result.success).toBe(false)
    })

    it("rejects missing patientId", () => {
      const { patientId: _, ...rest } = validInput
      const result = visitCreationSchema.safeParse(rest)
      expect(result.success).toBe(false)
    })
  })

  describe("invalid visitType", () => {
    it("rejects empty visitType", () => {
      const result = visitCreationSchema.safeParse({
        ...validInput,
        visitType: "",
      })
      expect(result.success).toBe(false)
    })

    it("rejects invalid visitType value", () => {
      const result = visitCreationSchema.safeParse({
        ...validInput,
        visitType: "invalid_type",
      })
      expect(result.success).toBe(false)
    })

    it("rejects missing visitType", () => {
      const { visitType: _, ...rest } = validInput
      const result = visitCreationSchema.safeParse(rest)
      expect(result.success).toBe(false)
    })
  })

  describe("invalid chiefComplaint", () => {
    it("rejects empty chiefComplaint", () => {
      const result = visitCreationSchema.safeParse({
        ...validInput,
        chiefComplaint: "",
      })
      expect(result.success).toBe(false)
    })

    it("rejects chiefComplaint exceeding 500 characters", () => {
      const result = visitCreationSchema.safeParse({
        ...validInput,
        chiefComplaint: "a".repeat(501),
      })
      expect(result.success).toBe(false)
    })

    it("rejects missing chiefComplaint", () => {
      const { chiefComplaint: _, ...rest } = validInput
      const result = visitCreationSchema.safeParse(rest)
      expect(result.success).toBe(false)
    })
  })

  describe("invalid doctorId", () => {
    it("rejects non-UUID doctorId", () => {
      const result = visitCreationSchema.safeParse({
        ...validInput,
        doctorId: "not-a-uuid",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("completely empty input", () => {
    it("rejects empty object", () => {
      const result = visitCreationSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })
})
