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

## 2. Foundations (tokens)

Implemented as shadcn CSS variables in `src/app/globals.css` + Tailwind config. **Do not hardcode hex values in components — Tailwind semantic classes only** (`bg-primary`, `text-muted-foreground`, ...).

### Color

| Token                  | Value (HSL)                             | Use                                             |
| ---------------------- | --------------------------------------- | ----------------------------------------------- |
| `--primary`            | `173 58% 32%` (clinical teal `#22867a`) | Primary buttons, active nav, links, focus rings |
| `--primary-foreground` | `0 0% 100%`                             | Text on primary                                 |
| `--background`         | `0 0% 100%`                             | Page background                                 |
| `--muted`              | `173 20% 96%`                           | Table header rows, subtle panels                |
| `--destructive`        | `0 72% 45%`                             | Delete/danger actions only — never decoration   |
| `--border`             | `173 10% 88%`                           | All borders, one weight                         |

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
- Responsive: desktop-first (clinic PCs). Must not _break_ at tablet width — sidebar collapses to icons. Phone layout: out of scope this sprint, except the public landing/login (#41).

## 5. Forms (the pattern for every form)

- shadcn `form` component wrapping RHF + the feature's Zod schema (one schema, client + server — 02 §3).
- Single column, `max-w-lg`. Related short fields (height/weight, BP sys/dia) may pair on one row.
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
- Color contrast: the token palette above passes WCAG AA on white — don't lighten text below `text-muted-foreground`.
- Keyboard: dialogs trap focus (shadcn default), forms submit on Enter.
- **Print (visit summary, #35):** `@media print` — hide shell (sidebar/topbar/buttons), black on white, clinic name header. Browser print is the demo bar.

## 8. Voice & microcopy

- Sentence case everywhere ("Register patient", not "Register Patient").
- Staff-facing, so terse and factual; no exclamation marks, no "oops".
- Dates: `12 Jul 2026, 14:30` (24h). Names: as entered, never auto-capitalized.

## 9. Changelog

- **v0.1 (11 Jul 2026)** — first draft: principles, tokens (teal proposal), status palette, shadcn canon, app-shell spec, form/state patterns, print floor. Dark mode explicitly cut.
