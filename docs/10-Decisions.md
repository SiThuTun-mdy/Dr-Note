# Decisions Log

Significant technical and product decisions, in chronological order.

---

## 2026-07-18 — Diagnoses catalog upgraded to WHO ICD-11 (static seed)

**Decision:** Replace the 12-code ICD-10-style starter catalog in `diagnoses` with the WHO ICD-11 MMS classification, seeded statically from the official WHO release file (Option B: static seed; live WHO ICD-API integration deliberately deferred).

**Why:** ICD-11 is the current WHO standard (in effect since 2022). A static seed keeps the app fully offline-capable (no API credentials, no network dependency, no token management), fits the existing `diagnoses (code, title)` schema exactly — so no change to the PM-owned schema doc — and FKs/RLS keep working unchanged.

**What shipped (migration `00009_icd11_catalog.sql`):**
- Source: WHO ICD-11 MMS **2026-01 release**, `SimpleTabulation-ICD-11-MMS-en` (© WHO, CC BY-ND 3.0 IGO; attribution comment in the migration header).
- Scope: all 4-character stem codes from chapters 01–25 — **4,330 codes**. Excluded: chapter 26 (Traditional Medicine), extension chapters V/X, and reserved "national/international emergency code" placeholders.
- The 12 legacy ICD-10 rows are **updated in place** to their ICD-11 equivalents (e.g. `I10` → `BA00` Essential hypertension, `E11` → `5A11` Type 2 diabetes mellitus), preserving row UUIDs so existing `visit_diagnoses` / `prescriptions` FKs stay valid. Guarded and idempotent (`on conflict do nothing`; re-runnable).
- `pg_trgm` GIN indexes added on `code` and `title` so the typeahead's `ilike '%q%'` search stays fast at 4k+ rows (verified via `EXPLAIN`: bitmap index scan).
- Hardening: `searchDiagnoses` now strips PostgREST `or()` filter metacharacters (`, ( )`) and `ilike` wildcards (`% _ \`) from user input; `DiagnosisPicker` search is debounced (300 ms).

**Deferred (Phase 2, if ever needed):** live WHO ICD-API search with cache-on-select into the local table — would add dotted subcodes (e.g. `CA23.0`) and multilingual search, at the cost of WHO API credentials and a network dependency.

## 2026-07-17 — Dark mode support (issue #75)

**Decision:** Implement a Light/Dark/System theme switcher, superseding the earlier scope-cut noted in `docs/guide/03-design-system.md` §2 ("Dark mode: not built this sprint").

**Why:** Issue #75 requested it directly (eye strain during long clinical sessions). `next-themes` was already an installed-but-unused dependency, and shadcn's scaffolding had already generated a full `.dark` CSS token block in `globals.css` — most of the infrastructure was already present, shrinking this to a small, additive change.

**What shipped:**
- `next-themes`'s `ThemeProvider` wired into `app/src/components/providers.tsx` (`attribute="class"`, `defaultTheme="system"`, `enableSystem`).
- `suppressHydrationWarning` added to `app/src/app/layout.tsx`'s `<html>` tag (required by next-themes).
- A 3-way Light/Dark/System control in the Topbar's user dropdown (`app/src/components/layout/Topbar.tsx`), using a newly-added shadcn `ToggleGroup`/`Toggle` component pair.

**Known trade-off (accepted):** shadcn's `ToggleGroup` builds its own keyboard composite list rather than registering with the parent dropdown menu's, so the menu's Up/Down arrow-key traversal skips over the theme row (Tab and the toggle's own Left/Right arrows still reach and operate it fine). The codebase already has a `DropdownMenuRadioGroup`/`DropdownMenuRadioItem` primitive that avoids this by integrating natively with the menu, at the cost of a different visual style (vertical list with a checkmark instead of a horizontal segmented pill). Reviewed and knowingly kept `ToggleGroup` for the segmented-pill look; revisit if this pattern gets reused elsewhere in the app.

**Follow-ups flagged, not done here:**
- `docs/guide/03-design-system.md` is PM-owned/protected — recommend PM adds `toggle`/`toggle-group` to the §3 component canon list and a changelog entry noting dark mode is now in scope.
- `.dark` token values in `globals.css` are generic shadcn defaults, not brand-tuned to Dr.Note's light-blue primary.
- Status badges (`bg-amber-100 text-amber-800`, etc.) are hardcoded light-palette classes and won't adapt to dark mode — separate follow-up issue recommended.
