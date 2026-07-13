# Dr. Note — UI Design Demo

High-fidelity UI mockups for the Dr. Note healthcare application, designed with [Pencil](https://pencil.lol).

## Screens Overview

| Row | Role | Screens |
|-----|------|---------|
| 1 | Auth | Login, Forgot Password |
| 2 | Admin | Dashboard, Doctor List, Doctor Registration, Doctor Detail, Edit Doctor, Admin Settings |
| 3 | Receptionist | Dashboard, Patient List, Patient Registration, Patient Detail, Settings |
| 4 | Doctor | Dashboard, Consultation List, Consultation Form, Consultation Detail, Patient Detail, Settings |
| 5 | Nurse | Dashboard, Patient List, Screening Form, Settings |
| 6 | Patient | Dashboard, My Consultations, Consultation Detail, Profile, Settings |
| 7 | States & Modals | Empty State, No Results, Error, Skeleton Loading, Session Timeout, Delete Confirmation, Logout, Toast Notifications |
| 8 | Sidebars | Role-specific sidebars for Admin, Receptionist, Doctor, Nurse, Patient |

**Total: 34 screens + 5 role-specific sidebars**

## How to View

### Option 1 — Pencil Web App (Recommended)

1. Open [https://pencil.lol](https://pencil.lol) in your browser
2. Click **Open File** or drag `ui-design-demo.pen` into the canvas
3. Browse screens by scrolling the canvas — screens are organized in rows by role

### Option 2 — Pencil Desktop App

1. Download Pencil from [https://pencil.lol/download](https://pencil.lol/download)
2. Open `ui-design-demo.pen` in the app
3. Navigate the canvas to explore all screens

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `$surface-inverse` | `#18181B` | Sidebar background |
| `$foreground-inverse` | `#FAFAFA` | Sidebar text |
| `$info` | `#2563EB` | Primary buttons, active states |
| `$destructive` | `#DC2626` | Delete actions |

## Role-Based Access

Each role sees only relevant screens and actions:

- **Admin** — Full access: manage doctors, view dashboards, settings
- **Receptionist** — Patient management: register, view, delete patients
- **Nurse** — Clinical support: take vitals, record screenings, update visit status
- **Doctor** — Clinical workflow: consultations, patient history, export PDF
- **Patient** — Read-only: view own consultations, profile, settings

## File Structure

```
ui-design-demo.pen   — Single Pencil design file containing all screens
```
