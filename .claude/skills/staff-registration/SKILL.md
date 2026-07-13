---
name: staff-registration-ux
description: >-
  Generates and validates Clinical Staff Registration Forms using high-density UI constraints 
  combined with modern frontend implementation code. Trigger this skill when the user asks to build, 
  design, or refactor staff onboarding, member profiles, or registration interfaces for medical or EMR applications.
---

Read

- docs/ui-design-demo/ui-design-demo.pen for layout and design patterns
- issue #21 on git repository for acceptance criteria and constraints

# Clinical Staff Registration Form Skill

Use this skill to guide the sequential design and technical implementation of clinical staff registration forms. Clinical environments demand strict cognitive safeguards, accessibility compliance, and resilient frontend code to eliminate data-entry errors.

## Workflow Strategy

Follow this multi-step workflow whenever generating layout templates or production code.

### Step 1: Design Safeguards (ui-ux-pro-max Protocol)

Enforce low-fatigue layout constraints optimized for exhausted healthcare workers:

1. **Layout Direction:** Enforce a single-column block format for all input fields. Multi-column forms risk line-skipping tracking errors.
2. **Color & Typography:** Adhere to a strict WCAG AAA contrast scale. Use soft neutral backgrounds (e.g., Slate-50), high-contrast legible typography, and a single distinctive accent color for primary actions.
3. **Labels & Hints:** Labels must never disappear. Use persistent inline labels rather than disappearing placeholder text.
4. **Error Treatment:** Never use aggressive red or green focus rings for normal fields—keep them neutral blue. Present error messages directly beneath the violating field and pair them with an `aria-live` container.

### Step 2: Code Architecture (frontend-design Protocol)

Translate the UX constraints into operational code using a modern frontend stack:

1. **Stack Targets:** React (TypeScript), Tailwind CSS utility classes, and accessible primitives (like Radix UI or shadcn/ui).
2. **State & Strict Types:** Implement forms using `react-hook-form` bound to a runtime `zod` schema validator.
3. **Core Registry Fields:**
   - Full Legal Name (`string`)
   - National Provider Identifier / License Number (Exactly 10 digits via regex validation)
   - Clinical Department Assignment (Accessible selection dropdown)
   - Access Role (Doctor, Nurse, Registrar, Admin mapped to radio selections to block multi-select mistakes)
4. **API & Event Protection:**
   - Lock browser autocomplete out (`autoComplete="off"`) to protect data leak vectors on communal terminals.
   - Inject instantaneous async states into primary submit buttons to trigger a disabled `loading...` feedback block, completely preventing duplicate submission racing conditions.

## Required Output Format

Provide a production-ready, fully typed TypeScript React element matching the layout below:

```tsx
// Complete import structures (React, React Hook Form, Zod, Radix/Lucide Primitives)
// Zod validation schema with explicit regex for 10-digit medical licenses
// Form component function with integrated accessibility attributes (aria-invalid, aria-describedby)
```
