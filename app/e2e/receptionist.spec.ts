import { test, expect } from "@playwright/test"
import { loginAsReceptionist } from "./helpers"

test.describe("Receptionist Role", () => {
  test.describe("Dashboard", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsReceptionist(page)
    })

    test("displays stat cards", async ({ page }) => {
      await expect(page.getByText("Recent Visits")).toBeVisible()
    })
  })

  test.describe("Register Patient", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsReceptionist(page)
      await page.goto("/reception/patients/new")
    })

    test("displays register patient heading", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "Patient Registration" })).toBeVisible()
    })

    test("displays patient registration form", async ({ page }) => {
      await expect(page.getByLabel(/name/i)).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
    })
  })

  test.describe("New Visit", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsReceptionist(page)
      await page.goto("/reception/visits/new")
    })

    test("displays new visit heading", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "New visit" })).toBeVisible()
    })

    test("displays visit creation form", async ({ page }) => {
      await expect(page.getByText("Patient *")).toBeVisible()
      await expect(page.getByText("Visit Type *")).toBeVisible()
    })
  })

  test.describe("Patients", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsReceptionist(page)
      await page.goto("/patients")
    })

    test("displays patients heading", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "Patients" })).toBeVisible()
      await expect(page.getByText("Browse and open patient profiles")).toBeVisible()
    })

    test("displays filter input", async ({ page }) => {
      const filterInput = page.getByPlaceholder(/filter/i)
      await expect(filterInput).toBeVisible()
    })
  })

  test.describe("Queue", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsReceptionist(page)
      await page.goto("/queue")
    })

    test("displays queue heading", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "Today's queue" })).toBeVisible()
    })

    test("displays queue table", async ({ page }) => {
      await expect(page.locator("#main-content").getByText("Visit queue")).toBeVisible()
    })
  })

  test.describe("Appointments (Under Development)", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsReceptionist(page)
      await page.goto("/appointments")
    })

    test("shows under development page", async ({ page }) => {
      await expect(page.getByText("Under Development")).toBeVisible()
      await expect(page.getByText("Back to Dashboard")).toBeVisible()
    })

    test("navigates back to reception dashboard", async ({ page }) => {
      await page.getByText("Back to Dashboard").click()
      await page.waitForURL("**/reception")
    })
  })

  test.describe("Sidebar navigation", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsReceptionist(page)
    })

    test("shows all receptionist nav items", async ({ page }) => {
      const nav = page.locator("nav")
      await expect(nav.getByText("Dashboard")).toBeVisible()
      await expect(nav.getByText("Register patient")).toBeVisible()
      await expect(nav.getByText("New visit")).toBeVisible()
      await expect(nav.getByText("Today's queue")).toBeVisible()
      await expect(nav.getByText("Patients")).toBeVisible()
    })

    test("navigates between pages via sidebar", async ({ page }) => {
      const nav = page.locator("nav")
      await nav.getByText("Register patient").click()
      await page.waitForURL("**/reception/patients/new**")

      await nav.getByText("Today's queue").click()
      await page.waitForURL("**/queue**")
      await expect(page.getByRole("heading", { name: "Today's queue" })).toBeVisible()

      await nav.getByText("Dashboard").click()
      await page.waitForURL("**/reception")
    })
  })
})
