import { z } from "zod"

export const genderOptions = ["male", "female", "other"] as const

// Enterprise DOB constraints
const DOB_MIN_DATE = "1900-01-01"
const DOB_MAX_AGE_YEARS = 120

function isValidDOB(value: string): boolean {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const now = new Date()
  // Must not be in the future
  if (date > now) return false
  // Must not be before 1900-01-01
  if (date < new Date(DOB_MIN_DATE)) return false
  // Must not be older than 120 years
  const ageMs = now.getTime() - date.getTime()
  const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000)
  if (ageYears > DOB_MAX_AGE_YEARS) return false
  return true
}

export const patientRegistrationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z.string().max(30).optional().or(z.literal("")),
  dob: z
    .string()
    .min(1, "Date of birth is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date")
    .refine((value: string) => isValidDOB(value), {
      message: "Please enter a valid date of birth (must be between 1900 and today, max age 120)",
    }),
  gender: z.enum(genderOptions, {
    message: "Please select a gender",
  }),
  nrc: z.string().max(50).optional().or(z.literal("")),
  religion: z.string().max(100).optional().or(z.literal("")),
  ethnicity: z.string().max(100).optional().or(z.literal("")),
  address: z.string().min(1, "Address is required").max(500),
})

export type PatientRegistrationInput = z.infer<typeof patientRegistrationSchema>

export const patientProfileUpdateSchema = patientRegistrationSchema
  .omit({ email: true })
  .extend({
    dob: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date")
      .refine((value: string) => isValidDOB(value), {
        message: "Please enter a valid date of birth (must be between 1900 and today, max age 120)",
      })
      .optional()
      .or(z.literal("")),
    gender: z.enum(genderOptions, { message: "Please select a gender" }).optional().or(z.literal("")),
    address: z.string().max(500).optional().or(z.literal("")),
  })

export type PatientProfileUpdateInput = z.infer<typeof patientProfileUpdateSchema>

export const emergencyContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  relationship: z.string().max(100).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
})

export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>
