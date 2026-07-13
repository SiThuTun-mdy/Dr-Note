import { randomInt } from "crypto"

const CHARSET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%"

/**
 * Generates a random temp password for accounts created on behalf of
 * someone else (patients, staff). Never persisted — Supabase Auth owns it
 * after signUp; the caller only sees it once (if at all).
 *
 * Uses crypto.randomInt to avoid modulo bias from mapping raw bytes into
 * the character set.
 */
export function generateTempPassword(length = 16): string {
  let password = ""
  for (let i = 0; i < length; i++) {
    const idx = randomInt(0, CHARSET.length)
    password += CHARSET[idx]
  }
  return password
}
