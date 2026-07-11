import { z } from 'zod'

/**
 * Consultation validation schema
 * Use this for all consultation-related form submissions
 */
export const ConsultationSchema = z.object({
  patient_id: z
    .string()
    .uuid('Invalid patient ID'),

  doctor_id: z
    .string()
    .uuid('Invalid doctor ID')
    .optional(), // Will be set from session

  consultation_date: z
    .date()
    .max(new Date(), 'Consultation date cannot be in the future'),

  chief_complaint: z
    .string()
    .min(1, 'Chief complaint is required')
    .max(1000, 'Chief complaint must be less than 1000 characters'),

  symptoms: z
    .string()
    .max(2000, 'Symptoms must be less than 2000 characters')
    .optional()
    .or(z.literal('')),

  diagnosis: z
    .string()
    .min(1, 'Diagnosis is required')
    .max(1000, 'Diagnosis must be less than 1000 characters'),

  treatment_plan: z
    .string()
    .max(2000, 'Treatment plan must be less than 2000 characters')
    .optional()
    .or(z.literal('')),

  notes: z
    .string()
    .max(5000, 'Notes must be less than 5000 characters')
    .optional()
    .or(z.literal('')),

  // Prescription fields
  prescription_items: z
    .array(
      z.object({
        medication_name: z
          .string()
          .min(1, 'Medication name is required')
          .max(200, 'Medication name must be less than 200 characters'),
        dosage: z
          .string()
          .min(1, 'Dosage is required')
          .max(100, 'Dosage must be less than 100 characters'),
        frequency: z
          .string()
          .min(1, 'Frequency is required')
          .max(100, 'Frequency must be less than 100 characters'),
        duration: z
          .string()
          .max(100, 'Duration must be less than 100 characters')
          .optional()
          .or(z.literal('')),
        instructions: z
          .string()
          .max(500, 'Instructions must be less than 500 characters')
          .optional()
          .or(z.literal('')),
      })
    )
    .optional()
    .default([]),

  // Validation: If prescription items exist, diagnosis is required
}).refine(
  (data) => {
    if (data.prescription_items && data.prescription_items.length > 0) {
      return data.diagnosis && data.diagnosis.length > 0
    }
    return true
  },
  {
    message: 'Diagnosis is required when prescribing medication',
    path: ['diagnosis'],
  }
)

export type ConsultationData = z.infer<typeof ConsultationSchema>

/**
 * Consultation search validation schema
 */
export const ConsultationSearchSchema = z.object({
  patient_id: z
    .string()
    .uuid('Invalid patient ID')
    .optional(),
  doctor_id: z
    .string()
    .uuid('Invalid doctor ID')
    .optional(),
  date_from: z
    .date()
    .optional(),
  date_to: z
    .date()
    .optional(),
})

export type ConsultationSearchParams = z.infer<typeof ConsultationSearchSchema>
