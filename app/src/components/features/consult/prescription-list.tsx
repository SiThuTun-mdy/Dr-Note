"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PrescriptionItem {
  id: string;
  medicine_name: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  route: string | null;
  quantity: number | null;
}

interface Prescription {
  id: string;
  instruction: string | null;
  created_at: string;
  diagnosis: { code: string; title: string } | null;
  items: PrescriptionItem[];
}

interface PrescriptionListProps {
  prescriptions: Prescription[];
}

export function PrescriptionList({ prescriptions }: PrescriptionListProps) {
  if (prescriptions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {prescriptions.map((rx) => (
        <Card key={rx.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Prescription</CardTitle>
              <div className="flex items-center gap-2">
                {rx.diagnosis && (
                  <Badge variant="secondary">
                    {rx.diagnosis.code} — {rx.diagnosis.title}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(rx.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {rx.instruction && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Instruction</p>
                <p className="text-sm">{rx.instruction}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Medicines</p>
              <div className="space-y-2">
                {rx.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center gap-2 rounded-md border p-2 text-sm"
                  >
                    <span className="font-medium">{item.medicine_name}</span>
                    {item.dosage && <Badge variant="outline">{item.dosage}</Badge>}
                    {item.frequency && <span className="text-muted-foreground">{item.frequency}</span>}
                    {item.duration && <span className="text-muted-foreground">× {item.duration}</span>}
                    {item.route && (
                      <span className="text-xs text-muted-foreground">({item.route})</span>
                    )}
                    {item.quantity && (
                      <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
