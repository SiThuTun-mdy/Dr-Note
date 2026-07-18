import { test, expect, type Page } from "@playwright/test";
import { TEST_USERS, ensureTestUsers, ensureDiagnoses } from "./setup";

// Ensure seed data exists before running tests
test.beforeAll(async () => {
  await ensureTestUsers();
  await ensureDiagnoses();
});

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
  // Logout is a button in the sidebar
  await page.getByRole("button", { name: /logout/i }).click();
  await page.waitForURL("**/login", { timeout: 10_000 });
}

// ── Test ─────────────────────────────────────────────────────────────

test.describe("Happy path: registration → visit → rx → history", () => {
  const patientName = `E2E Patient ${Date.now()}`;
  const patientEmail = `e2e-patient-${Date.now()}@test.demo`;

  test("full clinical workflow", async ({ page }) => {
    test.setTimeout(180_000); // 3 min for full workflow

    // ── 1. Receptionist: register patient ──────────────────────────
    await login(page, "receptionist");
    await expect(page).not.toHaveURL(/\/login/);

    await page.goto("/reception/patients/new");

    // Fill patient form (labels from patient-registration-form.tsx)
    await page.getByLabel("Full name").fill(patientName);
    await page.getByLabel("Email").fill(patientEmail);
    await page.getByLabel("Phone").fill("+959123456789");
    await page.getByLabel("Date of birth").fill("1990-05-15");
    // Gender is a Select component
    await page.getByLabel("Gender").click();
    await page.getByRole("option", { name: "Male", exact: true }).click();
    await page.getByLabel("NRC").fill("12/ABC(N)999999");
    await page.getByLabel("Address").fill("123 Test St, Yangon");

    // Submit
    await page.getByRole("button", { name: "Register Patient" }).click();

    // Wait for redirect to patient profile (after successful registration)
    await page.waitForURL(/\/patients\//, { timeout: 15_000 });

    // ── 2. Receptionist: create visit ──────────────────────────────
    await page.goto("/reception/visits/new");

    // Patient search (placeholder from visit-creation-form.tsx)
    await page.getByPlaceholder("Search by name, email, or NRC...").fill(patientName);
    // Wait for search results dropdown to appear and click the patient
    await page.getByRole("button", { name: new RegExp(patientName) }).waitFor({ timeout: 10_000 });
    await page.getByRole("button", { name: new RegExp(patientName) }).click();

    // Visit type is a Select
    await page.getByLabel("Visit Type").click();
    await page.getByRole("option", { name: "Consultation" }).click();

    // Chief complaint
    await page.getByLabel("Chief Complaint").fill("Persistent headache for 3 days");

    // Assign the test doctor so the visit appears in their queue
    await page.getByPlaceholder("Search by doctor name or email...").fill("doctor@drnote.demo");
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: /Dr\. Aung Aung/ }).first().click();

    // Submit visit
    await page.getByRole("button", { name: "Create Visit" }).click();

    // Wait for visit to be created (toast appears briefly)
    await page.waitForTimeout(3000);

    // ── 3. Logout receptionist ─────────────────────────────────────
    await logout(page);

    // ── 4. Nurse: screening ────────────────────────────────────────
    await login(page, "nurse");
    await expect(page).not.toHaveURL(/\/login/);

    // Navigate to nurse dashboard — search for patient in queue
    await page.goto("/nurse");
    const nurseSearch = page.getByPlaceholder("Search by patient or complaint...");
    await nurseSearch.waitFor({ state: "visible", timeout: 10_000 });
    await nurseSearch.fill(patientName);
    await page.waitForTimeout(500);
    await page.getByRole("link", { name: patientName }).click();

    // Wait for screening form to load
    await expect(page.getByRole("heading", { name: "Screening vitals" })).toBeVisible({ timeout: 10_000 });

    // Fill vitals using placeholders (labels include unit suffix like "Height (cm)")
    await page.getByPlaceholder("170").fill("170");
    await page.getByPlaceholder("65").fill("65");
    await page.getByPlaceholder("120").fill("120");
    await page.getByPlaceholder("80").fill("80");
    await page.getByPlaceholder("72").fill("72");
    await page.getByPlaceholder("36.5").fill("36.8");
    await page.getByPlaceholder("98").fill("98");

    // Submit screening
    await page.getByRole("button", { name: "Save screening" }).click();
    await expect(page.getByText("Screening recorded")).toBeVisible({ timeout: 10_000 });

    // ── 5. Logout nurse ────────────────────────────────────────────
    await logout(page);

    // ── 6. Doctor: diagnosis + note + prescription ─────────────────
    await login(page, "doctor");
    await expect(page).not.toHaveURL(/\/login/);

    // Navigate to doctor dashboard — search for patient in queue
    await page.goto("/doctor");
    await page.getByPlaceholder("Search by patient or complaint...").fill(patientName);
    await page.getByRole("link", { name: patientName }).click();

    // Wait for consult view to load
    await expect(page.getByRole("heading", { name: "Consult View" })).toBeVisible();

    // Add diagnosis (DiagnosisPicker: placeholder "Search by code or title...")
    const diagnosisInput = page.getByPlaceholder("Search by code or title...");
    await diagnosisInput.click();
    await diagnosisInput.pressSequentially("I10", { delay: 100 });
    // Wait for async search to complete and results to render
    await page.waitForTimeout(2000);
    // Click the diagnosis result containing "I10" text
    await page.getByText("I10").last().click({ timeout: 5000 });

    // Add clinical note (DiagnosisNote: placeholder "Enter diagnostic notes here...")
    const noteTextarea = page.getByPlaceholder("Enter diagnostic notes here...");
    await noteTextarea.fill(
      "Patient presents with persistent headache. Vitals within normal range. Prescribed medication for symptom management."
    );
    // Save note
    await page.getByRole("button", { name: "Save note" }).click();
    await expect(page.getByText("Diagnosis note saved")).toBeVisible({ timeout: 10_000 });

    // Add prescription (PrescriptionForm) — inputs lack htmlFor, use placeholders
    await page.getByPlaceholder("e.g. Paracetamol").fill("Paracetamol");
    await page.getByPlaceholder("e.g. 500mg").fill("500mg");
    await page.getByPlaceholder("e.g. 3/day").fill("3/day");
    await page.getByPlaceholder("e.g. 5 days").fill("5 days");
    await page.getByPlaceholder("e.g. oral").fill("oral");
    await page.getByPlaceholder("e.g. 30").fill("30");

    // Save prescription
    await page.getByRole("button", { name: "Save prescription" }).click();
    await expect(page.getByText("Prescription saved successfully")).toBeVisible({ timeout: 10_000 });

    // ── 7. Doctor: check summary ───────────────────────────────────
    // Navigate to visit summary via URL (no summary link on consult view)
    const urlParts = page.url().split("/");
    const visitId = urlParts[urlParts.indexOf("visits") + 1];
    await page.goto(`/doctor/visits/${visitId}/summary`);
    await expect(page.getByText(patientName, { exact: true })).toBeVisible();
    await expect(page.getByText("Persistent headache for 3 days")).toBeVisible();
    await expect(page.getByText(/paracetamol/i)).toBeVisible();

    // ── 8. Doctor: check patient in queue ──────────────────────────
    await page.goto("/doctor");
    await page.getByPlaceholder("Search by patient or complaint...").fill(patientName);
    await page.waitForTimeout(500);
    await expect(page.getByText(patientName, { exact: true }).first()).toBeVisible();
  });
});
