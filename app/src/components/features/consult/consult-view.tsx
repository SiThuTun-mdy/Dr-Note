"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DiagnosisPicker } from "./diagnosis-picker";
import { DiagnosisList } from "./diagnosis-list";
import { DiagnosisNote } from "./diagnosis-note";
import { toast } from "sonner";
import { addDiagnosis, removeDiagnosis } from "@/app/(dashboard)/doctor/visits/[id]/actions";

interface VisitData {
  id: string;
  chief_complaint: string;
  visit_type: string;
  status: string;
  diagnosis_note: string | null;
  created_at: string;
  patient: { name: string; email: string } | null;
  doctor: { name: string; email: string } | null;
  screening: {
    height_cm: number;
    weight_kg: number;
    bp_systolic: number;
    bp_diastolic: number;
    heart_rate: number;
    temperature_c: number;
    oxygen_saturation: number;
  } | null;
  diagnoses: Array<{
    id: string;
    diagnosis_type: string;
    notes: string | null;
    diagnosis: { id: string; code: string; title: string };
  }>;
}

interface ConsultViewProps {
  visit: VisitData;
}

const statusBadgeClasses: Record<string, string> = {
  waiting: "bg-amber-100 text-amber-800",
  screening: "bg-sky-100 text-sky-800",
  with_doctor: "bg-violet-100 text-violet-800",
  completed: "bg-green-100 text-green-800",
};

export function ConsultView({ visit }: ConsultViewProps) {
  const [diagnoses, setDiagnoses] = useState(visit.diagnoses);

  const handleAddDiagnosis = async (
    diagnosis: { id: string; code: string; title: string },
    type: string
  ) => {
    const result = await addDiagnosis({
      visit_id: visit.id,
      diagnosis_id: diagnosis.id,
      diagnosis_type: type as "primary" | "secondary" | "suspected",
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Added ${diagnosis.code} as ${type} diagnosis`);
      // Re-fetch to get the full diagnosis data
      window.location.reload();
    }
  };

  const handleRemoveDiagnosis = async (visitDiagnosisId: string) => {
    const result = await removeDiagnosis({
      visit_diagnosis_id: visitDiagnosisId,
      visit_id: visit.id,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      setDiagnoses((prev) => prev.filter((d) => d.id !== visitDiagnosisId));
      toast.success("Diagnosis removed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Consult View</h1>
        <p className="text-muted-foreground">
          Diagnosis entry and diagnostic notes
        </p>
      </div>

      {/* Patient Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {visit.patient?.name || "Unknown Patient"}
            </CardTitle>
            <Badge
              variant="secondary"
              className={statusBadgeClasses[visit.status]}
            >
              {visit.status.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Visit type</p>
              <p>{visit.visit_type}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Date</p>
              <p>{new Date(visit.created_at).toLocaleDateString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-muted-foreground">Chief complaint</p>
              <p>{visit.chief_complaint}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Screening Vitals */}
      {visit.screening && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Screening Vitals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Height</p>
                <p>{visit.screening.height_cm} cm</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Weight</p>
                <p>{visit.screening.weight_kg} kg</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Blood pressure</p>
                <p>{visit.screening.bp_systolic}/{visit.screening.bp_diastolic} mmHg</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Heart rate</p>
                <p>{visit.screening.heart_rate} bpm</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Temperature</p>
                <p>{visit.screening.temperature_c}°C</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">SpO2</p>
                <p>{visit.screening.oxygen_saturation}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="border-t" />

      {/* Diagnosis Entry */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Diagnoses</h2>
        <DiagnosisPicker onAdd={handleAddDiagnosis} />
        <DiagnosisList
          diagnoses={diagnoses}
          onRemove={handleRemoveDiagnosis}
        />
      </div>

      <div className="border-t" />

      {/* Diagnostic Note */}
      <DiagnosisNote
        visitId={visit.id}
        initialNote={visit.diagnosis_note || ""}
      />
    </div>
  );
}
