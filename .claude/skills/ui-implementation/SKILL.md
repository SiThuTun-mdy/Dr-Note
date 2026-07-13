---
name: ui-implementation
description: Implement Dr-Note UI screens with architecture-safe Next.js patterns using Server Actions, Supabase, shadcn/ui, Tailwind CSS, and Zod validation.
argument-hint: "[feature or screen path]"
---

# UI Implementation Skill

Use this skill to implement Dr-Note UI features in production code, aligned to project architecture and `docs/ui-design-demo/ui-design-demo.pen`.

## Must Follow

1. **Architecture-first implementation**
   - Keep domain logic in Server Actions.
   - Keep UI components presentational and composable.
   - Reuse existing app patterns before adding new abstractions.

2. **Auth-first backend flow** (from `backend-skill`)
   - In every server action: authenticate first with Supabase.
   - Then validate input with Zod.
   - Then apply role/ownership checks (defense in depth).
   - Return structured, sanitized errors.

3. **Supabase client setup** (from `supabase-skill`)
   - Use the SSR cookie adapter with `getAll` / `setAll` API for server and middleware clients.
   - Never expose service-role credentials to client components.

4. **UI stack**
   - Use **shadcn/ui** components as the primitive UI building blocks.
   - Use **Tailwind CSS** utilities for layout, spacing, responsiveness, and states.
   - Apply **frontend-design** quality bar (clean hierarchy, intentional spacing, polished interactions) while respecting product constraints.

5. **Layout source of truth**
   - Follow `docs/ui-design-demo/ui-design-demo.pen` for structure and composition.
   - Treat it as **layout guidance only**.
   - Map blocks to shadcn/ui components (Card, Form, Input, Select, Button, Table, Badge, Skeleton, Alert, Tabs, Dialog).

6. **Validation and error handling**
   - Validate **all** inputs using Zod (form data, route params, search params, action payloads).
   - Wrap server actions and async data operations in `try/catch`.
   - Log contextual server errors and return user-safe messages.
   - Do not swallow errors silently.

## Preferred Screen Layout Patterns (from `.pen`)

- **Landing / Login**
  - Top header + centered content card + clear CTA hierarchy.
- **App Shell Screens**
  - Fixed left sidebar (`w-60`) + main content area with page header.
  - Header title + subtitle + primary action button.
- **List Screens**
  - Search/filter row + data table/list cards + empty/error/skeleton states.
- **Form Screens**
  - Breadcrumb + title + sectioned form card + sticky/clear action footer.
- **Detail Screens**
  - Summary banner/card + tabbed or sectioned detail blocks + activity/history list.

## Implementation Contract

When asked to build a screen or feature:

1. Identify layout section(s) in `.pen`.
2. Build UI with shadcn/ui + Tailwind.
3. Create/extend Zod schema in validation layer.
4. Implement/extend server action with:
   - auth check
   - schema validation
   - role/ownership check
   - Supabase query/mutation
   - sanitized response
5. Wire loading, empty, and error states.
6. Revalidate relevant paths after mutations.

## Minimal Server Action Template

```ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const InputSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
});

export async function updateRecord(input: unknown) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Not authenticated." };
    }

    const parsed = InputSchema.safeParse(input);
    if (!parsed.success) {
      return {
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { error } = await supabase
      .from("records")
      .update({ name: parsed.data.name })
      .eq("id", parsed.data.id);

    if (error) {
      console.error("updateRecord: db error", error);
      return { error: "Failed to update record." };
    }

    revalidatePath("/dashboard/records");
    return { success: true };
  } catch (error) {
    console.error("updateRecord: unexpected error", error);
    return { error: "An unexpected error occurred." };
  }
}
```

## Guardrails

- Do not bypass auth, Zod validation, or role checks.
- Do not implement raw SQL strings in app code when Supabase query builder is sufficient.
- Do not introduce non-shadcn custom controls unless needed and justified.
- Do not diverge from `.pen` screen structure unless the task explicitly requests it.
