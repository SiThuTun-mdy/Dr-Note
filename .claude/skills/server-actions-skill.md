# Server Actions Skill

Guidelines for implementing Next.js Server Actions with Supabase in the Dr-Note project.

---

## Patterns

### Basic Server Action Structure

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function exampleAction(formData: FormData) {
  // 1. Create authenticated Supabase client
  const supabase = await createClient()

  // 2. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // 3. Validate input
  const name = formData.get('name') as string
  if (!name || name.length < 2) {
    return { error: 'Name must be at least 2 characters' }
  }

  // 4. Perform database operation
  const { data, error } = await supabase
    .from('table_name')
    .insert({ name, user_id: user.id })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // 5. Revalidate cache
  revalidatePath('/dashboard')

  // 6. Return success
  return { success: true, data }
}
```

### Error Handling Pattern

```typescript
'use server'

export async function actionWithTryCatch() {
  try {
    // ... action logic
    return { success: true, data }
  } catch (error) {
    console.error('Action error:', error)
    return { 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}
```

### Role-Based Action Pattern

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export async function adminOnlyAction() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Check role via database (defense in depth alongside RLS)
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Forbidden: Admin access required' }
  }

  // ... admin logic
}
```

### Form Action with Zod Validation

```typescript
'use server'

import { z } from 'zod'

const FormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/),
})

export async function validatedAction(prevState: any, formData: FormData) {
  const validated = FormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
  })

  if (!validated.success) {
    return { 
      error: 'Validation failed', 
      fieldErrors: validated.error.flatten().fieldErrors 
    }
  }

  // ... proceed with validated.data
}
```

---

## Rules

1. **Always use `'use server'` directive** at the top of server action files
2. **Always authenticate** using `createClient()` and `getUser()` 
3. **Always validate input** with Zod before database operations
4. **Always return structured responses** `{ success, data, error }`
5. **Use `revalidatePath()`** after mutations to refresh cached data
6. **Never expose service role key** to client-side code
7. **Use defense-in-depth** — check roles in code AND rely on RLS

---

## Common Mistakes to Avoid

❌ **Don't skip auth check:**
```typescript
// BAD - no authentication
export async function deletePatient(id: string) {
  const { error } = await supabase.from('patients').delete().eq('id', id)
}
```

✅ **Do authenticate first:**
```typescript
// GOOD - authenticated
export async function deletePatient(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  // ... proceed
}
```

❌ **Don't return raw errors:**
```typescript
// BAD - exposes internal details
return { error: databaseError.message }
```

✅ **Do sanitize errors:**
```typescript
// GOOD - safe error message
return { error: 'Failed to delete patient' }
```

---

## File Organization

```
src/
├── app/
│   └── actions/
│       ├── auth.ts          # Login, logout, signup
│       ├── doctors.ts       # Doctor CRUD
│       ├── patients.ts      # Patient CRUD
│       └── consultations.ts # Consultation CRUD
├── lib/
│   └── supabase/
│       ├── client.ts        # Browser client
│       ├── server.ts        # Server client
│       └── middleware.ts    # Middleware client
└── lib/
    └── validations/
        ├── doctor.ts        # Zod schemas
        ├── patient.ts
        └── consultation.ts
```
