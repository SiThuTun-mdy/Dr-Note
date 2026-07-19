import { test, expect } from "@playwright/test"
import { loginAsReceptionist } from "./helpers"
import { supabase } from "./helpers/db-helpers"

const PATIENT_ID = "a0000000-0000-0000-0000-000000000010"
const ORIGINAL_NAME = "Ko Min Aung"

test.describe("CRUD: Patient Profile Update", () => {
  test.afterAll(async () => {
    await supabase
      .from("users")
      .update({ name: ORIGINAL_NAME, phone: "+959123456790" })
      .eq("id", PATIENT_ID)
  })

  test("edits patient demographics and persists to database", async ({
    page,
  }) => {
    await loginAsReceptionist(page)
    await page.goto(`/patients/${PATIENT_ID}`)

    await page.getByRole("button", { name: /edit/i }).click()

    // Update name
    const nameInput = page.locator("[data-slot='input']").first()
    await nameInput.clear()
    await nameInput.fill("Ko Min Aung Updated")

    // Update phone
    const phoneInput = page.locator("input[name='phone']").first()
    await phoneInput.clear()
    await phoneInput.fill("09987654321")

    await page.getByRole("button", { name: /save changes/i }).click()

    await expect(page.getByText("Patient profile updated")).toBeVisible({
      timeout: 10000,
    })

    // Verify database
    const { data: user } = await supabase
      .from("users")
      .select("name, phone")
      .eq("id", PATIENT_ID)
      .single()
    expect(user!.name).toBe("Ko Min Aung Updated")
    expect(user!.phone).toBe("09987654321")
  })

  test("cancels editing without saving", async ({ page }) => {
    await loginAsReceptionist(page)
    await page.goto(`/patients/${PATIENT_ID}`)

    await page.getByRole("button", { name: /edit/i }).click()

    const nameInput = page.locator("[data-slot='input']").first()
    await nameInput.clear()
    await nameInput.fill("Should Not Save")

    await page.getByRole("button", { name: /cancel/i }).click()

    // Should show the updated name — use the heading (h1) to disambiguate
    await expect(
      page.getByRole("heading", { name: "Ko Min Aung Updated" })
    ).toBeVisible()
  })
})
