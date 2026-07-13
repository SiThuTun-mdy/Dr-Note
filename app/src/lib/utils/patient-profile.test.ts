import { describe, it, expect } from "vitest"
import { normalizeProfile, type PatientProfileFields } from "./patient-profile"

const profile: PatientProfileFields = {
  nrc: "12/ABC(N)123456",
  dob: "1990-01-01",
  gender: "male",
  religion: "Buddhist",
  ethnicity: "Bamar",
  address: "Yangon",
}

describe("normalizeProfile", () => {
  it("returns the object as-is when given a plain object", () => {
    expect(normalizeProfile(profile)).toEqual(profile)
  })

  it("returns the first element when given an array", () => {
    expect(normalizeProfile([profile])).toEqual(profile)
  })

  it("returns null when given an empty array", () => {
    expect(normalizeProfile([])).toBeNull()
  })

  it("returns null when given null", () => {
    expect(normalizeProfile(null)).toBeNull()
  })

  it("returns null when given undefined", () => {
    expect(normalizeProfile(undefined)).toBeNull()
  })
})
