import { test, expect } from "@playwright/test"
import { loginAsAdmin } from "./helpers"

test.describe("Admin Role", () => {
  test.describe("Dashboard", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
    })

    test("displays stat cards", async ({ page }) => {
      await expect(page.getByText("Total patients")).toBeVisible()
      await expect(page.getByText("Active staff")).toBeVisible()
    })

    test("displays system overview", async ({ page }) => {
      await expect(page.getByText("System overview")).toBeVisible()
      await expect(page.getByText("Database status")).toBeVisible()
      await expect(page.getByText("Connected")).toBeVisible()
      await expect(page.getByText("Supabase")).toBeVisible()
    })

    test("navigates to user management via sidebar", async ({ page }) => {
      const nav = page.locator("nav")
      await nav.getByText("User management").click()
      await page.waitForURL("**/admin/users**")
      await expect(page.getByRole("heading", { name: "User Management", exact: true })).toBeVisible()
    })
  })

  test.describe("User Management", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto("/admin/users")
    })

    test("displays user management heading", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "User Management", exact: true })).toBeVisible()
    })

    test("displays add staff button", async ({ page }) => {
      await expect(page.getByRole("link", { name: /add staff/i })).toBeVisible()
    })

    test("displays user table with search", async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search by name or email/i)
      await expect(searchInput).toBeVisible()
    })

    test("navigates to add staff page", async ({ page }) => {
      await page.getByRole("link", { name: /add staff/i }).click()
      await page.waitForURL("**/admin/staff/new**")
      await expect(page.getByText("Add staff member")).toBeVisible()
    })
  })

  test.describe("Add Staff", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto("/admin/staff/new")
    })

    test("displays add staff heading", async ({ page }) => {
      await expect(page.getByText("Add staff member")).toBeVisible()
    })

    test("displays staff onboarding form", async ({ page }) => {
      // The form should have name, email, and role fields
      await expect(page.getByLabel(/name/i)).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
    })
  })

  test.describe("Settings (Under Development)", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto("/admin/settings")
    })

    test("shows under development page", async ({ page }) => {
      await expect(page.getByText("Under Development")).toBeVisible()
      await expect(page.getByText("Back to Dashboard")).toBeVisible()
    })

    test("navigates back to admin dashboard", async ({ page }) => {
      await page.getByText("Back to Dashboard").click()
      await page.waitForURL("**/admin")
    })
  })

  test.describe("Reports (Under Development)", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto("/admin/reports")
    })

    test("shows under development page", async ({ page }) => {
      await expect(page.getByText("Under Development")).toBeVisible()
    })
  })

  test.describe("Audit Log (Under Development)", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto("/admin/audit")
    })

    test("shows under development page", async ({ page }) => {
      await expect(page.getByText("Under Development")).toBeVisible()
    })
  })

  test.describe("Sidebar navigation", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
    })

    test("shows all admin nav items", async ({ page }) => {
      const nav = page.locator("nav")
      await expect(nav.getByText("Dashboard")).toBeVisible()
      await expect(nav.getByText("User management")).toBeVisible()
      await expect(nav.getByText("Add staff")).toBeVisible()
    })

    test("navigates between pages via sidebar", async ({ page }) => {
      const nav = page.locator("nav")
      await nav.getByText("User management").click()
      await page.waitForURL("**/admin/users**")
      await expect(page.getByRole("heading", { name: "User Management", exact: true })).toBeVisible()

      await nav.getByText("Dashboard").click()
      await page.waitForURL("**/admin")
      await expect(page.getByText("System overview")).toBeVisible()
    })
  })
})
