import { z } from "zod"

export const visitCreationSchema = z.object({
  patientId: z.string().uuid("Please select a valid patient"),
  visitType: z.enum(["consultation", "follow_up", "emergency", "screening"], {
    message: "Please select a visit type",
  }),
  chiefComplaint: z
    .string()
    .min(1, "Chief complaint is required")
    .max(500, "Chief complaint must be under 500 characters"),
  doctorId: z.string().uuid().optional().nullable(),
})

export type VisitCreationInput = z.infer<typeof visitCreationSchema>
