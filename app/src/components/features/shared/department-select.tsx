"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormControl } from "@/components/ui/form"

export const DEPARTMENTS = [
  "General Medicine",
  "Surgery",
  "Emergency & Urgent Care",
  "Obstetrics & Gynecology (OB/GYN)",
  "Laboratory",
  "Radiology / Medical Imaging",
  "Pharmacy",
  "Therapeutics & Rehabilitation",
  "Patient Registration & Admissions",
  "Medical Records / Health Information Management",
  "Information Technology",
  "Quality Assurance & Compliance",
] as const

/**
 * Department dropdown for staff forms. Must be rendered inside a
 * react-hook-form <FormField> (it wires aria state via FormControl).
 */
export function DepartmentSelect({
  value,
  onValueChange,
  disabled,
  placeholder = "Select department",
}: {
  value: string | null | undefined
  onValueChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <Select
      disabled={disabled}
      value={value ?? ""}
      onValueChange={(next) => onValueChange(next ?? "")}
    >
      <FormControl>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {DEPARTMENTS.map((department) => (
          <SelectItem key={department} value={department}>
            {department}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
