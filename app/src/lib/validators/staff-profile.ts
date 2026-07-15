import { z } from "zod"

export const staffProfileUpdateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  phone: z.string().max(30).optional().or(z.literal("")),
  // Work fields are applied only when the caller is an admin; other users'
  // submissions ignore them server-side.
  staff_code: z
    .string()
    .trim()
    .max(50)
    .regex(
      /^[A-Za-z0-9_-]*$/,
      "Only letters, numbers, hyphens and underscores"
    )
    .optional()
    .or(z.literal("")),
  department: z.string().trim().max(100).optional().or(z.literal("")),
})

export type StaffProfileUpdateInput = z.infer<typeof staffProfileUpdateSchema>
