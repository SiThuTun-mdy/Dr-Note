import { describe, it, expect } from "vitest"
import { patientProfileUpdateSchema, patientRegistrationSchema, emergencyContactSchema } from "./patient"

const validUpdate = {
  name: "Jane Doe",
  phone: "0912345678",
  dob: "1990-01-01",
  gender: "female" as const,
  nrc: "12/ABC(N)123456",
  religion: "Buddhist",
  ethnicity: "Bamar",
  address: "Yangon",
}

describe("patientProfileUpdateSchema", () => {
  it("accepts fully populated valid input", () => {
    const result = patientProfileUpdateSchema.safeParse(validUpdate)
    expect(result.success).toBe(true)
  })

  it("accepts missing optional fields (omitted entirely)", () => {
    const result = patientProfileUpdateSchema.safeParse({ name: "Jane Doe" })
    expect(result.success).toBe(true)
  })

  it("accepts empty-string optional fields (dob/gender/nrc/etc.)", () => {
    const result = patientProfileUpdateSchema.safeParse({
      name: "Jane Doe",
      phone: "",
      dob: "",
      gender: "",
      nrc: "",
      religion: "",
      ethnicity: "",
      address: "",
    })
    expect(result.success).toBe(true)
  })

  it("rejects an invalid dob format", () => {
    const result = patientProfileUpdateSchema.safeParse({ ...validUpdate, dob: "01/01/1990" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "dob")).toBe(true)
    }
  })

  it("rejects a future dob", () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    const iso = futureDate.toISOString().slice(0, 10)
    const result = patientProfileUpdateSchema.safeParse({ ...validUpdate, dob: iso })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "dob")).toBe(true)
    }
  })

  it("rejects an invalid gender", () => {
    const result = patientProfileUpdateSchema.safeParse({ ...validUpdate, gender: "unknown" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "gender")).toBe(true)
    }
  })

  it("rejects a missing required name", () => {
    const result = patientProfileUpdateSchema.safeParse({ ...validUpdate, name: "" })
    expect(result.success).toBe(false)
  })

  it("does not accept an email field (omitted from update schema)", () => {
    const parsed = patientProfileUpdateSchema.parse(validUpdate)
    expect((parsed as Record<string, unknown>).email).toBeUndefined()
  })
})

describe("patientRegistrationSchema", () => {
  it("accepts valid registration input", () => {
    const result = patientRegistrationSchema.safeParse({
      ...validUpdate,
      email: "jane@example.com",
    })
    expect(result.success).toBe(true)
  })

  it("requires dob (unlike the update schema)", () => {
    const result = patientRegistrationSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      gender: "female",
      dob: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects an invalid email", () => {
    const result = patientRegistrationSchema.safeParse({
      ...validUpdate,
      email: "not-an-email",
    })
    expect(result.success).toBe(false)
  })
})

describe("emergencyContactSchema", () => {
  it("accepts valid input with only required name", () => {
    const result = emergencyContactSchema.safeParse({ name: "John Doe", relationship: "", phone: "" })
    expect(result.success).toBe(true)
  })

  it("rejects a missing name", () => {
    const result = emergencyContactSchema.safeParse({ name: "", relationship: "Brother", phone: "0912345678" })
    expect(result.success).toBe(false)
  })
})
