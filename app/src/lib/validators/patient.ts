import { z } from "zod"

export const genderOptions = ["male", "female", "other"] as const

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
    .refine((value) => new Date(value) <= new Date(), "Date of birth cannot be in the future"),
  gender: z.enum(genderOptions, {
    message: "Please select a gender",
  }),
  nrc: z.string().max(50).optional().or(z.literal("")),
  religion: z.string().max(100).optional().or(z.literal("")),
  ethnicity: z.string().max(100).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
})

export type PatientRegistrationInput = z.infer<typeof patientRegistrationSchema>

export const emergencyContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  relationship: z.string().max(100).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
})

export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>
