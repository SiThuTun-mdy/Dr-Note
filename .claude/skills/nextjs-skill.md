# Next.js Skill

Use for Next.js App Router projects.

## Decision Trees

### Server vs Client Component

```
Does the component need useState/useEffect/event handlers?
├─ Yes → "use client" at top of file
└─ No → Default to Server Component

Does it fetch data?
├─ Yes → Server Component (fetch in component or Server Action)
└─ No → See above

Does it use browser APIs?
├─ Yes → "use client"
└─ No → Server Component
```

### Data Fetching

```
Is this a mutation (create/update/delete)?
├─ Yes → Use Server Action (see backend-skill for patterns)
└─ No → Is it static or dynamic?
    ├─ Static → fetch with { cache: 'force-cache' }
    ├─ Dynamic → fetch with { cache: 'no-store' } or dynamic = 'force-dynamic'
    └─ Time-based → fetch with { next: { revalidate: N } }
```

## Patterns

### Server Component with Data

```typescript
// app/(dashboard)/patients/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function PatientsPage() {
  const supabase = createClient()

  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1>Patients</h1>
      {patients?.map(patient => (
        <PatientCard key={patient.id} patient={patient} />
      ))}
    </div>
  )
}
```

### Parallel Data Fetching

```typescript
// Always prefer parallel for independent queries
const [patients, doctors] = await Promise.all([
  supabase.from('patients').select('*'),
  supabase.from('doctors').select('*'),
]);

// Sequential only when dependent
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from('profiles').select('*').eq('id', user.id).single();
```

### Error Boundary Pattern

```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Dynamic Route Params

```typescript
// Next.js 14 — params is synchronous
interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
  const { id } = params;
  // ...
}

// Next.js 15+ — params is a Promise
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  // ...
}
```

### Route Groups
```
app/
├── (auth)/           # Group: no URL segment
│   ├── login/
│   └── signup/
├── (dashboard)/      # Group: shared layout
│   ├── patients/
│   └── doctors/
```

### Loading & Error States
```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}

// app/dashboard/error.tsx
"use client";
export default function Error({ error, reset }) {
  return <div>Error: {error.message} <button onClick={reset}>Retry</button></div>;
}

// app/dashboard/not-found.tsx
export default function NotFound() {
  return <div>Not found</div>;
}
```

## Anti-Patterns

- ❌ Using `"use client"` unnecessarily (defaults to Server Components)
- ❌ Fetching data in useEffect when it could be a Server Component
- ❌ Using `window` or other browser APIs in Server Components
- ❌ Importing client-only libraries in Server Components without `"use client"`
- ❌ Using `index` as key for dynamic lists
- ❌ Creating new objects/functions in render without memoization

## Checklist

- [ ] Server Components by default
- [ ] `"use client"` only when needed
- [ ] Server Actions for mutations (see backend-skill)
- [ ] Parallel data fetching with `Promise.all`
- [ ] Error boundaries for each route group
- [ ] Loading states for async components
- [ ] Proper TypeScript types for props and data
