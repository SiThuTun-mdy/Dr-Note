"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/features/shared/StatusBadge";
import { DiagnosisPicker } from "./diagnosis-picker";
import { DiagnosisList } from "./diagnosis-list";
import { DiagnosisNote } from "./diagnosis-note";
import { PrescriptionForm } from "./prescription-form";
import { PrescriptionList } from "./prescription-list";
import { toast } from "sonner";
import {
  addDiagnosis,
  removeDiagnosis,
  getVisitPrescriptions,
  assignDoctorToVisit,
  completeVisit,
} from "@/app/(dashboard)/doctor/visits/[id]/actions";
import { getVisitAttachmentCount } from "@/app/(dashboard)/doctor/visits/[id]/attachments/actions";
import { AttachmentsDialog } from "@/components/features/attachments/attachments-dialog";

interface VisitData {
  id: string;
  doctor_id: string | null;
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
  currentUserId: string | null;
}

export function ConsultView({ visit, currentUserId }: ConsultViewProps) {
  const [diagnoses, setDiagnoses] = useState(visit.diagnoses);
  const [prescriptions, setPrescriptions] = useState<
    Array<{
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
    }>
  >([]);
  const [attachmentCount, setAttachmentCount] = useState(0);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(true);
  const [isLoadingAttachmentCount, setIsLoadingAttachmentCount] =
    useState(true);
  const isUnassigned = !visit.doctor_id;

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setIsLoadingPrescriptions(true);
      const data = await getVisitPrescriptions(visit.id);
      setPrescriptions(data);
      setIsLoadingPrescriptions(false);
    };
    const fetchAttachmentCount = async () => {
      setIsLoadingAttachmentCount(true);
      const count = await getVisitAttachmentCount(visit.id);
      setAttachmentCount(count);
      setIsLoadingAttachmentCount(false);
    };
    fetchPrescriptions();
    fetchAttachmentCount();
  }, [visit.id]);

  const handleAddDiagnosis = async (
    diagnosis: { id: string; code: string; title: string },
    type: string,
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
      // Add to local state without page reload
      setDiagnoses((prev) => [
        ...prev,
        {
          id: result.visit_diagnosis_id || crypto.randomUUID(),
          diagnosis_type: type as "primary" | "secondary" | "suspected",
          notes: null,
          diagnosis: {
            id: diagnosis.id,
            code: diagnosis.code,
            title: diagnosis.title,
          },
        },
      ]);
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
            <div className="flex items-center gap-2">
              {!visit.doctor_id && (
                <Button
                  size="sm"
                  onClick={async () => {
                    const result = await assignDoctorToVisit(visit.id);
                    if (result.error) {
                      toast.error(result.error);
                    } else {
                      toast.success("You are now assigned to this visit");
                      window.location.reload();
                    }
                  }}
                >
                  Assume care
                </Button>
              )}
              <StatusBadge
                status={
                  visit.status as
                    | "waiting"
                    | "screening"
                    | "with_doctor"
                    | "completed"
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">
                Visit type
              </p>
              <p>{visit.visit_type}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">
                Date
              </p>
              <p>{new Date(visit.created_at).toLocaleDateString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-muted-foreground">
                Chief complaint
              </p>
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
                <p className="text-xs font-semibold text-muted-foreground">
                  Height
                </p>
                <p>{visit.screening.height_cm} cm</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Weight
                </p>
                <p>{visit.screening.weight_kg} kg</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Blood pressure
                </p>
                <p>
                  {visit.screening.bp_systolic}/{visit.screening.bp_diastolic}{" "}
                  mmHg
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Heart rate
                </p>
                <p>{visit.screening.heart_rate} bpm</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Temperature
                </p>
                <p>{visit.screening.temperature_c}°C</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  SpO2
                </p>
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
        <DiagnosisList diagnoses={diagnoses} onRemove={handleRemoveDiagnosis} />
      </div>

      <div className="border-t" />

      {/* Diagnostic Note */}
      <DiagnosisNote
        visitId={visit.id}
        initialNote={visit.diagnosis_note || ""}
        disabled={isUnassigned}
      />

      <div className="border-t" />

      {/* Prescriptions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Prescriptions</h2>
        {isLoadingPrescriptions ? (
          <div className="text-sm text-muted-foreground">
            Loading prescriptions...
          </div>
        ) : (
          <PrescriptionList prescriptions={prescriptions} />
        )}
        <PrescriptionForm
          visitId={visit.id}
          doctorId={visit.doctor?.email || ""}
          diagnoses={visit.diagnoses.map((d) => d.diagnosis)}
          disabled={isUnassigned}
          onSuccess={() => {
            getVisitPrescriptions(visit.id).then(setPrescriptions);
          }}
        />
      </div>

      <div className="border-t" />

      {/* Attachments */}
      <div className="se-y-4pac ">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <h2 className="text-lg font-semibold">Attachments</h2>
          {!isLoadingAttachmentCount && (
            <AttachmentsDialog
              visitId={visit.id}
              attachmentCount={attachmentCount}
              disabled={isUnassigned}
            />
          )}
        </div>
      </div>

      {/* Complete visit */}
      {visit.doctor_id &&
        visit.doctor_id === currentUserId &&
        visit.status === "with_doctor" && (
          <>
            <div className="border-t" />
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
              <div>
                <p className="text-sm font-medium">
                  Ready to complete this visit?
                </p>
                <p className="text-xs text-muted-foreground">
                  Make sure you have added diagnoses, notes, and prescriptions.
                </p>
              </div>
              <Button
                variant="default"
                onClick={async () => {
                  const result = await completeVisit(visit.id);
                  if (result.error) {
                    toast.error(result.error);
                  } else {
                    toast.success("Visit completed");
                    window.location.reload();
                  }
                }}
              >
                Complete visit
              </Button>
            </div>
          </>
        )}
    </div>
  );
}
