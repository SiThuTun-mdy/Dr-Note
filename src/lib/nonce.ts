import { randomBytes } from "crypto";

/**
 * Generate a cryptographically secure nonce for CSP
 * This nonce is used to allow specific inline scripts while blocking others
 */
export function generateNonce(): string {
  return randomBytes(16).toString("base64");
}

/**
 * Content Security Policy configuration
 * Uses nonce-based script loading for enhanced security
 */
export function getCSP(nonce: string): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'", // Unsafe-inline needed for Tailwind
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  return directives.join("; ");
}
