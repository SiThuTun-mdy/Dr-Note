/**
 * Shared type for visit summary data.
 * Used by both the server action and the presentation component.
 */
export interface VisitSummaryData {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  status: string;
  chief_complaint: string;
  diagnosis_note: string | null;
  visit_date: string | null;
  visit_type: string;
  created_at: string;
  patient: { name: string; email: string } | null;
  doctor: { name: string; email: string } | null;
  screening: {
    height_cm: number | null;
    weight_kg: number | null;
    bmi: number | null;
    bp_systolic: number | null;
    bp_diastolic: number | null;
    heart_rate: number | null;
    temperature_c: number | null;
    oxygen_saturation: number | null;
  } | null;
  diagnoses: Array<{
    id: string;
    diagnosis_type: string;
    notes: string | null;
    diagnosis: { id: string; code: string; title: string };
  }>;
  prescriptions: Array<{
    id: string;
    instruction: string | null;
    created_at: string;
    diagnosis: { code: string; title: string } | null;
    items: Array<{
      id: string;
      medicine_name: string;
      dosage: string | null;
      frequency: string | null;
      duration: string | null;
      route: string | null;
      quantity: number | null;
    }>;
  }>;
}
