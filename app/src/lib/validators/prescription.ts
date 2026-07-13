import { z } from "zod";

const prescriptionItemSchema = z.object({
  medicine_name: z.string().min(1, "Medicine name is required"),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  route: z.string().optional(),
  quantity: z.coerce.number().int().positive().optional(),
});

export const prescriptionSchema = z.object({
  visit_id: z.string().uuid(),
  diagnosis_id: z.string().uuid().nullable().optional(),
  instruction: z.string().max(2000, "Instruction too long").optional(),
  items: z
    .array(prescriptionItemSchema)
    .min(1, "At least one medicine item is required"),
});

export type PrescriptionInput = z.infer<typeof prescriptionSchema>;
export type PrescriptionItemInput = z.infer<typeof prescriptionItemSchema>;
