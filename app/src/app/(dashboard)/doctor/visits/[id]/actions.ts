"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type DiagnosisType = "primary" | "secondary" | "suspected";

export interface AddDiagnosisInput {
  visit_id: string;
  diagnosis_id: string;
  diagnosis_type: DiagnosisType;
  notes?: string;
}

export interface RemoveDiagnosisInput {
  visit_diagnosis_id: string;
  visit_id: string;
}

export interface SaveDiagnosisNoteInput {
  visit_id: string;
  diagnosis_note: string;
}

export async function addDiagnosis(input: AddDiagnosisInput) {
  const supabase = await createClient();

  const { error } = await supabase.from("visit_diagnoses").insert({
    visit_id: input.visit_id,
    diagnosis_id: input.diagnosis_id,
    diagnosis_type: input.diagnosis_type,
    notes: input.notes || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "This diagnosis has already been added to this visit." };
    }
    return { error: "Failed to add diagnosis. Please try again." };
  }

  revalidatePath(`/doctor/visits/${input.visit_id}`);
  return { success: true };
}

export async function removeDiagnosis(input: RemoveDiagnosisInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("visit_diagnoses")
    .delete()
    .eq("id", input.visit_diagnosis_id);

  if (error) {
    return { error: "Failed to remove diagnosis. Please try again." };
  }

  revalidatePath(`/doctor/visits/${input.visit_id}`);
  return { success: true };
}

export async function saveDiagnosisNote(input: SaveDiagnosisNoteInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("visits")
    .update({ diagnosis_note: input.diagnosis_note })
    .eq("id", input.visit_id);

  if (error) {
    return { error: "Failed to save note. Please try again." };
  }

  revalidatePath(`/doctor/visits/${input.visit_id}`);
  return { success: true };
}

export async function searchDiagnoses(query: string) {
  const supabase = await createClient();

  let qb = supabase
    .from("diagnoses")
    .select("id, code, title")
    .order("code");

  if (query.trim()) {
    qb = qb.or(`code.ilike.%${query}%,title.ilike.%${query}%`);
  }

  const { data, error } = await qb.limit(20);

  if (error) {
    return [];
  }

  return data || [];
}

export async function getVisitWithDetails(visitId: string) {
  const supabase = await createClient();

  const { data: visit, error: visitError } = await supabase
    .from("visits")
    .select("*")
    .eq("id", visitId)
    .single();

  if (visitError || !visit) {
    return null;
  }

  // Fetch patient name
  const { data: patient } = await supabase
    .from("users")
    .select("name, email")
    .eq("id", visit.patient_id)
    .single();

  // Fetch doctor name if assigned
  let doctor = null;
  if (visit.doctor_id) {
    const { data } = await supabase
      .from("users")
      .select("name, email")
      .eq("id", visit.doctor_id)
      .single();
    doctor = data;
  }

  const { data: screening } = await supabase
    .from("screenings")
    .select("*")
    .eq("visit_id", visitId)
    .single();

  const { data: diagnoses } = await supabase
    .from("visit_diagnoses")
    .select("*, diagnosis:diagnoses(id, code, title)")
    .eq("visit_id", visitId);

  return {
    ...visit,
    patient,
    doctor,
    screening,
    diagnoses: diagnoses || [],
  };
}
