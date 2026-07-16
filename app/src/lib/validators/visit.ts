import { z } from "zod"

// Lenient UUID regex — matches the 8-4-4-4-12 hex format PostgreSQL stores,
// without requiring RFC 9562 version/variant bits (which Zod v4's .uuid() enforces).
const uuidLenient = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "Please select a valid patient",
  )

export const visitCreationSchema = z.object({
  patientId: uuidLenient,
  visitType: z.enum(["consultation", "follow_up", "emergency", "screening"], {
    message: "Please select a visit type",
  }),
  chiefComplaint: z
    .string()
    .min(1, "Chief complaint is required")
    .max(500, "Chief complaint must be under 500 characters"),
  doctorId: z.string().regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  ).optional().nullable(),
})

export type VisitCreationInput = z.infer<typeof visitCreationSchema>
