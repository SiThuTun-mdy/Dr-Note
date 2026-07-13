import { describe, expect, it } from "vitest"

import { generateTempPassword } from "./password"

const ALLOWED_CHARS = /^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%]+$/

describe("generateTempPassword", () => {
  it("returns a 16-char password by default", () => {
    const password = generateTempPassword()
    expect(password).toHaveLength(16)
  })

  it("supports custom password length", () => {
    const password = generateTempPassword(24)
    expect(password).toHaveLength(24)
  })

  it("only uses characters from the approved charset", () => {
    const password = generateTempPassword(128)
    expect(ALLOWED_CHARS.test(password)).toBe(true)
  })
})
