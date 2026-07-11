export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string
          file_path: string
          file_type: string | null
          id: string
          uploaded_by: string | null
          visit_id: string
        }
        Insert: {
          created_at?: string
          file_path: string
          file_type?: string | null
          id?: string
          uploaded_by?: string | null
          visit_id: string
        }
        Update: {
          created_at?: string
          file_path?: string
          file_type?: string | null
          id?: string
          uploaded_by?: string | null
          visit_id?: string
        }
      }
      diagnoses: {
        Row: {
          code: string
          id: string
          title: string
        }
        Insert: {
          code: string
          id?: string
          title: string
        }
        Update: {
          code?: string
          id?: string
          title?: string
        }
      }
      emergency_contacts: {
        Row: {
          id: string
          name: string
          patient_id: string
          phone: string | null
          relationship: string | null
        }
        Insert: {
          id?: string
          name: string
          patient_id: string
          phone?: string | null
          relationship?: string | null
        }
        Update: {
          id?: string
          name?: string
          patient_id?: string
          phone?: string | null
          relationship?: string | null
        }
      }
      patient_profiles: {
        Row: {
          address: string | null
          dob: string | null
          ethnicity: string | null
          gender: string | null
          nrc: string | null
          religion: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          dob?: string | null
          ethnicity?: string | null
          gender?: string | null
          nrc?: string | null
          religion?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          dob?: string | null
          ethnicity?: string | null
          gender?: string | null
          nrc?: string | null
          religion?: string | null
          user_id?: string
        }
      }
      permissions: {
        Row: {
          code: string
          description: string | null
          id: number
        }
        Insert: {
          code: string
          description?: string | null
          id: number
        }
        Update: {
          code?: string
          description?: string | null
          id?: number
        }
      }
      prescription_items: {
        Row: {
          dosage: string | null
          duration: string | null
          frequency: string | null
          id: string
          medicine_name: string
          prescription_id: string
          quantity: number | null
          route: string | null
        }
        Insert: {
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          medicine_name: string
          prescription_id: string
          quantity?: number | null
          route?: string | null
        }
        Update: {
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          medicine_name?: string
          prescription_id?: string
          quantity?: number | null
          route?: string | null
        }
      }
      prescriptions: {
        Row: {
          created_at: string
          diagnosis_id: string | null
          doctor_id: string
          id: string
          instruction: string | null
          visit_id: string
        }
        Insert: {
          created_at?: string
          diagnosis_id?: string | null
          doctor_id: string
          id?: string
          instruction?: string | null
          visit_id: string
        }
        Update: {
          created_at?: string
          diagnosis_id?: string | null
          doctor_id?: string
          id?: string
          instruction?: string | null
          visit_id?: string
        }
      }
      role_permissions: {
        Row: {
          permission_id: number
          role_id: number
        }
        Insert: {
          permission_id: number
          role_id: number
        }
        Update: {
          permission_id?: number
          role_id?: number
        }
      }
      roles: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
      }
      screenings: {
        Row: {
          bp_diastolic: number | null
          bp_systolic: number | null
          bmi: number | null
          created_at: string
          height_cm: number | null
          heart_rate: number | null
          id: string
          oxygen_saturation: number | null
          screened_by: string | null
          temperature_c: number | null
          visit_id: string
          weight_kg: number | null
        }
        Insert: {
          bp_diastolic?: number | null
          bp_systolic?: number | null
          bmi?: number | null
          created_at?: string
          height_cm?: number | null
          heart_rate?: number | null
          id?: string
          oxygen_saturation?: number | null
          screened_by?: string | null
          temperature_c?: number | null
          visit_id: string
          weight_kg?: number | null
        }
        Update: {
          bp_diastolic?: number | null
          bp_systolic?: number | null
          bmi?: number | null
          created_at?: string
          height_cm?: number | null
          heart_rate?: number | null
          id?: string
          oxygen_saturation?: number | null
          screened_by?: string | null
          temperature_c?: number | null
          visit_id?: string
          weight_kg?: number | null
        }
      }
      staff_profiles: {
        Row: {
          department: string | null
          staff_code: string
          user_id: string
        }
        Insert: {
          department?: string | null
          staff_code: string
          user_id: string
        }
        Update: {
          department?: string | null
          staff_code?: string
          user_id?: string
        }
      }
      user_roles: {
        Row: {
          role_id: number
          user_id: string
        }
        Insert: {
          role_id: number
          user_id: string
        }
        Update: {
          role_id?: number
          user_id?: string
        }
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          is_active?: boolean
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
        }
      }
      visit_diagnoses: {
        Row: {
          diagnosis_id: string
          diagnosis_type: string
          id: string
          visit_id: string
        }
        Insert: {
          diagnosis_id: string
          diagnosis_type: string
          id?: string
          visit_id: string
        }
        Update: {
          diagnosis_id?: string
          diagnosis_type?: string
          id?: string
          visit_id?: string
        }
      }
      visits: {
        Row: {
          chief_complaint: string | null
          created_at: string
          diagnosis_note: string | null
          doctor_id: string | null
          id: string
          patient_id: string
          receptionist_id: string | null
          status: string
          visit_date: string
          visit_type: string | null
        }
        Insert: {
          chief_complaint?: string | null
          created_at?: string
          diagnosis_note?: string | null
          doctor_id?: string | null
          id?: string
          patient_id: string
          receptionist_id?: string | null
          status?: string
          visit_date?: string
          visit_type?: string | null
        }
        Update: {
          chief_complaint?: string | null
          created_at?: string
          diagnosis_note?: string | null
          doctor_id?: string | null
          id?: string
          patient_id?: string
          receptionist_id?: string | null
          status?: string
          visit_date?: string
          visit_type?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_permission: {
        Args: {
          perm: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
