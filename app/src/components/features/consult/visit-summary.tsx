"use client";

import { useState, useEffect } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VisitSummaryData } from "@/types/visit-summary";

interface VisitSummaryProps {
  data: VisitSummaryData;
}

// ---------------------------------------------------------------------------
// Diagnosis type badge colors — primary=blue, secondary=gray, suspected=amber
// ---------------------------------------------------------------------------

const diagnosisBadgeClasses: Record<string, string> = {
  primary: "bg-blue-100 text-blue-800",
  secondary: "bg-gray-100 text-gray-700",
  suspected: "bg-amber-100 text-amber-800",
};

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// VisitSummary component
// ---------------------------------------------------------------------------

export function VisitSummary({ data }: VisitSummaryProps) {
  const visitDate = data.visit_date || data.created_at;
  const [generatedAt, setGeneratedAt] = useState<string>("");

  // Avoid hydration mismatch by computing date on client
  useEffect(() => {
    setGeneratedAt(formatDateTime(new Date().toISOString()));
  }, []);

  return (
    <>
      {/* Print styles */}
      <style>{printStyles}</style>

      {/* Print button — hidden in print */}
      <div className="no-print mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Visit summary
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data.patient?.name || "Unknown patient"} &mdash;{" "}
            {formatDate(visitDate)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="gap-1.5"
        >
          <Printer className="h-4 w-4" />
          Print summary
        </Button>
      </div>

      {/* Printable content */}
      <div className="visit-summary-content space-y-6">
        {/* Clinic header — visible only in print */}
        <div className="print-only text-center mb-6">
          <h1 className="text-xl font-bold">Dr.Note</h1>
          <p className="text-sm text-gray-500">Visit Summary</p>
        </div>

        {/* Section 1: Patient Header */}
        <section className="summary-section">
          <h2 className="summary-heading">Patient information</h2>
          <div className="summary-grid">
            <div>
              <span className="summary-label">Patient name</span>
              <span className="summary-value">
                {data.patient?.name || "Unknown"}
              </span>
            </div>
            <div>
              <span className="summary-label">Visit date</span>
              <span className="summary-value">{formatDate(visitDate)}</span>
            </div>
            <div>
              <span className="summary-label">Visit type</span>
              <span className="summary-value">{data.visit_type}</span>
            </div>
            <div>
              <span className="summary-label">Status</span>
              <span className="summary-value capitalize">
                {data.status.replaceAll("_", " ")}
              </span>
            </div>
            <div className="col-span-2">
              <span className="summary-label">Chief complaint</span>
              <span className="summary-value">{data.chief_complaint}</span>
            </div>
          </div>
        </section>

        {/* Section 2: Screening Vitals */}
        {data.screening && (
          <section className="summary-section">
            <h2 className="summary-heading">Screening vitals</h2>
            <div className="summary-grid grid-cols-3">
              <VitalField
                label="Height"
                value={data.screening.height_cm}
                unit="cm"
              />
              <VitalField
                label="Weight"
                value={data.screening.weight_kg}
                unit="kg"
              />
              <VitalField
                label="BMI"
                value={data.screening.bmi}
                unit=""
              />
              <VitalField
                label="Blood pressure"
                value={
                  data.screening.bp_systolic != null &&
                  data.screening.bp_diastolic != null
                    ? `${data.screening.bp_systolic}/${data.screening.bp_diastolic}`
                    : null
                }
                unit="mmHg"
              />
              <VitalField
                label="Heart rate"
                value={data.screening.heart_rate}
                unit="bpm"
              />
              <VitalField
                label="Temperature"
                value={data.screening.temperature_c}
                unit={"°C"}
              />
              <VitalField
                label="SpO2"
                value={data.screening.oxygen_saturation}
                unit="%"
              />
            </div>
          </section>
        )}

        {/* Section 3: Diagnostic Note */}
        {data.diagnosis_note && (
          <section className="summary-section">
            <h2 className="summary-heading">Diagnostic note</h2>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {data.diagnosis_note}
            </p>
          </section>
        )}

        {/* Section 4: Diagnoses */}
        {data.diagnoses.length > 0 && (
          <section className="summary-section">
            <h2 className="summary-heading">Diagnoses</h2>
            <ul className="space-y-2">
              {data.diagnoses.map((vd) => (
                <li key={vd.id} className="flex items-start gap-2 text-sm">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${
                      diagnosisBadgeClasses[vd.diagnosis_type] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {vd.diagnosis_type}
                  </span>
                  <span>
                    <span className="font-medium">
                      {vd.diagnosis.code}
                    </span>{" "}
                    &mdash; {vd.diagnosis.title}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Section 5: Prescription */}
        <section className="summary-section">
          <h2 className="summary-heading">Prescription</h2>
          {data.prescriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No prescription recorded for this visit.
            </p>
          ) : (
            <div className="space-y-6">
              {data.prescriptions.map((rx) => (
                <div key={rx.id} className="space-y-3">
                  {/* Prescription instruction */}
                  {rx.instruction && (
                    <div>
                      <span className="summary-label">Instruction</span>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {rx.instruction}
                      </p>
                    </div>
                  )}

                  {/* Prescription items table */}
                  {rx.items.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medicine</TableHead>
                          <TableHead>Dosage</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead className="text-right">
                            Quantity
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rx.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.medicine_name}
                            </TableCell>
                            <TableCell>{item.dosage || "—"}</TableCell>
                            <TableCell>{item.frequency || "—"}</TableCell>
                            <TableCell>{item.duration || "—"}</TableCell>
                            <TableCell>{item.route || "—"}</TableCell>
                            <TableCell className="text-right">
                              {item.quantity ?? "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer — visible only in print */}
        <div className="print-only mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
          Generated by Dr.Note {generatedAt && <>&mdash; {generatedAt}</>}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// VitalField helper component
// ---------------------------------------------------------------------------

function VitalField({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | string | null;
  unit: string;
}) {
  return (
    <div>
      <span className="summary-label">{label}</span>
      <span className="summary-value">
        {value != null ? (
          <>
            {value}
            {unit && <span>{unit}</span>}
          </>
        ) : (
          <span className="text-muted-foreground italic">Not recorded</span>
        )}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Print CSS — inlined for clean encapsulation
// ---------------------------------------------------------------------------

const printStyles = `
  /* ---- Screen styles ---- */

  /* Hide print-only elements on screen */
  .print-only {
    display: none;
  }

  /* Summary section — screen layout */
  .summary-section {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .summary-heading {
    font-size: 15px;
    font-weight: 600;
    color: var(--foreground);
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px 24px;
  }

  .summary-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: var(--muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
  }

  .summary-value {
    display: block;
    font-size: 14px;
    color: var(--foreground);
  }

  /* ---- Print styles ---- */
  @media print {
    /* Hide sidebar, topbar, buttons (except print button) */
    aside[role="navigation"],
    header,
    .no-print,
    nav,
    [data-slot="button"] {
      display: none !important;
    }

    /* Show print-only elements */
    .print-only {
      display: block !important;
    }

    /* Reset body */
    body {
      background: white !important;
      color: black !important;
      margin: 0;
      padding: 0;
    }

    /* Reset the dashboard shell layout */
    .flex.h-screen {
      display: block !important;
      height: auto !important;
    }

    /* Full width for main content */
    main {
      overflow: visible !important;
      padding: 0 !important;
    }

    .mx-auto.max-w-6xl {
      max-width: 100% !important;
      margin: 0 !important;
    }

    /* Remove shadows and borders from cards/sections */
    .summary-section {
      border: none !important;
      box-shadow: none !important;
      background: white !important;
      padding: 0 !important;
      margin-bottom: 16px !important;
    }

    /* Clean typography */
    .visit-summary-content {
      font-size: 12px;
      line-height: 1.5;
      color: black !important;
    }

    .summary-heading {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #ccc !important;
      color: black !important;
    }

    .summary-label {
      color: #555 !important;
    }

    .summary-value {
      color: black !important;
    }

    /* Table print styles */
    table {
      font-size: 11px;
    }

    thead tr {
      border-bottom: 2px solid black !important;
    }

    tbody tr {
      border-bottom: 1px solid #ddd !important;
    }

    /* Diagnosis badges — use borders for print */
    .bg-blue-100 {
      background: #e0e7ff !important;
      border: 1px solid #6366f1 !important;
      color: #1e1b4b !important;
    }

    .bg-gray-100 {
      background: #f3f4f6 !important;
      border: 1px solid #6b7280 !important;
      color: #111827 !important;
    }

    .bg-amber-100 {
      background: #fef3c7 !important;
      border: 1px solid #f59e0b !important;
      color: #78350f !important;
    }

    /* Remove page breaks inside sections */
    .summary-section {
      break-inside: avoid;
    }

    /* Footer styling */
    .print-only.mt-8 {
      border-top: 1px solid #ccc !important;
    }
  }
`;
