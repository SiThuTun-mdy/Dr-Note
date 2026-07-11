import { z } from 'zod'

/**
 * Patient validation schema
 * Use this for all patient-related form submissions
 */
export const PatientSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),

  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),

  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),

  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),

  date_of_birth: z
    .date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .min(new Date('1900-01-01'), 'Date of birth must be after 1900'),

  gender: z.enum(['male', 'female', 'other'], {
    message: 'Gender is required',
  }),

  address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .or(z.literal('')),

  emergency_contact_name: z
    .string()
    .max(100, 'Emergency contact name must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  emergency_contact_phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),

  medical_history: z
    .string()
    .max(2000, 'Medical history must be less than 2000 characters')
    .optional()
    .or(z.literal('')),

  allergies: z
    .string()
    .max(1000, 'Allergies must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
})

export type PatientData = z.infer<typeof PatientSchema>

/**
 * Patient search validation schema
 */
export const PatientSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(255, 'Search query must be less than 255 characters'),
})

export type PatientSearchParams = z.infer<typeof PatientSearchSchema>
