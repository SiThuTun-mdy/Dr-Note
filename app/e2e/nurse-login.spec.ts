import { test, expect } from "@playwright/test"

test.describe("Nurse Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
  })

  test("renders login page with form fields", async ({ page }) => {
    await expect(page.getByText("Welcome back")).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Password")).toBeVisible()
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible()
  })

  test("shows demo accounts section", async ({ page }) => {
    await expect(page.getByText("Demo Accounts")).toBeVisible()
    await expect(page.getByText("Nurse", { exact: true })).toBeVisible()
    await expect(page.getByText("nurse@drnote.com")).toBeVisible()
  })

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.getByRole("button", { name: /sign in/i }).click()
    await expect(page.getByText("Email is required")).toBeVisible()
    await expect(page.getByText("Password is required")).toBeVisible()
  })

  test("shows error on wrong credentials", async ({ page }) => {
    await page.getByLabel("Email").fill("nurse@drnote.com")
    await page.getByLabel("Password").fill("wrongpassword")
    await page.getByRole("button", { name: /sign in/i }).click()
    await expect(page.getByText(/wrong email or password/i)).toBeVisible()
  })

  test("successfully logs in as nurse and redirects to dashboard", async ({ page }) => {
    await page.getByLabel("Email").fill("nurse@drnote.com")
    await page.getByLabel("Password").fill("testpass123")
    await page.getByRole("button", { name: /sign in/i }).click()

    await page.waitForURL("**/nurse")

    // Should see nurse dashboard content
    await expect(page.getByText("Awaiting screening")).toBeVisible()
    await expect(page.locator("#main-content").getByText("Screening queue")).toBeVisible()
  })

  test("shows loading state during submission", async ({ page }) => {
    await page.getByLabel("Email").fill("nurse@drnote.com")
    await page.getByLabel("Password").fill("testpass123")
    await page.getByRole("button", { name: /sign in/i }).click()

    // Loading indicator should appear briefly
    await expect(page.getByText("Signing in...")).toBeVisible()
  })
})
