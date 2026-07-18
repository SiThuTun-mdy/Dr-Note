import { test, expect } from "@playwright/test"

// Doctor visit detail page is under development — skip all consultation CRUD tests
test.describe("CRUD: Doctor Consultation", () => {
  test.skip(
    true,
    "Doctor consult view is under development — re-enable when the page is built"
  )

  test("placeholder — skipped", async () => {
    // Intentionally empty — the describe is skipped
  })
})
