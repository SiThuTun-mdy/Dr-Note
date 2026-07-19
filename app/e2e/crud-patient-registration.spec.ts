import { test, expect } from "@playwright/test"
import { loginAsReceptionist } from "./helpers"
import { getUserByEmail, cleanupTestUser } from "./helpers/db-helpers"

const TEST_EMAIL = `test-patient-${Date.now()}@example.com`

test.describe("CRUD: Patient Registration", () => {
  test.afterAll(async () => {
    await cleanupTestUser(TEST_EMAIL)
  })

  test("registers a new patient and persists to database", async ({ page }) => {
    await loginAsReceptionist(page)
    await page.goto("/reception/patients/new")

    await page.getByLabel("Full name").fill("Test Patient E2E")
    await page.getByLabel("Email").fill(TEST_EMAIL)
    await page.getByLabel("Phone").fill("09123456789")
    await page.getByLabel("Date of birth").fill("1995-06-15")

    // Select gender — use exact match to avoid matching Female
    await page.getByRole("combobox", { name: /gender/i }).click()
    await page.getByRole("option", { name: "Male", exact: true }).click()

    await page.getByLabel("NRC").fill("12/abc(N)123456")
    await page.getByLabel("Religion").fill("Buddhism")
    await page.getByLabel("Ethnicity").fill("Bamar")
    await page.getByLabel("Address").fill("123 Test Street, Yangon")

    await page.getByRole("button", { name: /register patient/i }).click()

    await expect(page.getByText("Patient registered")).toBeVisible({
      timeout: 15000,
    })

    await page.waitForURL(/\/patients\/[a-f0-9-]+/, { timeout: 10000 })

    const user = await getUserByEmail(TEST_EMAIL)
    expect(user).toBeTruthy()
    expect(user.name).toBe("Test Patient E2E")
    expect(user.email).toBe(TEST_EMAIL)
    expect(user.phone).toBe("09123456789")
    expect(user.is_active).toBe(true) // registration sets patients as active
  })

  test("shows validation errors on empty submit", async ({ page }) => {
    await loginAsReceptionist(page)
    await page.goto("/reception/patients/new")

    await page.getByRole("button", { name: /register patient/i }).click()

    await expect(page.getByText("Name is required")).toBeVisible()
    await expect(page.getByText("Email is required")).toBeVisible()
    await expect(page.getByText("Date of birth is required")).toBeVisible()
    await expect(page.getByText("Please select a gender")).toBeVisible()
  })

  test.skip("shows error on duplicate email", async ({ page }) => {
    await loginAsReceptionist(page)
    await page.goto("/reception/patients/new")

    await page.getByLabel("Full name").fill("Duplicate Email Patient")
    await page.getByLabel("Email").fill("patient1@drnote.com")
    await page.getByLabel("Date of birth").fill("1990-01-01")

    await page.getByRole("combobox", { name: /gender/i }).click()
    await page.getByRole("option", { name: "Male", exact: true }).click()

    await page.getByRole("button", { name: /register patient/i }).click()

    await expect(page.getByText(/already registered|fix the highlighted/i)).toBeVisible({
      timeout: 10000,
    })
  })
})
