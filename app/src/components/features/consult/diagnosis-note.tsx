"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { saveDiagnosisNote } from "@/app/(dashboard)/doctor/visits/[id]/actions";
import { toast } from "sonner";

interface DiagnosisNoteProps {
  visitId: string;
  initialNote: string;
  disabled?: boolean;
}

export function DiagnosisNote({
  visitId,
  initialNote,
  disabled,
}: DiagnosisNoteProps) {
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);
  const [lastSavedNote, setLastSavedNote] = useState(initialNote);

  const hasChanges = note !== lastSavedNote;

  const handleChange = (value: string) => {
    setNote(value);
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const result = await saveDiagnosisNote({
        visit_id: visitId,
        diagnosis_note: note,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        setLastSavedNote(note);
        toast.success("Diagnosis note saved");
      }
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  }, [visitId, note]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Diagnostic Note</CardTitle>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || !hasChanges || disabled}
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save note"}
        </Button>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Enter diagnostic notes here..."
          value={note}
          onChange={(e) => handleChange(e.target.value)}
          className="min-h-[200px] resize-y"
          disabled={disabled}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          {note.length}/5000 characters
        </p>
      </CardContent>
    </Card>
  );
}
