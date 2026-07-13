"use server";

import { createClient } from "@/lib/supabase/server";
import { prescriptionSchema } from "@/lib/validators/prescription";
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

  const { data, error } = await supabase.from("visit_diagnoses").insert({
    visit_id: input.visit_id,
    diagnosis_id: input.diagnosis_id,
    diagnosis_type: input.diagnosis_type,
  }).select("id").single();

  if (error) {
    if (error.code === "23505") {
      return { error: "This diagnosis has already been added to this visit." };
    }
    return { error: "Failed to add diagnosis. Please try again." };
  }

  revalidatePath(`/doctor/visits/${input.visit_id}`);
  return { success: true, visit_diagnosis_id: data?.id };
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

// Prescription actions

export interface CreatePrescriptionInput {
  visit_id: string;
  doctor_id: string;
  diagnosis_id?: string | null;
  instruction?: string;
  items: Array<{
    medicine_name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    route?: string;
    quantity?: number;
  }>;
}

export async function createPrescription(input: CreatePrescriptionInput) {
  const supabase = await createClient();

  // Step 1: Server-side input validation
  const parsed = prescriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input. Please check all fields." };
  }

  // Step 2: Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Authentication required." };
  }

  // Step 3: Verify doctor is assigned to this visit
  const { data: visit, error: visitError } = await supabase
    .from("visits")
    .select("doctor_id")
    .eq("id", input.visit_id)
    .single();

  if (visitError || !visit) {
    return { error: "Visit not found." };
  }

  if (visit.doctor_id !== user.id) {
    return { error: "You are not authorized to create prescriptions for this visit." };
  }

  // Step 4: Create prescription header (using auth.uid() for doctor_id)
  const { data: prescription, error: prescriptionError } = await supabase
    .from("prescriptions")
    .insert({
      visit_id: input.visit_id,
      doctor_id: user.id, // Use authenticated user ID, not client-provided
      diagnosis_id: input.diagnosis_id || null,
      instruction: input.instruction || null,
    })
    .select("id")
    .single();

  if (prescriptionError || !prescription) {
    return { error: "Failed to create prescription. Please try again." };
  }

  // Step 5: Create prescription items
  const items = input.items.map((item) => ({
    prescription_id: prescription.id,
    medicine_name: item.medicine_name,
    dosage: item.dosage || null,
    frequency: item.frequency || null,
    duration: item.duration || null,
    route: item.route || null,
    quantity: item.quantity || null,
  }));

  const { error: itemsError } = await supabase
    .from("prescription_items")
    .insert(items);

  if (itemsError) {
    return { error: "Failed to add prescription items. Please try again." };
  }

  revalidatePath(`/doctor/visits/${input.visit_id}`);
  return { success: true, prescription_id: prescription.id };
}

export async function getVisitPrescriptions(visitId: string) {
  const supabase = await createClient();

  const { data: prescriptions, error } = await supabase
    .from("prescriptions")
    .select(
      `
      *,
      items:prescription_items(*),
      diagnosis:diagnoses(id, code, title)
    `
    )
    .eq("visit_id", visitId)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return prescriptions || [];
}
