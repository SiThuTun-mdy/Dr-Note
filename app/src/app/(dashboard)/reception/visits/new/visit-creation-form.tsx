"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Search, User, X } from "lucide-react"
import { toast } from "sonner"
import { isRedirectError } from "next/dist/client/components/redirect-error"

import { createVisit, searchPatients, searchDoctors } from "./actions"
import {
  visitCreationSchema,
  type VisitCreationInput,
} from "@/lib/validators/visit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDebounce } from "@/hooks/use-debounce"

interface Patient {
  id: string
  name: string
  email: string
  nrc: string | null
}

interface Doctor {
  id: string
  name: string
  email: string
}

interface VisitCreationFormProps {
  prefillPatient?: Patient | null
}

export function VisitCreationForm({ prefillPatient }: VisitCreationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patientQuery, setPatientQuery] = useState("")
  const [patientResults, setPatientResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(prefillPatient ?? null)
  const [doctorQuery, setDoctorQuery] = useState("")
  const [doctorResults, setDoctorResults] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [isSearchingPatient, setIsSearchingPatient] = useState(false)
  const [isSearchingDoctor, setIsSearchingDoctor] = useState(false)
  const debouncedDoctorQuery = useDebounce(doctorQuery, 300)

  const form = useForm<VisitCreationInput>({
    resolver: zodResolver(visitCreationSchema),
    defaultValues: {
      patientId: prefillPatient?.id ?? "",
      visitType: undefined,
      chiefComplaint: "",
      doctorId: null,
    },
  })


  const handlePatientSearch = useCallback(async (query: string) => {
    setPatientQuery(query)
    if (query.length < 2) {
      setPatientResults([])
      return
    }

    setIsSearchingPatient(true)
    try {
      const results = await searchPatients(query)
      setPatientResults(results)
    } catch {
      setPatientResults([])
    } finally {
      setIsSearchingPatient(false)
    }
  }, [])

  const handleDoctorSearch = useCallback(async (query: string) => {
    setDoctorQuery(query)
  }, [])

  // Trigger doctor search when debounced query changes
  useEffect(() => {
    if (debouncedDoctorQuery.length < 2) {
      setDoctorResults([])
      return
    }

    let cancelled = false
    setIsSearchingDoctor(true)

    searchDoctors(debouncedDoctorQuery)
      .then((results) => {
        if (!cancelled) setDoctorResults(results)
      })
      .catch(() => {
        if (!cancelled) setDoctorResults([])
      })
      .finally(() => {
        if (!cancelled) setIsSearchingDoctor(false)
      })

    return () => { cancelled = true }
  }, [debouncedDoctorQuery])

  const selectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setDoctorResults([])
    setDoctorQuery("")
    form.setValue("doctorId", doctor.id)
  }

  const clearDoctor = () => {
    setSelectedDoctor(null)
    form.setValue("doctorId", null)
  }

  async function onSubmit(values: VisitCreationInput) {
    setIsSubmitting(true)
    try {
      const result = await createVisit(values)

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof VisitCreationInput, { message })
          }
        }
        toast.error(result.error || "Unable to create visit. Please try again.")
        return
      }

      toast.success("Visit created successfully")
    } catch (err) {
      if (isRedirectError(err)) throw err
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">New Visit</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Patient Search */}
            <Controller
              control={form.control}
              name="patientId"
              render={({ field, fieldState }) => (

                <div className="space-y-2">
                  <label className="text-sm font-medium">Patient *</label>
                  {/* Hidden input keeps the registered field in the DOM for native form submit */}
                  <input type="hidden" {...field} />
                  {selectedPatient ? (
                    <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{selectedPatient.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedPatient.email}
                            {selectedPatient.nrc && ` · NRC: ${selectedPatient.nrc}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(null)
                          field.onChange("")
                        }}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, or NRC..."
                        value={patientQuery}
                        onChange={(e) => handlePatientSearch(e.target.value)}
                        className="pl-9"
                        disabled={isSubmitting}
                      />
                      {isSearchingPatient && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {patientResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                          {patientResults.map((patient) => (
                            <button
                              key={patient.id}
                              type="button"
                              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                              onClick={() => {
                                setSelectedPatient(patient)
                                setPatientResults([])
                                setPatientQuery("")
                                field.onChange(patient.id)
                              }}
                            >
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{patient.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {patient.email}
                                  {patient.nrc && ` · NRC: ${patient.nrc}`}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {fieldState.error && (
                    <p className="text-sm text-destructive">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />

            {/* Visit Type */}
            <FormField
              control={form.control}
              name="visitType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visit Type *</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select visit type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="screening">Screening</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Chief Complaint */}
            <FormField
              control={form.control}
              name="chiefComplaint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chief Complaint *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the patient's main concern..."
                      rows={3}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Doctor Search (Optional) */}
            <FormField
              control={form.control}
              name="doctorId"
              render={() => (
                <FormItem>
                  <FormLabel>Assign Doctor (optional)</FormLabel>
                  <FormControl>
                    {selectedDoctor ? (
                      <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{selectedDoctor.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {selectedDoctor.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearDoctor}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by doctor name or email..."
                          value={doctorQuery}
                          onChange={(e) => handleDoctorSearch(e.target.value)}
                          className="pl-9"
                          disabled={isSubmitting}
                        />
                        {isSearchingDoctor && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {doctorResults.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                            {doctorResults.map((doctor) => (
                              <button
                                key={doctor.id}
                                type="button"
                                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                                onClick={() => selectDoctor(doctor)}
                              >
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">{doctor.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {doctor.email}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Visit"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
