"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { screeningSchema, type ScreeningInput } from "@/lib/validators/screening"
import { createScreening } from "./actions"

// ---------------------------------------------------------------------------
// Field config — unit suffixes per design system §5
// ---------------------------------------------------------------------------

interface FieldConfig {
  name: keyof ScreeningInput
  label: string
  suffix: string
  placeholder: string
  pair?: "start" | "end" // for side-by-side fields
  integer?: true // smallint in DB — step="1"
}

const VITAL_FIELDS: FieldConfig[] = [
  { name: "height_cm", label: "Height", suffix: "cm", placeholder: "170", pair: "start" },
  { name: "weight_kg", label: "Weight", suffix: "kg", placeholder: "65", pair: "end" },
  { name: "bp_systolic", label: "BP systolic", suffix: "mmHg", placeholder: "120", pair: "start", integer: true },
  { name: "bp_diastolic", label: "BP diastolic", suffix: "mmHg", placeholder: "80", pair: "end", integer: true },
  { name: "heart_rate", label: "Heart rate", suffix: "bpm", placeholder: "72", integer: true },
  { name: "temperature_c", label: "Temperature", suffix: "°C", placeholder: "36.5" },
  { name: "oxygen_saturation", label: "O₂ saturation", suffix: "%", placeholder: "98", integer: true },
]

// ---------------------------------------------------------------------------
// ScreeningForm component
// ---------------------------------------------------------------------------

export default function ScreeningPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const visitId = params.id

  const form = useForm<ScreeningInput>({
    resolver: zodResolver(screeningSchema),
    defaultValues: {
      height_cm: undefined,
      weight_kg: undefined,
      bp_systolic: undefined,
      bp_diastolic: undefined,
      heart_rate: undefined,
      temperature_c: undefined,
      oxygen_saturation: undefined,
    },
  })

  const [submitting, setSubmitting] = useState(false)

  // Live BMI calculation from height/weight
  const height = form.watch("height_cm")
  const weight = form.watch("weight_kg")
  const bmi = useMemo(() => {
    if (!height || !weight || height <= 0) return null
    return (weight / Math.pow(height / 100, 2)).toFixed(1)
  }, [height, weight])

  // -----------------------------------------------------------------------
  // Submit
  // -----------------------------------------------------------------------

  async function onSubmit(values: ScreeningInput) {
    setSubmitting(true)
    try {
      const result = await createScreening(visitId, values)
      if (result.success) {
        toast.success("Screening recorded", {
          description: result.doctorAssigned
            ? "Visit advanced to doctor consultation."
            : "Vitals saved. Assign a doctor to proceed.",
        })
        router.push("/screening")
      } else {
        toast.error(result.error || "Failed to save screening")
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // -----------------------------------------------------------------------
  // Render grouped fields (pairs on one row, singles stacked)
  // -----------------------------------------------------------------------

  function renderFields() {
    const groups: Array<{ pair?: string; fields: FieldConfig[] }> = []
    let current: { pair?: string; fields: FieldConfig[] } | null = null

    for (const field of VITAL_FIELDS) {
      if (field.pair) {
        // Start a new pair group
        if (!current || current.pair !== field.pair || current.fields.length >= 2) {
          current = { pair: field.pair, fields: [field] }
          groups.push(current)
        } else {
          current.fields.push(field)
        }
      } else {
        // Single field — flush current pair
        current = null
        groups.push({ fields: [field] })
      }
    }

    return groups.map((group, gi) => (
      <div
        key={gi}
        className={`grid gap-4 ${
          group.fields.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {group.fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: rhfField }) => (
              <FormItem>
                <FormLabel>
                  {field.label}
                  <span className="text-muted-foreground ml-1 text-xs font-normal">
                    ({field.suffix})
                  </span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step={field.integer ? "1" : "any"}
                      placeholder={field.placeholder}
                      {...rhfField}
                      value={rhfField.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value
                        rhfField.onChange(val === "" ? undefined : Number(val))
                      }}
                      className="pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      {field.suffix}
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    ))
  }

  return (
    <div className="max-w-lg space-y-6">
      {/* Back link */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/queue")}
        className="gap-1 px-0"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to queue
      </Button>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">Screening vitals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record patient vitals before doctor consultation.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Vital signs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderFields()}
            </CardContent>
          </Card>

          {/* Live BMI display */}
          {bmi && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    BMI (calculated)
                  </span>
                  <span className="text-2xl font-semibold text-foreground">{bmi}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <div className="flex justify-start">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save screening"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
