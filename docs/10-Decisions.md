# Decisions Log

Significant technical and product decisions, in chronological order.

---

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
