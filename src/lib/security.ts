import { createClient } from '@/lib/supabase/server'

/**
 * Security middleware helpers
 * Use these for authentication and authorization checks
 */

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist'

/**
 * Check if user is authenticated
 */
export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized: Please log in')
  }

  return user
}

/**
 * Check if user has required role
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    throw new Error('Unauthorized: User profile not found')
  }

  if (!allowedRoles.includes(profile.role as UserRole)) {
    throw new Error(`Unauthorized: Required role: ${allowedRoles.join(' or ')}`)
  }

  return { user, profile }
}

/**
 * Check if user is admin
 */
export async function requireAdmin() {
  return requireRole(['admin'])
}

/**
 * Check if user is doctor
 */
export async function requireDoctor() {
  return requireRole(['doctor'])
}

/**
 * Check if user is nurse
 */
export async function requireNurse() {
  return requireRole(['nurse'])
}

/**
 * Check if user is receptionist
 */
export async function requireReceptionist() {
  return requireRole(['receptionist'])
}

/**
 * Check if user can access patient data
 */
export async function canAccessPatient(patientId: string): Promise<boolean> {
  const { user, profile } = await requireRole(['admin', 'doctor', 'nurse', 'receptionist'])
  const supabase = await createClient()

  // Admin can access all patients
  if (profile.role === 'admin') {
    return true
  }

  // Receptionist can access all patients
  if (profile.role === 'receptionist') {
    return true
  }

  // Nurse can access all patients
  if (profile.role === 'nurse') {
    return true
  }

  // Doctor can only access their assigned patients
  if (profile.role === 'doctor') {
    const { data, error } = await supabase
      .from('consultations')
      .select('id')
      .eq('patient_id', patientId)
      .eq('doctor_id', user.id)
      .limit(1)

    return !error && data && data.length > 0
  }

  return false
}

/**
 * Check if user can modify consultation
 */
export async function canModifyConsultation(consultationId: string): Promise<boolean> {
  const { user, profile } = await requireRole(['admin', 'doctor'])
  const supabase = await createClient()

  // Admin can modify all consultations
  if (profile.role === 'admin') {
    return true
  }

  // Doctor can only modify their own consultations
  if (profile.role === 'doctor') {
    const { data, error } = await supabase
      .from('consultations')
      .select('doctor_id')
      .eq('id', consultationId)
      .single()

    return !error && data?.doctor_id === user.id
  }

  return false
}

/**
 * Create security headers for API responses
 */
export function createSecurityHeaders(): Headers {
  const headers = new Headers()

  // Prevent XSS attacks
  headers.set('X-XSS-Protection', '1; mode=block')

  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff')

  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY')

  // Enable HSTS
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  // Control referrer information
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return headers
}

/**
 * Rate limiting using Redis (via @upstash/ratelimit)
 * Import from ./rate-limit.ts for specific use cases
 */
export { checkRateLimit, globalRatelimit, authRatelimit, strictRatelimit } from './rate-limit'
