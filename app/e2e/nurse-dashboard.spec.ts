import { test, expect } from "@playwright/test"
import { loginAsNurse } from "./helpers"

test.describe("Nurse Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsNurse(page)
  })

  test("displays stat cards", async ({ page }) => {
    await expect(page.getByText("Awaiting screening")).toBeVisible()
    await expect(page.getByText("In progress")).toBeVisible()
    await expect(page.getByText("Completed today")).toBeVisible()
  })

  test("displays screening queue heading", async ({ page }) => {
    await expect(page.locator("#main-content").getByText("Screening queue")).toBeVisible()
  })

  test("displays queue table with search", async ({ page }) => {
    // The queue table should have a search input
    const searchInput = page.getByPlaceholder(/search by patient or complaint/i)
    await expect(searchInput).toBeVisible()
  })

  test("navigates to screening page when clicking a patient", async ({ page }) => {
    // Look for any patient link in the queue table
    const patientLink = page.locator("table tbody tr td a").first()

    // If there are patients in the queue, click the first one
    if (await patientLink.isVisible()) {
      await patientLink.click()
      await page.waitForURL("**/screening**")
      await expect(page.getByRole("heading", { name: "Screening vitals" })).toBeVisible()
    }
  })
})
