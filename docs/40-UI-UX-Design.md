# UI/UX Design System

**Project:** Doctor Note MVP
**Version:** 1.0
**Last Updated:** 2026-07-08

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [User Flows](#user-flows)
7. [Accessibility](#accessibility)
8. [Responsive Design](#responsive-design)
9. [Error & Empty States](#error--empty-states)

---

## Design Principles

1. **Clarity First** — Medical software must be unambiguous. Every element serves a purpose.
2. **Efficiency** — Minimize clicks for common tasks. Doctors and staff are busy.
3. **Consistency** — Same patterns across all screens reduce cognitive load.
4. **Accessibility** — WCAG 2.1 AA compliance minimum.
5. **Professional** — Clean, trustworthy appearance suitable for healthcare.

---

## Color System

### Brand Colors

| Name | Usage | Hex | Tailwind |
|------|-------|-----|----------|
| **Primary** | CTAs, active states, key actions | `#18181B` | `zinc-900` |
| **Primary Foreground** | Text on primary | `#FAFAFA` | `zinc-50` |
| **Accent** | Highlights, selected items | `#F4F4F5` | `zinc-100` |
| **Accent Foreground** | Text on accent | `#18181B` | `zinc-900` |

### Semantic Colors

| Name | Usage | Light | Dark |
|------|-------|-------|------|
| **Success** | Completed actions, positive states | `#16A34A` | `#4ADE80` |
| **Warning** | Cautions, pending states | `#CA8A04` | `#FACC15` |
| **Error/Destructive** | Errors, delete actions, critical | `#DC2626` | `#F87171` |
| **Info** | Neutral notifications | `#2563EB` | `#60A5FA` |

### UI Colors

| Name | Usage | Light | Dark |
|------|-------|-------|------|
| **Background** | Page background | `#FFFFFF` | `#18181B` |
| **Foreground** | Primary text | `#18181B` | `#FAFAFA` |
| **Card** | Card backgrounds | `#FFFFFF` | `#27272A` |
| **Muted** | Subtle backgrounds | `#F4F4F5` | `#27272A` |
| **Muted Foreground** | Secondary text | `#71717A` | `#A1A1AA` |
| **Border** | Dividers, outlines | `#E4E4E7` | `rgba(255,255,255,0.1)` |
| **Input** | Form field borders | `#E4E4E7` | `rgba(255,255,255,0.15)` |
| **Ring** | Focus indicators | `#A1A1AA` | `#71717A` |

### Color Usage Rules

- **Never** use color alone to convey meaning (add icons or text)
- **Error states** always pair red border + red text + icon
- **Success states** use green sparingly — only for confirmations
- **Medical data** (diagnoses, prescriptions) uses neutral colors

---

## Typography

### Font Stack

| Role | Font | Weight | Size |
|------|------|--------|------|
| **Headings** | Geist Sans | 600-700 | 18-30px |
| **Body** | Geist Sans | 400 | 14-16px |
| **Labels** | Geist Sans | 500 | 14px |
| **Small/Captions** | Geist Sans | 400 | 12px |
| **Code/Data** | Geist Mono | 400 | 14px |

### Type Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-4xl` | 30px | 36px | Page titles |
| `text-2xl` | 24px | 30px | Section headers |
| `text-xl` | 20px | 28px | Card titles |
| `text-lg` | 18px | 26px | Subsection headers |
| `text-base` | 16px | 24px | Body text |
| `text-sm` | 14px | 20px | Labels, form text |
| `text-xs` | 12px | 16px | Captions, hints |

### Typography Rules

- **Maximum 3 font sizes per screen** — prevents visual chaos
- **Line height 1.5x** for body text (accessibility)
- **No all-caps** for body text (harder to read)
- **Bold sparingly** — reserve for key data points

---

## Spacing & Layout

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `p-1` / `m-1` | 4px | Tight inner spacing |
| `p-2` / `m-2` | 8px | Default inner spacing |
| `p-3` / `m-3` | 12px | Card padding |
| `p-4` / `m-4` | 16px | Standard spacing |
| `p-6` / `m-6` | 24px | Section spacing |
| `p-8` / `m-8` | 32px | Page margins |

### Grid System

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (240px fixed)  │  Main Content (fluid)         │
│                         │                                │
│  ┌─────────────────┐    │  ┌──────────────────────────┐ │
│  │ Logo             │    │  │ Page Header              │ │
│  │                  │    │  │ (Breadcrumb + Title)     │ │
│  │ Navigation       │    │  ├──────────────────────────┤ │
│  │ - Dashboard      │    │  │                          │ │
│  │ - Doctors        │    │  │ Content Area             │ │
│  │ - Patients       │    │  │ (Cards, Tables, Forms)   │ │
│  │ - Consultations  │    │  │                          │ │
│  │                  │    │  │                          │ │
│  │ User Info        │    │  └──────────────────────────┘ │
│  └─────────────────┘    │                                │
└─────────────────────────────────────────────────────────┘
```

### Layout Rules

- **Sidebar:** Fixed 240px on desktop, collapsible on tablet
- **Content max-width:** 1200px (prevents overly long lines)
- **Section spacing:** 24px between major sections
- **Card spacing:** 16px between cards in grid
- **Form field spacing:** 16px between fields, 24px between sections

---

## Components

### Buttons

| Variant | Usage | Appearance |
|---------|-------|------------|
| **Primary** | Main CTAs (Save, Submit, Create) | Dark bg, white text |
| **Secondary** | Alternative actions (Cancel, Back) | Light bg, dark text |
| **Destructive** | Delete, remove actions | Red bg, white text |
| **Ghost** | Inline actions, table row actions | Transparent, subtle hover |
| **Link** | Navigation actions | Text with underline on hover |

### Form Elements

#### Text Input
```
┌─────────────────────────────────────┐
│ Label (optional)                     │
├─────────────────────────────────────┤
│ Placeholder text                     │
│                                      │
└─────────────────────────────────────┘
Helper text (optional) | Error message
```

**States:**
- Default: Border `zinc-200`
- Focus: Border `ring-2 ring-zinc-400`
- Error: Border `border-red-500` + red helper text
- Disabled: `opacity-50`, no interaction

#### Select/Dropdown
- Same styling as text input
- Max height: 240px with scroll
- Keyboard navigable

#### Checkbox/Radio
- Custom styled with shadcn/ui
- Label clickable to toggle
- Error state: red border

### Cards

```
┌─────────────────────────────────────┐
│  Card Title              [Actions]  │
├─────────────────────────────────────┤
│                                      │
│  Content area                        │
│  - Text                              │
│  - Data fields                       │
│  - Charts                            │
│                                      │
├─────────────────────────────────────┤
│  Footer (optional)                   │
└─────────────────────────────────────┘
```

**Card Variants:**
- **Stat Card:** Icon + Number + Label (dashboard)
- **Data Card:** Title + Content + Actions (lists)
- **Form Card:** Title + Form fields (create/edit)

### Tables

```
┌────┬────────────┬────────────┬──────────┬─────────┐
│ ☐  │ Name       │ Email      │ Role     │ Actions │
├────┼────────────┼────────────┼──────────┼─────────┤
│ ☐  │ John Doe   │ j@d.com    │ Doctor   │ ⋮       │
│ ☐  │ Jane Smith │ j@s.com    │ Admin    │ ⋮       │
└────┴────────────┴────────────┴──────────┴─────────┘
        ▲ Sorted ascending                ▲ More menu
```

**Table Features:**
- Striped rows: Alternate `bg-zinc-50` (optional)
- Hover: `bg-zinc-100` on row hover
- Selected: `bg-zinc-200`
- Sticky header on scroll
- Checkbox column for bulk actions

### Modals/Dialogs

```
┌─────────────────────────────────────┐
│  Dialog Title                  [X]  │
├─────────────────────────────────────┤
│                                      │
│  Are you sure you want to delete     │
│  this patient? This action cannot    │
│  be undone.                          │
│                                      │
├─────────────────────────────────────┤
│              [Cancel]  [Delete]      │
└─────────────────────────────────────┘
```

**Rules:**
- Max width: 480px
- Backdrop: `bg-black/50`
- One primary action, one secondary
- Destructive actions require confirmation
- Close on Escape key

### Toast Notifications

```
┌─────────────────────────────────────┐
│ ✓ Patient created successfully      │
└─────────────────────────────────────┘
```

- Position: Bottom right
- Duration: 5 seconds (errors: 8 seconds)
- Dismissible with close button
- Max 3 visible at once

---

## User Flows

### 1. Login Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   /login     │────▶│   Loading    │────▶│  /dashboard  │
│              │     │              │     │              │
│ Email field  │     │  Spinner     │     │  Welcome     │
│ Password     │     │              │     │  User info   │
│ [Sign In]    │     └──────────────┘     └──────────────┘
│              │            │
│ Error:       │            ▼
│ Invalid      │     ┌──────────────┐
│ credentials  │     │  /login      │
└──────────────┘     │  + error msg │
                     └──────────────┘
```

### 2. Patient Registration Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  /patients   │────▶│ /patients/   │────▶│  /patients   │
│  (list)      │     │   new        │     │  (list)      │
│              │     │              │     │              │
│ [Register    │     │ Form fields  │     │ New patient  │
│  Patient]    │     │ [Save]       │     │ appears      │
└──────────────┘     └──────────────┘     └──────────────┘
                           │
                           ▼ (validation error)
                     ┌──────────────┐
                     │ Form +       │
                     │ error msgs   │
                     └──────────────┘
```

### 3. Consultation Creation Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ /patients/   │────▶│ /patients/   │────▶│  /patients/  │
│   [id]       │     │ [id]/        │     │   [id]       │
│              │     │ consultations│     │              │
│ [Create      │     │   /new       │     │ Consultation │
│  Consultation│     │              │     │ appears in   │
│  ]           │     │ Form fields  │     │ history      │
└──────────────┘     │ [Save]       │     └──────────────┘
                     └──────────────┘
```

---

## Accessibility

### WCAG 2.1 AA Requirements

#### Color Contrast
- **Normal text:** Minimum 4.5:1 ratio
- **Large text (18px+):** Minimum 3:1 ratio
- **UI components:** Minimum 3:1 ratio

#### Keyboard Navigation
- All interactive elements focusable with `Tab`
- Focus visible with `ring-2` indicator
- Escape closes modals/dropdowns
- Arrow keys navigate within components

#### Screen Reader Support
- All images have `alt` text
- Form fields have associated labels
- Error messages linked via `aria-describedby`
- Dynamic content announced with `aria-live`

#### Focus Management
```
Login page:
Tab → Email field → Password field → Sign In button → (error link)

Dashboard:
Tab → Sidebar nav → Main content → Logout button
```

### Required ARIA Patterns

| Component | Pattern |
|-----------|---------|
| Modal | `role="dialog"`, `aria-modal="true"` |
| Alert | `role="alert"` |
| Table | `role="table"`, `aria-label` |
| Tabs | `role="tablist"`, `role="tab"` |
| Dropdown | `aria-haspopup="true"` |

---

## Responsive Design

### Breakpoints

| Name | Width | Layout |
|------|-------|--------|
| **Mobile** | < 640px | Single column, bottom nav |
| **Tablet** | 640-1024px | Collapsible sidebar, 2-col grid |
| **Desktop** | > 1024px | Fixed sidebar, 3-col grid |

### Mobile (< 640px)
```
┌─────────────┐
│ ☰  Dr-Note  │
├─────────────┤
│             │
│   Content   │
│   (full     │
│    width)   │
│             │
├─────────────┤
│ 🏠 👤 📋 ⋮  │
└─────────────┘
```

### Tablet (640-1024px)
```
┌─────────┬───────────────────────┐
│ ☰  Logo │  Content              │
│         │                       │
│ Nav     │  ┌─────┐ ┌─────┐    │
│ items   │  │Card │ │Card │    │
│         │  └─────┘ └─────┘    │
└─────────┴───────────────────────┘
```

### Desktop (> 1024px)
```
┌──────────────┬────────────────────────────────┐
│  Sidebar     │  Content                       │
│  (fixed)     │                                │
│              │  ┌─────┐ ┌─────┐ ┌─────┐     │
│              │  │Card │ │Card │ │Card │     │
│              │  └─────┘ └─────┘ └─────┘     │
└──────────────┴────────────────────────────────┘
```

### Responsive Rules

- **Tables:** Horizontal scroll on mobile, or switch to card layout
- **Forms:** Stack fields vertically on mobile
- **Grids:** 3 cols desktop → 2 cols tablet → 1 col mobile
- **Sidebar:** Hidden on mobile, hamburger menu toggle

---

## Error & Empty States

### Error States

#### Form Validation Error
```
┌─────────────────────────────────────┐
│ First Name *                         │
├─────────────────────────────────────┤
│ John                                │
└─────────────────────────────────────┘
⚠ First name is required
```

#### API Error
```
┌─────────────────────────────────────┐
│ ⚠ Failed to load patients           │
│                                      │
│ Please check your connection and     │
│ try again.                           │
│                                      │
│           [Try Again]                │
└─────────────────────────────────────┘
```

### Empty States

#### No Data
```
┌─────────────────────────────────────┐
│                                      │
│           👥                         │
│                                      │
│      No patients yet                 │
│                                      │
│   Register your first patient to     │
│   get started.                       │
│                                      │
│      [Register Patient]              │
│                                      │
└─────────────────────────────────────┘
```

#### No Search Results
```
┌─────────────────────────────────────┐
│                                      │
│           🔍                         │
│                                      │
│    No results for "xyz"              │
│                                      │
│   Try a different search term        │
│                                      │
└─────────────────────────────────────┘
```

### Loading States

#### Skeleton Loading
```
┌─────────────────────────────────────┐
│ ████████████████████████            │
│ ██████████████████                  │
│                                      │
│ ████████████████████████            │
│ ██████████████████                  │
└─────────────────────────────────────┘
```

---

## Implementation Notes

### shadcn/ui Components Used

| Component | Location | Usage |
|-----------|----------|-------|
| Button | `components/ui/button.tsx` | All actions |
| Card | `components/ui/card.tsx` | Content containers |
| Dialog | `components/ui/dialog.tsx` | Modals |
| Input | `components/ui/input.tsx` | Form fields |
| Label | `components/ui/label.tsx` | Form labels |
| Select | `components/ui/select.tsx` | Dropdowns |
| Table | `components/ui/table.tsx` | Data lists |
| Textarea | `components/ui/textarea.tsx` | Long text |

### Custom Components to Build

| Component | Priority | Est. Hours |
|-----------|----------|------------|
| Sidebar | High | 2h |
| PageHeader | High | 1h |
| DataTable | High | 3h |
| FormWrapper | High | 2h |
| StatsCard | Medium | 1h |
| EmptyState | Medium | 1h |
| Skeleton | Medium | 0.5h |
| Toast | Low | 1h |

---

## References

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix UI Primitives](https://www.radix-ui.com)
