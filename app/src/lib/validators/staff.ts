import { z } from "zod"

export const staffRoleOptions = [
  "doctor",
  "nurse",
  "receptionist",
  "admin",
] as const

export const staffOnboardingSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z.string().max(30).optional().or(z.literal("")),
  staff_code: z
    .string()
    .trim()
    .min(1, "License number is required")
    .regex(/^\d{10}$/, "License number must be exactly 10 digits"),
  department: z.string().trim().min(1, "Department is required").max(100),
  role: z.enum(staffRoleOptions, {
    message: "Please select a role",
  }),
})

export type StaffOnboardingInput = z.infer<typeof staffOnboardingSchema>
