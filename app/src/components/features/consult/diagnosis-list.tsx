"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DiagnosisEntry {
  id: string;
  diagnosis_type: string;
  notes: string | null;
  diagnosis: {
    id: string;
    code: string;
    title: string;
  };
}

interface DiagnosisListProps {
  diagnoses: DiagnosisEntry[];
  onRemove: (id: string) => void;
  disabled?: boolean;
}

const typeBadgeClasses: Record<string, string> = {
  primary: "bg-blue-100 text-blue-800",
  secondary: "bg-purple-100 text-purple-800",
  suspected: "bg-amber-100 text-amber-800",
};

export function DiagnosisList({
  diagnoses,
  onRemove,
  disabled,
}: DiagnosisListProps) {
  if (diagnoses.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No diagnoses added yet. Use the search above to add diagnoses.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Visit Diagnoses ({diagnoses.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {diagnoses.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start justify-between rounded-md border p-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium">
                  {entry.diagnosis.code}
                </span>
                <span className="text-sm">{entry.diagnosis.title}</span>
                <Badge
                  variant="secondary"
                  className={typeBadgeClasses[entry.diagnosis_type]}
                >
                  {entry.diagnosis_type}
                </Badge>
              </div>
              {entry.notes && (
                <p className="text-xs text-muted-foreground">{entry.notes}</p>
              )}
            </div>
            {!disabled && (
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove diagnosis</span>
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Diagnosis</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove{" "}
                      <strong>{entry.diagnosis.code}</strong> from this visit?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onRemove(entry.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
