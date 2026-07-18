import { describe, expect, it } from "vitest"
import { escapeSearchTerm } from "./search"

describe("escapeSearchTerm", () => {
  it("escapes LIKE wildcards (% _ \\)", () => {
    expect(escapeSearchTerm("%admin%")).toBe("\\%admin\\%")
    expect(escapeSearchTerm("test_user")).toBe("test\\_user")
    expect(escapeSearchTerm("path\\to")).toBe("path\\\\to")
  })

  it("escapes PostgREST filter syntax characters (, .)", () => {
    expect(escapeSearchTerm("a,id.neq.x")).toBe("a\\,id\\.neq\\.x")
    expect(escapeSearchTerm("name.ilike.%test%")).toBe(
      "name\\.ilike\\.\\%test\\%"
    )
  })

  it("escapes parentheses used in .or() grouping", () => {
    expect(escapeSearchTerm("foo(bar)")).toBe("foo\\(bar\\)")
  })

  it("leaves normal search terms mostly intact", () => {
    expect(escapeSearchTerm("John")).toBe("John")
    expect(escapeSearchTerm("mary jane")).toBe("mary jane")
    expect(escapeSearchTerm("12345")).toBe("12345")
  })

  it("handles empty string", () => {
    expect(escapeSearchTerm("")).toBe("")
  })

  it("handles string with only special characters", () => {
    expect(escapeSearchTerm("%_\\(),.")).toBe("\\%\\_\\\\\\(\\)\\,\\.")
  })

  it("neutralises injection attempt from issue #79", () => {
    const malicious = "a,id.neq.00000000-0000-0000-0000-000000000000"
    const safe = escapeSearchTerm(malicious)
    // Must NOT contain unescaped commas or dots that PostgREST could parse
    expect(safe).not.toMatch(/(?<!\\)[,.]/)
    // Must still contain the original characters (escaped)
    expect(safe).toContain("id")
    expect(safe).toContain("neq")
  })
})
