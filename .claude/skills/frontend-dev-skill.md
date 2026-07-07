---
name: Frontend Development Skill
description: Next.js, React, TypeScript implementation patterns and best practices
globs:
  - "src/**/*.tsx"
  - "src/**/*.ts"
  - "src/**/*.css"
  - "next.config.*"
  - "tsconfig.json"
---

# Frontend Development Skill

## Identity

You are a senior frontend developer specializing in Next.js 14, React 18, TypeScript, and Tailwind CSS. You write clean, performant, accessible code.

## Tech Stack

- **Framework:** Next.js 14 (App Router, Server Components, Server Actions)
- **Language:** TypeScript strict mode
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **State:** Server Components by default, Client Components only when needed
- **Data:** Supabase (PostgreSQL, Auth, RLS)

## Core Rules

### Server vs Client Components
```tsx
// Server Component (default) — can fetch data directly
export default async function Page() {
  const data = await fetchData();
  return <ClientComponent data={data} />;
}

// Client Component — only when you need interactivity
"use client";
export default function ClientComponent({ data }) {
  const [state, setState] = useState();
  // ...
}
```

**Rule:** Use Server Components by default. Add `"use client"` only when you need:
- `useState`, `useReducer`, `useEffect`
- Event handlers (`onClick`, `onSubmit`)
- Browser APIs (`window`, `document`)
- Third-party client libraries

### Server Actions
```tsx
// src/app/actions/example.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function myAction(formData: FormData) {
  const supabase = createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not authenticated." };

  // Validate input
  const value = formData.get("field");
  if (!value || typeof value !== "string") return { error: "Field is required." };

  // Perform operation
  const { error } = await supabase.from("table").insert({ ... });
  if (error) return { error: error.message };

  // Revalidate cache
  revalidatePath("/dashboard");

  return { success: true };
}
```

### Data Fetching Patterns
```tsx
// Parallel fetching (always prefer)
const [result1, result2] = await Promise.all([
  supabase.from("table1").select("*"),
  supabase.from("table2").select("*"),
]);

// Sequential only when dependent
const { data: user } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from("profiles").select("*").eq("id", user.id).single();
```

### Error Handling
```tsx
// Server action pattern
export async function myAction() {
  try {
    // ... operation
    if (error) return { error: error.message };
    return { success: true };
  } catch {
    return { error: "An unexpected error occurred." };
  }
}

// Page pattern
const result = await fetchData();
if (result.error || !result.data) notFound();
```

### Type Safety
```tsx
// Use Database types from Supabase
import type { Database } from "@/types/database";

type PatientRow = Database["public"]["Tables"]["patients"]["Row"];
type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"];
type UserRole = Database["public"]["Enums"]["user_role"];

// Props interface
interface PageProps {
  params: { id: string };
}
```

## File Structure

```
src/
├── app/
│   ├── (auth)/              # Auth pages (login, signup)
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/         # Dashboard pages
│   │   ├── components/      # Shared dashboard components
│   │   │   ├── NavBar.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── PageLoading.tsx
│   │   │   ├── PageError.tsx
│   │   │   └── PageEmpty.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── patients/
│   │   ├── doctors/
│   │   ├── consultations/
│   │   └── users/
│   ├── actions/             # Server actions
│   │   ├── auth.ts
│   │   ├── patients.ts
│   │   ├── doctors.ts
│   │   └── consultations.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx             # Landing page
├── components/
│   └── ui/                  # shadcn components
├── lib/
│   ├── supabase/
│   │   ├── server.ts        # Server client
│   │   ├── client.ts        # Browser client
│   │   └── middleware.ts    # Auth middleware
│   └── utils.ts
└── types/
    ├── database.ts          # Supabase types
    └── global.d.ts          # CSS module declarations
```

## Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Pages | `page.tsx` | `src/app/dashboard/page.tsx` |
| Components | PascalCase | `NavBar.tsx`, `PageHeader.tsx` |
| Server Actions | camelCase | `getPatients.ts`, `createDoctor.ts` |
| Types | PascalCase | `PatientRow`, `UserRole` |
| CSS Classes | Tailwind utilities | `className="text-sm font-medium"` |

## Performance Rules

1. **Server Components first** — No client JS unless needed
2. **Parallel data fetching** — Use `Promise.all` for independent queries
3. **Dynamic imports** — For heavy client components
4. **Image optimization** — Use `next/image` for all images
5. **Font optimization** — Use `next/font` (Inter is configured)
6. **No unnecessary re-renders** — Memoize only when measured

## Common Patterns

### Loading State
```tsx
// Page level
if (loading) return <PageLoading />;

// Inline
{loading && <Skeleton className="h-4 w-32" />}
```

### Form Handling
```tsx
// Client component with Server Action
"use client";
import { useActionState } from "react";

export default function Form() {
  const [state, formAction, isPending] = useActionState(myAction, null);

  return (
    <form action={formAction}>
      <Label htmlFor="field">Field</Label>
      <Input id="field" name="field" required />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save"}
      </Button>
      {state?.error && <p className="text-destructive">{state.error}</p>}
    </form>
  );
}
```

### List Page
```tsx
// Server Component with data fetching
export default async function ListPage() {
  const result = await getData();
  if (result.error) return <PageError message={result.error} />;
  const data = result.data ?? [];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Items" action={<LinkAdd />} />
      {data.length === 0 ? (
        <PageEmpty title="No items" description="..." actionLabel="Add" actionHref="/new" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>...</Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

## What NOT to Do

- ❌ Don't use `useEffect` for data fetching in Server Components
- ❌ Don't fetch data in Client Components when Server Components can
- ❌ Don't use `any` type — always type your data
- ❌ Don't mutate state directly — use setState
- ❌ Don't skip error handling — always handle errors
- ❌ Don't use `window` or `document` in Server Components
- ❌ Don't create new objects in render — memoize or stabilize
- ❌ Don't use `index` as key for dynamic lists
- ❌ Don't forget `"use server"` in Server Actions
- ❌ Don't forget `revalidatePath` after mutations
