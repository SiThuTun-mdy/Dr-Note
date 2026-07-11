/**
 * Input sanitization utilities
 * Use these to prevent XSS and other injection attacks
 */

// Note: In production, use DOMPurify for browser-side sanitization
// This is a server-side sanitizer for basic use cases

/**
 * Sanitize string input - remove potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  if (!input) return ''

  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters (except newline and tab)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Encode HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Sanitize object - recursively sanitize all string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = {} as T

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeString(value)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      (sanitized as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>)
    } else if (Array.isArray(value)) {
      (sanitized as Record<string, unknown>)[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeString(item)
          : typeof item === 'object' && item !== null
          ? sanitizeObject(item as Record<string, unknown>)
          : item
      )
    } else {
      (sanitized as Record<string, unknown>)[key] = value
    }
  }

  return sanitized
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ''

  return email
    .trim()
    .toLowerCase()
    // Remove any characters that aren't valid in email
    .replace(/[^a-z0-9@._-]/g, '')
}

/**
 * Validate and sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return ''

  return phone
    .trim()
    // Keep only digits, +, and spaces
    .replace(/[^0-9+\s-]/g, '')
}

/**
 * Check for potentially malicious patterns
 */
export function containsSuspiciousPatterns(input: string): boolean {
  const suspiciousPatterns = [
    // SQL injection patterns
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/i,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,

    // XSS patterns
    /<script\b[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,

    // Path traversal
    /\.\.\//g,
    /\.\.\\/g,

    // Command injection
    /[;&|`$]/g,
  ]

  return suspiciousPatterns.some((pattern) => pattern.test(input))
}

/**
 * Validate input and throw if suspicious
 */
export function validateInput(input: string, fieldName: string): void {
  if (containsSuspiciousPatterns(input)) {
    throw new Error(`Invalid input detected in ${fieldName}`)
  }
}
