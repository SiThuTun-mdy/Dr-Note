# Dr.Note — Design System

|                  |                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| **Author**       | Nyan (PM)                                                                                                      |
| **Sign-off**     | STT + AMM (design) — _pending. All values below are proposals; adjust freely at review, then they become law._ |
| **Status**       | `draft v0.1` — becomes binding when sign-off lands                                                             |
| **Last updated** | 11 July 2026                                                                                                   |
| **Related**      | [02-architecture.md](02-architecture.md) §2 (stack rules) · issue #39 (app shell) · issue #41 (landing/login)  |

The single source of truth for how Dr.Note looks and behaves. Humans and AI agents building any screen follow this file. If a screen needs something this file doesn't define, add it here _first_ (PR to this doc), then build.

---

## 1. Design principles (the tie-breakers)

1. **Calm and clinical** — this is a medical tool used during patient conversations. No decoration, no motion for its own sake, generous whitespace.
2. **Density where it counts** — staff scan lists all day: tables are compact; forms and detail views breathe.
3. **Status is always visible** — a visit's state (waiting → completed) should be readable at a glance from any screen, always as the same colored badge.
4. **One way to do each thing** — one button hierarchy, one form layout, one table style. Consistency beats cleverness, especially with 6 people + agents building in parallel for 4 days.
5. **Touch-first accessibility** — doctors and medical staff use handheld devices during consultations. All interactive elements must meet 44×44px touch targets. Input fields must be large enough for gloved hands. Instant visual feedback (toast/status shift) after every save to prevent data loss.

## 2. Foundations (tokens)

Implemented as shadcn CSS variables in `src/app/globals.css` + Tailwind config. **Do not hardcode hex values in components — Tailwind semantic classes only** (`bg-primary`, `text-muted-foreground`, ...).

### Color

| Token                  | Value (HSL)                                   | Use                                             |
| ---------------------- | --------------------------------------------- | ----------------------------------------------- |
| `--primary`            | `207 82% 67%` (material light blue `#64B5F6`) | Primary buttons, active nav, links, focus rings |
| `--primary-foreground` | `0 0% 100%`                                   | Text on primary                                 |
| `--secondary`          | `224 76% 33%` (deep navy `#1E3A8A`)           | Critical information text, high-contrast labels |
| `--background`         | `0 0% 100%`                                   | Page background                                 |
| `--muted`              | `207 86% 86%` (light blue `#BBDEFB`)          | Table header rows, subtle panels, backgrounds   |
| `--destructive`        | `0 72% 45%`                                   | Delete/danger actions only — never decoration   |
| `--border`             | `207 44% 83%`                                 | All borders, one weight                         |

Status palette (visit lifecycle — used **only** for status, never decoratively):

| Status        | Badge classes                   |
| ------------- | ------------------------------- |
| `waiting`     | `bg-amber-100 text-amber-800`   |
| `screening`   | `bg-sky-100 text-sky-800`       |
| `with_doctor` | `bg-violet-100 text-violet-800` |
| `completed`   | `bg-green-100 text-green-800`   |

**Dark mode: not built this sprint** (decision — cut scope; shadcn makes it easy to add later).

### Typography

Font: **Inter** (via `next/font`), fallback system-ui. Two weights only: 400, 600.

| Level           | Size / weight                   | Use                         |
| --------------- | ------------------------------- | --------------------------- |
| Page title      | `text-2xl` 600                  | One per page                |
| Section heading | `text-lg` 600                   | Cards, form sections        |
| Body / labels   | `text-sm` 400 (labels 600)      | Default everywhere          |
| Meta / captions | `text-xs text-muted-foreground` | Timestamps, IDs, table meta |

No `text-base` prose walls, no font sizes outside this table.

### Spacing & shape

- Spacing scale: Tailwind 4/8-based — `gap-2` inside controls, `gap-4` between fields, `gap-6` between sections, `p-6` page padding.
- Radius: `--radius: 0.5rem` (shadcn default) everywhere. No pills except badges.
- Shadows: `shadow-sm` on cards, nothing stronger. No colored shadows.

## 3. Components (shadcn canon)

Only shadcn/ui primitives, added via CLI into `src/components/ui/`. Current canon: `button`, `card`, `dialog`, `input`, `label`, `select`, `table`, `textarea`, plus add as needed: `badge`, `form`, `toast`/`sonner`, `skeleton`, `tabs`, `dropdown-menu`. Adding any _other_ component = one-line PR to this list first.

**Buttons** — hierarchy, per view:

- One `default` (primary) action max per screen region.
- `outline` for secondary, `ghost` for tertiary/table row actions, `destructive` only for irreversible actions (and always behind a confirm `dialog`).
- Button text = verb: "Register patient", "Start screening" — never "OK"/"Submit".

**Badges** — statuses (table above) and roles. Same status = same badge everywhere in the app, rendered by one shared `<StatusBadge status={...}>` in `components/features/shared/`.

**Tables** — staff lists (queue, patients, history): compact rows, `--muted` header, row click opens detail, row-level actions in a `ghost` dropdown at the end. Empty state = one sentence + primary action, centered.

**Icons** — use Outlined Material Icons (or Lucide via shadcn) to reduce visual noise while maintaining clear metaphors for medical actions. Icon-only buttons always get `aria-label`.

**Mobile-specific patterns** (when mobile support is added):

- **Bottom Sheets** — slide-up panels for contextual actions on mobile, transitioning to dropdown/modal overlays at `768px+`.
- **FAB (Floating Action Button)** — pinned action button for the most frequent task per screen (e.g., "Register Patient"). Docks into the header action bar on desktop.
- **Steppers** — for multi-step forms (e.g., Personal Info → Medical History → Insurance) to prevent form fatigue on mobile. Use only when a form has 3+ distinct sections.

## 4. Layout: the app shell (spec for #39)

```
┌──────────┬──────────────────────────────┐
│ sidebar  │ topbar: page title | user ▾  │
│ 240px    ├──────────────────────────────┤
│ nav per  │ content, max-w-6xl, p-6      │
│ role     │                              │
└──────────┴──────────────────────────────┘
```

- Sidebar: `w-60`, app name top, nav items = icon + label, active item `bg-muted text-primary`. **Items render from the user's permissions** (01 §6) — a receptionist never sees "Prescriptions".
- Topbar: page title (left), user name + role badge + logout `dropdown-menu` (right).
- Dashboards land on what each role does first: reception → today's queue + "Register patient"; nurse → waiting-for-screening list; doctor → my queue; admin → user management.
- **Responsive: mobile-first.** All screens must work on phones (375px+), then adapt upward. Breakpoints: `768px` (tablet — sidebar collapses to icons), `1024px+` (desktop — full sidebar + topbar shell). Touch targets: 44×44px minimum on all viewports.
- **Mobile patterns:** bottom sheets for contextual actions, pinned FABs for primary actions, stacked cards for lists, tabbed navigation for multi-section views. Transition to tabular grids and split layouts at wider breakpoints.
- **Desktop patterns:** full sidebar (`w-60`) + topbar shell, data tables, multi-column forms with validation sidebar.

## 5. Forms (the pattern for every form)

- shadcn `form` component wrapping RHF + the feature's Zod schema (one schema, client + server — 02 §3).
- Single column, `max-w-lg`. Related short fields (height/weight, BP sys/dia) may pair on one row.
- **Multi-step forms:** for forms with 3+ distinct sections (e.g., Patient Registration: Personal Info → Medical History → Insurance), use a Stepper pattern to group fields and prevent form fatigue. Mobile: single-column scrollable per step. Desktop (768px+): multi-column with a right-hand validation sidebar showing missing fields in real-time.
- Every field: `<Label>` above, error message below in `text-destructive text-xs`. Required fields marked with `*`; prefer making optional fields visibly "(optional)".
- Submit = primary button, bottom-left, disabled while pending with a spinner. Success → `toast` + navigate; error → `toast` with a human sentence, never a raw error code.
- Medical inputs get units in the field suffix (`cm`, `kg`, `°C`, `%`) — never in the label alone.

## 6. States (every list and detail view ships all three)

| State   | Pattern                                                                   |
| ------- | ------------------------------------------------------------------------- |
| Loading | `skeleton` blocks matching the final layout — no spinners for page loads  |
| Empty   | One sentence ("No visits yet today.") + the relevant primary action       |
| Error   | Toast + inline "Something went wrong — retry" block; never a blank screen |

## 7. Accessibility & print (demo-week floor, not ceiling)

- Every input labeled (shadcn `form` does this — don't bypass it). Icon-only buttons get `aria-label`.
- Color contrast: the token palette above passes WCAG AA on white — don't lighten text below `text-muted-foreground`. Minimum 4.5:1 ratio for all text to ensure readability for staff of all ages under various lighting conditions.
- **Touch targets:** minimum 44×44px for all interactive elements to accommodate medical staff using handheld devices or wearing gloves.
- Keyboard: dialogs trap focus (shadcn default), forms submit on Enter.
- **Clinical feedback:** instant visual confirmation (toast notifications or status shifts) after saving records to mitigate the risk of lost physical data. Never leave the user uncertain about whether their action succeeded.
- **Print (visit summary, #35):** `@media print` — hide shell (sidebar/topbar/buttons), black on white, clinic name header. Browser print is the demo bar.

## 8. Voice & microcopy

- Sentence case everywhere ("Register patient", not "Register Patient").
- Staff-facing, so terse and factual; no exclamation marks, no "oops".
- Dates: `12 Jul 2026, 14:30` (24h). Names: as entered, never auto-capitalized.

## 9. Changelog

- **v0.1 (11 Jul 2026)** — first draft: principles, tokens (teal proposal), status palette, shadcn canon, app-shell spec, form/state patterns, print floor. Dark mode explicitly cut.
- **v0.2 (12 Jul 2026)** — aligned with `docs/ui-design/ui-design.md`: added principle #5 (touch-first accessibility), `--secondary` token (deep navy), icon system guidance, mobile-specific component patterns (bottom sheets, FABs, steppers), multi-step form variant, touch target requirements (44×44px), clinical feedback loop standard, mobile-first responsive strategy notes.
- **v0.3 (12 Jul 2026)** — switched responsive strategy from desktop-first to mobile-first. All screens must work on phones (375px+), adapt upward. Breakpoints: 768px (tablet), 1024px+ (desktop). Mobile patterns (bottom sheets, FABs, stacked cards) are primary, desktop patterns (sidebar shell, tables) are enhancements.
