"use server";

import { createClient } from "@/lib/supabase/server";
import type { VisitSummaryData } from "@/types/visit-summary";

/**
 * Fetch complete visit summary data including screening, diagnoses,
 * and prescriptions. Returns null if visit not found or user lacks access.
 * RLS enforced — receptionist will get null (no matching rows).
 */
export async function getVisitSummary(visitId: string): Promise<VisitSummaryData | null> {
  const supabase = await createClient();

  // 1. Fetch visit — RLS filters by role (doctor/admin only)
  const { data: visit, error: visitError } = await supabase
    .from("visits")
    .select("*")
    .eq("id", visitId)
    .single();

  if (visitError || !visit) {
    return null;
  }

  // 2. Fetch related data in parallel (all depend only on visit data already fetched)
  const [patientResult, doctorResult, screeningResult, diagnosesResult, prescriptionsResult] =
    await Promise.all([
      // Patient name
      supabase
        .from("users")
        .select("name, email")
        .eq("id", visit.patient_id)
        .single(),
      // Doctor name if assigned
      visit.doctor_id
        ? supabase
            .from("users")
            .select("name, email")
            .eq("id", visit.doctor_id)
            .single()
        : Promise.resolve({ data: null, error: null }),
      // Screening vitals
      supabase
        .from("screenings")
        .select("*")
        .eq("visit_id", visitId)
        .single(),
      // Diagnoses with diagnosis details
      supabase
        .from("visit_diagnoses")
        .select("*, diagnosis:diagnoses(id, code, title)")
        .eq("visit_id", visitId),
      // Prescriptions with items
      supabase
        .from("prescriptions")
        .select(
          `
          *,
          items:prescription_items(*),
          diagnosis:diagnoses(id, code, title)
        `
        )
        .eq("visit_id", visitId)
        .order("created_at", { ascending: false }),
    ]);

  return {
    ...visit,
    patient: patientResult.data,
    doctor: doctorResult.data,
    screening: screeningResult.data,
    diagnoses: diagnosesResult.data || [],
    prescriptions: prescriptionsResult.data || [],
  };
}
