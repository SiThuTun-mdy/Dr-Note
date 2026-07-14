import { type Page, expect } from "@playwright/test"

export const CREDENTIALS = {
  admin: { email: "admin@drnote.com", password: "testpass123" },
  doctor: { email: "doctor@drnote.com", password: "testpass123" },
  nurse: { email: "nurse@drnote.com", password: "testpass123" },
  receptionist: { email: "receptionist@drnote.com", password: "testpass123" },
} as const

type Role = keyof typeof CREDENTIALS

/**
 * Generic login helper — fills form, submits, waits for role dashboard.
 */
async function loginAs(page: Page, role: Role) {
  const creds = CREDENTIALS[role]
  await page.goto("/login")
  await page.getByLabel("Email").fill(creds.email)
  await page.getByLabel("Password").fill(creds.password)
  await page.getByRole("button", { name: /sign in/i }).click()
  await page.waitForURL(`**/${role === "receptionist" ? "reception" : role}*`)
}

export async function loginAsAdmin(page: Page) {
  await loginAs(page, "admin")
  await expect(page.getByRole("heading", { name: /admin/i })).toBeVisible()
}

export async function loginAsDoctor(page: Page) {
  await loginAs(page, "doctor")
  await expect(page.getByRole("heading", { name: /doctor/i })).toBeVisible()
}

export async function loginAsNurse(page: Page) {
  await loginAs(page, "nurse")
  await expect(page.getByRole("heading", { name: /nurse/i })).toBeVisible()
}

export async function loginAsReceptionist(page: Page) {
  await loginAs(page, "receptionist")
  await expect(page.getByRole("heading", { name: /reception/i })).toBeVisible()
}
