"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { prescriptionSchema } from "@/lib/validators/prescription";
import { createPrescription } from "@/app/(dashboard)/doctor/visits/[id]/actions";
import { toast } from "sonner";
import type { Resolver } from "react-hook-form";

interface Diagnosis {
  id: string;
  code: string;
  title: string;
}

interface PrescriptionFormProps {
  visitId: string;
  doctorId: string;
  diagnoses: Diagnosis[];
  onSuccess?: () => void;
}

type FormData = {
  visit_id: string;
  diagnosis_id: string | null;
  instruction: string;
  items: Array<{
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    route: string;
    quantity: number | undefined;
  }>;
};

export function PrescriptionForm({
  visitId,
  doctorId,
  diagnoses,
  onSuccess,
}: PrescriptionFormProps) {
  const [saving, setSaving] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(prescriptionSchema) as Resolver<FormData>,
    defaultValues: {
      visit_id: visitId,
      diagnosis_id: null,
      instruction: "",
      items: [{ medicine_name: "", dosage: "", frequency: "", duration: "", route: "", quantity: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const result = await createPrescription({
        visit_id: visitId,
        doctor_id: doctorId,
        diagnosis_id: data.diagnosis_id,
        instruction: data.instruction,
        items: data.items,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Prescription saved successfully");
        reset();
        onSuccess?.();
      }
    } catch {
      toast.error("Failed to save prescription");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">New prescription</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Diagnosis link */}
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Linked diagnosis (optional)</Label>
            <Select
              onValueChange={(value) => {
                const selected = value as string | null;
                setValue("diagnosis_id", selected === "none" ? null : selected);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a diagnosis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No diagnosis linked</SelectItem>
                {diagnoses.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.code} — {d.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Instruction */}
          <div className="space-y-2">
            <Label htmlFor="instruction">Instruction note</Label>
            <Textarea
              id="instruction"
              placeholder="General instructions for the patient..."
              {...register("instruction")}
              className="min-h-[80px]"
            />
            {errors.instruction && (
              <p className="text-xs text-destructive">{errors.instruction.message}</p>
            )}
          </div>

          {/* Medicine items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Medicine items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    medicine_name: "",
                    dosage: "",
                    frequency: "",
                    duration: "",
                    route: "",
                    quantity: undefined,
                  })
                }
              >
                <Plus className="mr-1 h-4 w-4" />
                Add item
              </Button>
            </div>

            {errors.items && (
              <p className="text-xs text-destructive">{errors.items.message}</p>
            )}

            {fields.map((field, index) => (
              <Card key={field.id} className="relative">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    <div className="col-span-2 space-y-1 md:col-span-1">
                      <Label className="text-xs">Medicine name *</Label>
                      <Input
                        {...register(`items.${index}.medicine_name`)}
                        placeholder="e.g. Paracetamol"
                      />
                      {errors.items?.[index]?.medicine_name && (
                        <p className="text-xs text-destructive">
                          {errors.items[index]?.medicine_name?.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Dosage</Label>
                      <Input
                        {...register(`items.${index}.dosage`)}
                        placeholder="e.g. 500mg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Frequency</Label>
                      <Input
                        {...register(`items.${index}.frequency`)}
                        placeholder="e.g. 3/day"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Duration</Label>
                      <Input
                        {...register(`items.${index}.duration`)}
                        placeholder="e.g. 5 days"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Route</Label>
                      <Input
                        {...register(`items.${index}.route`)}
                        placeholder="e.g. oral"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        {...register(`items.${index}.quantity`)}
                        placeholder="e.g. 30"
                      />
                    </div>
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit */}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save prescription"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
