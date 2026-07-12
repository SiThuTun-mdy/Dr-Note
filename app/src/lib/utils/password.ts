import { randomBytes } from "crypto"

const CHARSET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%"

/**
 * Generates a random temp password for accounts created on behalf of
 * someone else (patients, staff). Never persisted — Supabase Auth owns it
 * after signUp; the caller only sees it once (if at all).
 */
export function generateTempPassword(length = 16): string {
  const bytes = randomBytes(length)
  let password = ""
  for (let i = 0; i < length; i++) {
    password += CHARSET[bytes[i] % CHARSET.length]
  }
  return password
}
