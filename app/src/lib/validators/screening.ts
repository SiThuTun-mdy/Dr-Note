import { z } from "zod"

export const screeningSchema = z.object({
  height_cm: z
    .number({ message: "Required" })
    .min(20, "Height must be at least 20 cm")
    .max(300, "Height must be at most 300 cm"),

  weight_kg: z
    .number({ message: "Required" })
    .min(0.5, "Weight must be at least 0.5 kg")
    .max(500, "Weight must be at most 500 kg"),

  bp_systolic: z
    .number({ message: "Required" })
    .int("Must be a whole number")
    .min(40, "Systolic must be at least 40 mmHg")
    .max(300, "Systolic must be at most 300 mmHg"),

  bp_diastolic: z
    .number({ message: "Required" })
    .int("Must be a whole number")
    .min(20, "Diastolic must be at least 20 mmHg")
    .max(200, "Diastolic must be at most 200 mmHg"),

  heart_rate: z
    .number({ message: "Required" })
    .int("Must be a whole number")
    .min(20, "Heart rate must be at least 20 bpm")
    .max(300, "Heart rate must be at most 300 bpm"),

  temperature_c: z
    .number({ message: "Required" })
    .min(30, "Temperature must be at least 30°C")
    .max(45, "Temperature must be at most 45°C"),

  oxygen_saturation: z
    .number({ message: "Required" })
    .int("Must be a whole number")
    .min(30, "O₂ saturation must be at least 30%")
    .max(100, "O₂ saturation must be at most 100%"),
})

export type ScreeningInput = z.infer<typeof screeningSchema>
