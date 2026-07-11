import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export interface AuditLogEntry {
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  details?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
}

/**
 * Audit logging for sensitive operations
 * Use this to track all critical changes in the system
 */
export async function auditLog(
  action: string,
  resourceType: string,
  resourceId: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('Audit log failed: No authenticated user')
      return
    }

    const headerStore = await headers()
    const ipAddress = headerStore.get('x-forwarded-for') || 'unknown'
    const userAgent = headerStore.get('user-agent') || 'unknown'

    const logEntry: AuditLogEntry = {
      user_id: user.id,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      ip_address: ipAddress,
      user_agent: userAgent,
    }

    const { error } = await supabase
      .from('audit_logs')
      .insert(logEntry)

    if (error) {
      console.error('Audit log error:', error)
    }
  } catch (error) {
    console.error('Audit log failed:', error)
  }
}

/**
 * Audit action types
 */
export const AuditActions = {
  // Patient actions
  PATIENT_CREATE: 'patient.create',
  PATIENT_UPDATE: 'patient.update',
  PATIENT_DELETE: 'patient.delete',
  PATIENT_VIEW: 'patient.view',

  // Consultation actions
  CONSULTATION_CREATE: 'consultation.create',
  CONSULTATION_UPDATE: 'consultation.update',
  CONSULTATION_DELETE: 'consultation.delete',
  CONSULTATION_VIEW: 'consultation.view',

  // User actions
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',

  // Admin actions
  ADMIN_ROLE_CHANGE: 'admin.role_change',
  ADMIN_SETTINGS_UPDATE: 'admin.settings_update',
} as const

export type AuditAction = typeof AuditActions[keyof typeof AuditActions]
