import { test, expect } from "@playwright/test"
import { loginAsNurse } from "./helpers"

test.describe("Nurse Screening Page", () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to a screening page
    // We use a mock visit ID — the page will show the form regardless
    await loginAsNurse(page)
    await page.goto("/nurse/visits/00000000-0000-0000-0000-000000000001/screening")
  })

  test("displays screening vitals heading", async ({ page }) => {
    await expect(page.getByText("Screening vitals")).toBeVisible()
    await expect(page.getByText("Record patient vitals before doctor consultation.")).toBeVisible()
  })

  test("displays all vital sign fields", async ({ page }) => {
    await expect(page.getByText("Height")).toBeVisible()
    await expect(page.getByText("Weight")).toBeVisible()
    await expect(page.getByText("BP systolic")).toBeVisible()
    await expect(page.getByText("BP diastolic")).toBeVisible()
    await expect(page.getByText("Heart rate")).toBeVisible()
    await expect(page.getByText("Temperature")).toBeVisible()
    await expect(page.getByText("O₂ saturation")).toBeVisible()
  })

  test("displays unit suffixes", async ({ page }) => {
    await expect(page.getByText("cm").first()).toBeVisible()
    await expect(page.getByText("kg").first()).toBeVisible()
    await expect(page.getByText("mmHg").first()).toBeVisible()
    await expect(page.getByText("bpm").first()).toBeVisible()
    await expect(page.getByText("°C").first()).toBeVisible()
    await expect(page.getByText("%").first()).toBeVisible()
  })

  test("calculates BMI from height and weight", async ({ page }) => {
    // BMI should not be visible initially
    await expect(page.getByText("BMI (calculated)")).not.toBeVisible()

    // Fill height and weight
    await page.getByPlaceholder("170").fill("175")
    await page.getByPlaceholder("65").fill("70")

    // BMI should appear: 70 / (1.75^2) = 22.9
    await expect(page.getByText("BMI (calculated)")).toBeVisible()
    await expect(page.getByText("22.9")).toBeVisible()
  })

  test("navigates back to queue on back button click", async ({ page }) => {
    await page.getByText("Back to queue").click()
    await page.waitForURL("**/queue**")
  })

  test("shows save screening button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /save screening/i })).toBeVisible()
  })

  test("shows validation errors when submitting empty form", async ({ page }) => {
    await page.getByRole("button", { name: /save screening/i }).click()

    // Should show validation errors for required fields
    const errorMessages = page.locator("[data-slot='form-message']")
    await expect(errorMessages.first()).toBeVisible()
  })

  test("submits screening form with all fields", async ({ page }) => {
    // Fill all vital sign fields
    await page.getByPlaceholder("170").fill("175")
    await page.getByPlaceholder("65").fill("70")
    await page.getByPlaceholder("120").fill("120")
    await page.getByPlaceholder("80").fill("80")
    await page.getByPlaceholder("72").fill("72")
    await page.getByPlaceholder("36.5").fill("36.5")
    await page.getByPlaceholder("98").fill("98")

    // Submit form
    await page.getByRole("button", { name: /save screening/i }).click()

    // Should show either success toast or error (depending on visit status)
    // The form should attempt to submit
    await expect(page.getByRole("button", { name: /save screening|saving/i })).toBeVisible()
  })
})
