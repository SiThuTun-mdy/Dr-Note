/**
 * Canonical origin for building absolute URLs (email redirect links, etc.)
 * outside of a request context. Prefers an explicit site URL, falls back to
 * the platform-provided preview URL, then localhost for dev.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/$/, "")

  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL
  if (vercelUrl) return `https://${vercelUrl}`

  return "http://localhost:3000"
}
