import { test, expect } from "@playwright/test"
import { loginAsReceptionist } from "./helpers"
import {
  getEmergencyContacts,
  supabase,
} from "./helpers/db-helpers"

// Use seeded patient 3 (U Kyaw Zin) — has 1 emergency contact already
const PATIENT_ID = "a0000000-0000-0000-0000-000000000012"

test.describe("CRUD: Emergency Contacts", () => {
  test("adds an emergency contact and persists to database", async ({ page }) => {
    await loginAsReceptionist(page)
    await page.goto(`/patients/${PATIENT_ID}`)

    // Fill contact form
    await page.getByLabel("Contact name").fill("U Thein Aung")
    await page.getByLabel("Relationship").fill("Brother")
    await page.getByLabel("Phone", { exact: false }).fill("09123456789")

    // Submit
    await page.getByRole("button", { name: /add contact/i }).click()

    // Wait for success toast
    await expect(page.getByText("Emergency contact added")).toBeVisible({
      timeout: 10000,
    })

    // Verify contact appears in the list
    await expect(page.getByText("U Thein Aung")).toBeVisible()

    // Verify database persistence
    const contacts = await getEmergencyContacts(PATIENT_ID)
    const added = contacts.find((c: any) => c.name === "U Thein Aung")
    expect(added).toBeTruthy()
    expect(added.relationship).toBe("Brother")
    expect(added.phone).toBe("09123456789")

    // Cleanup: delete the test contact
    if (added) {
      await supabase.from("emergency_contacts").delete().eq("id", added.id)
    }
  })

  test("removes an emergency contact and persists to database", async ({ page }) => {
    await loginAsReceptionist(page)
    await page.goto(`/patients/${PATIENT_ID}`)

    // First, add a contact to remove
    await page.getByLabel("Contact name").fill("Temporary Contact")
    await page.getByRole("button", { name: /add contact/i }).click()
    await expect(page.getByText("Emergency contact added")).toBeVisible({
      timeout: 10000,
    })

    // Find the contact in the list and click remove
    const contactRow = page.locator("li").filter({ hasText: "Temporary Contact" })
    await contactRow.getByRole("button", { name: /remove/i }).click()

    // Confirm removal in dialog
    await page.getByRole("button", { name: /^Remove$/ }).click()

    // Wait for success toast
    await expect(page.getByText("Emergency contact removed")).toBeVisible({
      timeout: 10000,
    })

    // Verify contact is gone from the list
    await expect(page.getByText("Temporary Contact")).not.toBeVisible()

    // Verify database deletion
    const contacts = await getEmergencyContacts(PATIENT_ID)
    const removed = contacts.find((c: any) => c.name === "Temporary Contact")
    expect(removed).toBeFalsy()
  })

  test("shows validation error when adding contact with empty name", async ({
    page,
  }) => {
    await loginAsReceptionist(page)
    await page.goto(`/patients/${PATIENT_ID}`)

    // Try to submit empty form
    await page.getByRole("button", { name: /add contact/i }).click()

    await expect(page.getByText("Name is required")).toBeVisible()
  })
})
