import { test, expect } from "@playwright/test"
import { loginAsAdmin } from "./helpers"
import {
  getUserByEmail,
  getStaffProfile,
  getUserRoles,
  cleanupTestUser,
} from "./helpers/db-helpers"

const TEST_STAFF_EMAIL = `test-staff-${Date.now()}@example.com`

test.describe("CRUD: Staff Onboarding", () => {
  test.afterAll(async () => {
    await cleanupTestUser(TEST_STAFF_EMAIL)
  })

  test("onboards a new staff member and persists to database", async ({
    page,
  }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/staff/new")

    // Fill form
    await page.getByLabel("Full name").fill("Test Nurse E2E")
    await page.getByLabel("Email").fill(TEST_STAFF_EMAIL)
    await page.getByLabel("Phone").fill("09123456789")
    await page.getByLabel("Staff code").fill("TST001")
    await page.getByLabel("Role").click()
    await page.getByRole("option", { name: "Nurse" }).click()
    await page.getByLabel("Department").fill("Emergency")

    // Submit
    await page.getByRole("button", { name: /create staff account/i }).click()

    // Wait for success — should show temp password card
    await expect(
      page.getByText(/account created for test nurse e2e/i)
    ).toBeVisible({ timeout: 15000 })

    // Verify database persistence
    const user = await getUserByEmail(TEST_STAFF_EMAIL)
    expect(user).toBeTruthy()
    expect(user.name).toBe("Test Nurse E2E")
    expect(user.phone).toBe("09123456789")

    // Verify staff profile
    const profile = await getStaffProfile(user.id)
    expect(profile.staff_code).toBe("TST001")
    expect(profile.department).toBe("Emergency")

    // Verify role assignment
    const roles = await getUserRoles(user.id)
    const nurseRole = roles.find((r: any) => r.roles?.name === "nurse")
    expect(nurseRole).toBeTruthy()
  })

  test("shows validation errors on empty submit", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/admin/staff/new")

    await page.getByRole("button", { name: /create staff account/i }).click()

    await expect(page.getByText("Name is required")).toBeVisible()
    await expect(page.getByText("Email is required")).toBeVisible()
    await expect(page.getByText("Staff code is required")).toBeVisible()
    await expect(page.getByText("Please select a role")).toBeVisible()
    await expect(page.getByText("Department is required")).toBeVisible()
  })
})
