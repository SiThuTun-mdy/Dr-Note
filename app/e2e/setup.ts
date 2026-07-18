/**
 * E2E test setup — ensures auth users exist for seed data.
 * Run once before tests: `npx playwright test --project=setup`
 *
 * Users are created via Supabase Admin API (service-role key).
 * This script never runs inside the deployed app.
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface TestUser {
  email: string;
  password: string;
  userId: string;
}

/** Seed-data test users (matches supabase/seed.sql user IDs). */
export const TEST_USERS: Record<string, TestUser> = {
  receptionist: {
    email: "receptionist@drnote.demo",
    password: "testpass123",
    userId: "44444444-4444-4444-4444-444444444444",
  },
  nurse: {
    email: "nurse@drnote.demo",
    password: "testpass123",
    userId: "33333333-3333-3333-3333-333333333333",
  },
  doctor: {
    email: "doctor@drnote.demo",
    password: "testpass123",
    userId: "22222222-2222-2222-2222-222222222222",
  },
  admin: {
    email: "admin@drnote.demo",
    password: "testpass123",
    userId: "11111111-1111-1111-1111-111111111111",
  },
};

/**
 * Create auth users if they don't exist.
 * Uses admin API — safe for local/CI, never in production app code.
 */
export async function ensureTestUsers(): Promise<void> {
  for (const [role, user] of Object.entries(TEST_USERS)) {
    // Check if auth user already exists
    const { data: existing } = await admin.auth.admin.getUserById(user.userId);
    if (existing?.user) {
      continue;
    }

    // Create auth user with known ID
    const { error } = await admin.auth.admin.createUser({
      id: user.userId,
      email: user.email,
      password: user.password,
      email_confirm: true, // skip confirmation for tests
    });

    if (error && !error.message.includes("already exists")) {
      console.error(`Failed to create auth user for ${role}:`, error.message);
    }
  }
}

/**
 * Delete test users created during tests.
 */
export async function cleanupTestUsers(): Promise<void> {
  for (const user of Object.values(TEST_USERS)) {
    await admin.auth.admin.deleteUser(user.userId);
  }
}
