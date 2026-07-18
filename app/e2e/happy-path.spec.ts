import { test, expect, type Page } from "@playwright/test";
import { TEST_USERS } from "./setup";

// ── Helpers ──────────────────────────────────────────────────────────

async function login(page: Page, role: "receptionist" | "nurse" | "doctor" | "admin") {
  const user = TEST_USERS[role];
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  // Wait for redirect away from login
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15_000 });
}

async function logout(page: Page) {
  // Click the user avatar/menu in topbar to open dropdown
  const menuTrigger = page.getByRole("button", { name: /user menu|profile|avatar/i })
    .or(page.locator("[data-testid='user-menu']"))
    .or(page.locator("header button").last());
  await menuTrigger.click();
  // Click sign out / logout
  await page.getByRole("menuitem", { name: /sign out|logout|log out/i }).click();
  await page.waitForURL("**/login", { timeout: 10_000 });
}

// ── Test ─────────────────────────────────────────────────────────────

test.describe("Happy path: registration → visit → rx → history", () => {
  // Unique patient name per run to avoid duplicates
  const patientName = `E2E Patient ${Date.now()}`;
  const patientEmail = `e2e-patient-${Date.now()}@test.demo`;

  test("full clinical workflow", async ({ page }) => {
    test.setTimeout(120_000); // 2 min max

    // ── 1. Receptionist: register patient ──────────────────────────
    await login(page, "receptionist");
    await expect(page).not.toHaveURL(/\/login/);

    // Navigate to patient registration
    await page.goto("/reception/patients/new");

    // Fill patient form
    await page.getByLabel("Name").fill(patientName);
    await page.getByLabel("Email").fill(patientEmail);
    await page.getByLabel("Phone").fill("+959123456789");
    await page.getByLabel("Date of birth").fill("1990-05-15");
    await page.getByLabel("Gender").click();
    await page.getByRole("option", { name: /male/i }).first().click();
    await page.getByLabel("NRC").fill("12/ABC(N)999999");
    await page.getByLabel("Address").fill("123 Test St, Yangon");

    // Submit
    await page.getByRole("button", { name: /register patient/i }).click();

    // Wait for success toast or redirect
    await expect(
      page.getByText(/patient registered|success/i)
    ).toBeVisible({ timeout: 10_000 });

    // ── 2. Receptionist: create visit ──────────────────────────────
    await page.goto("/reception/visits/new");

    // Search for the patient we just registered
    const patientSearch = page.getByPlaceholder(/search patient/i)
      .or(page.getByLabel(/patient/i));
    await patientSearch.fill(patientName);
    await page.getByText(patientName).first().click();

    // Fill visit details
    await page.getByLabel("Visit type").click();
    await page.getByRole("option", { name: /consultation|general/i }).first().click();

    await page.getByLabel(/chief complaint/i).fill("Persistent headache for 3 days");

    // Select a doctor
    const doctorSearch = page.getByPlaceholder(/search doctor/i)
      .or(page.getByLabel(/doctor/i));
    await doctorSearch.fill("Doctor");
    await page.getByText(/Dr\./).first().click();

    // Submit visit
    await page.getByRole("button", { name: /create visit/i }).click();
    await expect(
      page.getByText(/visit created|success/i)
    ).toBeVisible({ timeout: 10_000 });

    // ── 3. Logout receptionist ─────────────────────────────────────
    await logout(page);

    // ── 4. Nurse: screening ────────────────────────────────────────
    await login(page, "nurse");
    await expect(page).not.toHaveURL(/\/login/);

    // Navigate to queue and find the visit
    await page.goto("/nurse");
    // Click on the patient in the queue
    await page.getByText(patientName).first().click();

    // Fill screening / vitals
    await page.getByLabel(/temperature/i).fill("36.8");
    await page.getByLabel(/blood pressure/i).fill("120/80");
    await page.getByLabel(/heart rate/i).fill("72");
    await page.getByLabel(/weight/i).fill("65");
    await page.getByLabel(/height/i).fill("170");
    await page.getByLabel(/respiratory rate/i).fill("16");

    // Submit screening
    await page.getByRole("button", { name: /submit screening|complete screening|save/i }).click();
    await expect(
      page.getByText(/screening|success/i)
    ).toBeVisible({ timeout: 10_000 });

    // ── 5. Logout nurse ────────────────────────────────────────────
    await logout(page);

    // ── 6. Doctor: diagnosis + note + prescription ─────────────────
    await login(page, "doctor");
    await expect(page).not.toHaveURL(/\/login/);

    // Navigate to queue and find the visit
    await page.goto("/doctor");
    await page.getByText(patientName).first().click();

    // Add diagnosis
    await page.getByRole("button", { name: /add diagnosis/i }).click();
    // Search for a diagnosis in the catalog
    await page.getByPlaceholder(/search diagnosis/i).fill("hypertension");
    await page.getByText("Essential (primary) hypertension").click();
    await page.getByRole("button", { name: /add|confirm/i }).last().click();

    // Add clinical note
    await page.getByLabel(/clinical note|note/i).fill(
      "Patient presents with persistent headache. Vitals within normal range. Prescribed medication for symptom management."
    );

    // Add prescription
    await page.getByRole("button", { name: /add prescription|new prescription/i }).click();
    await page.getByLabel(/medication|drug name/i).fill("Paracetamol");
    await page.getByLabel(/dosage/i).fill("500mg");
    await page.getByLabel(/frequency/i).fill("Three times daily");
    await page.getByLabel(/duration/i).fill("5 days");
    await page.getByLabel(/instructions?|notes?/i).fill("Take after meals");
    await page.getByRole("button", { name: /save prescription|submit prescription/i }).click();

    await expect(
      page.getByText(/prescription|success/i)
    ).toBeVisible({ timeout: 10_000 });

    // ── 7. Doctor: check summary ───────────────────────────────────
    // Navigate to visit summary
    await page.getByRole("link", { name: /summary/i }).click();
    await expect(page.getByText(patientName)).toBeVisible();
    await expect(page.getByText(/persistent headache/i)).toBeVisible();
    await expect(page.getByText(/essential.*hypertension/i)).toBeVisible();
    await expect(page.getByText(/paracetamol/i)).toBeVisible();

    // ── 8. Doctor: check history ───────────────────────────────────
    await page.goto("/doctor");
    await page.getByRole("link", { name: /history|patients/i }).click();
    await expect(page.getByText(patientName)).toBeVisible();
  });
});
