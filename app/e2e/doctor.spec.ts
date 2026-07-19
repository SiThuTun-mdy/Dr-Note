import { test, expect } from "@playwright/test"
import { loginAsDoctor } from "./helpers"

test.describe("Doctor Role", () => {
  test.describe("Dashboard", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsDoctor(page)
    })

    test("displays stat cards", async ({ page }) => {
      await expect(page.getByText("Today's patients")).toBeVisible()
      await expect(page.getByText("Pending consultations")).toBeVisible()
      await expect(page.getByText("Completed today")).toBeVisible()
    })

    test("displays my queue section", async ({ page }) => {
      await expect(page.locator("#main-content").getByText("My queue")).toBeVisible()
    })

    test("displays queue table with search", async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i)
      await expect(searchInput).toBeVisible()
    })
  })

  test.describe("My Queue", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsDoctor(page)
      await page.goto("/my-queue")
    })

    test("displays my queue heading", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "My Queue" })).toBeVisible()
      await expect(page.getByText("Your assigned patient visits")).toBeVisible()
    })

    test("displays search input", async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i)
      await expect(searchInput).toBeVisible()
    })
  })

  test.describe("Patients", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsDoctor(page)
      await page.goto("/patients")
    })

    test("displays patients heading", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "Patients" })).toBeVisible()
      await expect(page.getByText("Browse and open patient profiles")).toBeVisible()
    })

    test("displays search input", async ({ page }) => {
      const searchInput = page.getByPlaceholder(/filter/i)
      await expect(searchInput).toBeVisible()
    })
  })

  test.describe("Consultations", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsDoctor(page)
      await page.goto("/consultations")
    })

    test("displays consultations heading", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "Consultations" })).toBeVisible()
      await expect(page.getByText("View and manage patient consultations")).toBeVisible()
    })

    test("displays search input", async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i)
      await expect(searchInput).toBeVisible()
    })
  })

  test.describe("Prescriptions", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsDoctor(page)
      await page.goto("/prescriptions")
    })

    test("displays prescriptions heading", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "Prescriptions" })).toBeVisible()
      await expect(page.getByText("View all prescriptions")).toBeVisible()
    })

    test("displays search input", async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i)
      await expect(searchInput).toBeVisible()
    })
  })

  test.describe("Sidebar navigation", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsDoctor(page)
    })

    test("shows all doctor nav items", async ({ page }) => {
      const nav = page.locator("nav")
      await expect(nav.getByText("Dashboard")).toBeVisible()
      await expect(nav.getByText("Patients")).toBeVisible()
      await expect(nav.getByText("Consultations")).toBeVisible()
    })

    test("navigates between pages via sidebar", async ({ page }) => {
      const nav = page.locator("nav")
      await nav.getByText("Consultations").click()
      await page.waitForURL("**/consultations**")
      await expect(page.getByRole("heading", { name: "Consultations" })).toBeVisible()

      await nav.getByText("Dashboard").click()
      await page.waitForURL("**/doctor")
      await expect(page.getByText("Today's patients")).toBeVisible()
    })
  })
})
