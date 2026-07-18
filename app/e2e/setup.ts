/**
 * E2E test setup — ensures auth users + public.users rows exist.
 *
 * Uses Supabase Admin API (service-role key) to create auth users
 * and insert public.users/staff_profiles/user_roles rows.
 * This script never runs inside the deployed app.
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local manually (Playwright doesn't load Next.js env files)
function loadEnvLocal() {
  try {
    const envPath = resolve(__dirname, "../.env.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local not found — rely on existing env vars
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
    "Ensure .env.local exists in the app/ directory."
  );
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface TestUser {
  email: string;
  password: string;
  userId: string;
  name: string;
  role: string;
  roleId: number;
  staffCode: string;
  department: string;
}

/** Seed-data test users (matches supabase/seed.sql user IDs). */
export const TEST_USERS: Record<string, TestUser> = {
  receptionist: {
    email: "receptionist@drnote.demo",
    password: "testpass123",
    userId: "44444444-4444-4444-4444-444444444444",
    name: "Receptionist Su Su",
    role: "receptionist",
    roleId: 4,
    staffCode: "REC001",
    department: "Front Desk",
  },
  nurse: {
    email: "nurse@drnote.demo",
    password: "testpass123",
    userId: "33333333-3333-3333-3333-333333333333",
    name: "Nurse Mi Mi",
    role: "nurse",
    roleId: 3,
    staffCode: "NRS001",
    department: "General Ward",
  },
  doctor: {
    email: "doctor@drnote.demo",
    password: "testpass123",
    userId: "22222222-2222-2222-2222-222222222222",
    name: "Dr. Aung Aung",
    role: "doctor",
    roleId: 2,
    staffCode: "DOC001",
    department: "General Medicine",
  },
  admin: {
    email: "admin@drnote.demo",
    password: "testpass123",
    userId: "11111111-1111-1111-1111-111111111111",
    name: "Admin User",
    role: "admin",
    roleId: 1,
    staffCode: "ADM001",
    department: "Administration",
  },
};

/**
 * Ensure diagnoses catalog exists (from seed.sql).
 * Uses service-role client to bypass RLS.
 */
export async function ensureDiagnoses(): Promise<void> {
  const { data: existing } = await admin.from("diagnoses").select("id").limit(1);
  if (existing && existing.length > 0) return; // already seeded

  const diagnoses = [
    { id: "a0b1c2d3-e4f5-6789-abcd-ef0123456701", code: "I10", title: "Essential (primary) hypertension" },
    { id: "a0b1c2d3-e4f5-6789-abcd-ef0123456702", code: "E11", title: "Type 2 diabetes mellitus" },
    { id: "a0b1c2d3-e4f5-6789-abcd-ef0123456703", code: "J11", title: "Influenza, virus not identified" },
    { id: "a0b1c2d3-e4f5-6789-abcd-ef0123456704", code: "J06", title: "Acute upper respiratory infection" },
    { id: "a0b1c2d3-e4f5-6789-abcd-ef0123456705", code: "K21", title: "Gastro-oesophageal reflux disease" },
    { id: "a0b1c2d3-e4f5-6789-abcd-ef0123456706", code: "M54", title: "Dorsalgia (back pain)" },
    { id: "a0b1c2d3-e4f5-6789-abcd-ef0123456707", code: "N39", title: "Urinary tract infection" },
    { id: "a0b1c2d3-e4f5-6789-abcd-ef0123456708", code: "A09", title: "Infectious gastroenteritis" },
  ];

  const { error } = await admin.from("diagnoses").insert(diagnoses);
  if (error) {
    console.error("[E2E] Failed to seed diagnoses:", error.message);
  }
}

/**
 * Ensure auth users + public.users rows exist.
 * Creates auth user via admin API, then inserts public.users/staff_profiles/user_roles.
 */
export async function ensureTestUsers(): Promise<void> {
  for (const [role, user] of Object.entries(TEST_USERS)) {
    // 1. Create auth user if missing
    const { data: existing } = await admin.auth.admin.getUserById(user.userId);
    if (!existing?.user) {
      const { error } = await admin.auth.admin.createUser({
        id: user.userId,
        email: user.email,
        password: user.password,
        email_confirm: true,
      });
      if (error && !error.message.includes("already exists")) {
        console.error(`[E2E] Failed to create auth user for ${role}:`, error.message);
        continue;
      }
    }

    // 2. Ensure public.users row exists
    const { data: existingUser } = await admin
      .from("users")
      .select("id")
      .eq("id", user.userId)
      .maybeSingle();

    if (!existingUser) {
      const { error: insertError } = await admin.from("users").insert({
        id: user.userId,
        name: user.name,
        email: user.email,
        phone: null,
        is_active: true,
      });
      if (insertError) {
        console.error(`[E2E] Failed to insert users row for ${role}:`, insertError.message);
        continue;
      }
    }

    // 3. Ensure staff_profiles row exists
    const { data: existingProfile } = await admin
      .from("staff_profiles")
      .select("user_id")
      .eq("user_id", user.userId)
      .maybeSingle();

    if (!existingProfile) {
      await admin.from("staff_profiles").insert({
        user_id: user.userId,
        staff_code: user.staffCode,
        department: user.department,
      });
    }

    // 4. Ensure user_roles row exists
    const { data: existingRole } = await admin
      .from("user_roles")
      .select("user_id")
      .eq("user_id", user.userId)
      .maybeSingle();

    if (!existingRole) {
      await admin.from("user_roles").insert({
        user_id: user.userId,
        role_id: user.roleId,
      });
    }
  }
}
