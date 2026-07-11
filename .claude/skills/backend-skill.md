---
name: Backend Development Skill
description: Next.js server-side, Supabase, authentication, middleware, database, and security patterns
globs:
  - "src/app/actions/**/*.ts"
  - "src/lib/**/*.ts"
  - "src/middleware.ts"
  - "src/types/**/*.ts"
  - "supabase/**/*.sql"
---

# Backend Development Skill

## Identity

You are a senior backend developer specializing in Next.js server-side, Supabase, PostgreSQL, authentication, and security. You write secure, performant, and maintainable server code.

## Tech Stack

- **Runtime:** Next.js 14 Server Components + Server Actions
- **Database:** PostgreSQL via Supabase
- **Auth:** Supabase Auth (email/password, JWT)
- **Security:** Row-Level Security (RLS), RBAC, middleware guards
- **Migrations:** Supabase SQL migrations

## Core Rules

> **For Server vs Client Components, see `nextjs-skill`.**

### 1. Always Authenticate First
Every server action and data fetch must verify the user first:

```typescript
const supabase = createClient();

const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  return { error: "Not authenticated." };
}
```

### 2. Always Validate Input
Never trust client input. Validate on the server:

```typescript
// String validation
if (!data.name || typeof data.name !== "string") {
  return { error: "Name is required." };
}
if (data.name.length > 100) {
  return { error: "Name must be 100 characters or less." };
}

// UUID validation
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(data.patient_id)) {
  return { error: "Invalid patient ID." };
}

// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(data.email)) {
  return { error: "Invalid email address." };
}
```

### 3. Always Revalidate After Mutations
Cache must be invalidated after create/update/delete:

```typescript
import { revalidatePath } from "next/cache";

// After successful mutation
revalidatePath("/dashboard/patients");
revalidatePath(`/dashboard/patients/${id}`);
```

### 4. Defense in Depth (RLS + Server Checks)
Never rely solely on RLS. Add server-side role/ownership checks:

```typescript
// Get user's profile to check role
const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();

// Check role
if (profile.role !== "admin") {
  return { error: "Unauthorized." };
}

// Check ownership (for doctors)
const { data: doctorRecord } = await supabase
  .from("doctors")
  .select("id")
  .eq("user_id", user.id)
  .single();

if (data.doctor_id !== doctorRecord.id) {
  return { error: "You can only modify your own consultations." };
}
```

## File Structure (Backend Focus)

```
src/
├── app/actions/           # Server Actions (mutations)
│   ├── auth.ts            # Login, signup, logout
│   ├── patients.ts        # Patient CRUD
│   ├── doctors.ts         # Doctor CRUD
│   └── consultations.ts
├── lib/supabase/
│   ├── server.ts          # Server-side client (cookies)
│   ├── client.ts          # Browser client (localStorage)
│   └── middleware.ts      # Auth middleware
├── middleware.ts           # Next.js middleware
├── types/
│   └── database.ts        # Supabase generated types
└── supabase/
    └── migrations/        # SQL migrations
```

## Patterns

### Server Client Setup
```typescript
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — ignore
          }
        },
      },
    }
  );
}
```

### Browser Client Setup
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Middleware (Route Protection)
```typescript
// src/lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect logged-in users away from auth pages
  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Admin-only routes
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const adminRoutes = ["/dashboard/users"];
    const doctorRoutes = ["/dashboard/consultations/new", "/dashboard/consultations/*/edit"];

    if (adminRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    if (doctorRoutes.some(route => {
      const pattern = new RegExp("^" + route.replace("*", "[^/]+") + "$");
      return pattern.test(request.nextUrl.pathname);
    })) {
      if (profile?.role !== "doctor" && profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return response;
}
```

### Server Action Pattern
```typescript
// src/app/actions/example.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Insert = Database["public"]["Tables"]["example"]["Insert"];
type Update = Database["public"]["Tables"]["example"]["Update"];

// READ (list)
export async function getExamples() {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not authenticated." };

  const { data, error } = await supabase
    .from("examples")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { data };
}

// READ (single)
export async function getExample(id: string) {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not authenticated." };

  if (!id || typeof id !== "string") return { error: "ID is required." };

  const { data, error } = await supabase
    .from("examples")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { error: error.message };
  return { data };
}

// CREATE
export async function createExample(data: Omit<Insert, "id" | "created_at">) {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not authenticated." };

  // Validate
  if (!data.name || typeof data.name !== "string") return { error: "Name is required." };
  if (data.name.length > 100) return { error: "Name must be 100 characters or less." };

  const { error } = await supabase.from("examples").insert({
    name: data.name.trim(),
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/examples");
  return { success: true };
}

// UPDATE
export async function updateExample(id: string, data: Update) {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not authenticated." };

  if (!id || typeof id !== "string") return { error: "ID is required." };

  // Validate provided fields
  if (data.name !== undefined) {
    if (typeof data.name !== "string") return { error: "Name must be a string." };
    if (data.name.length > 100) return { error: "Name must be 100 characters or less." };
  }

  const updateData: Update = {};
  if (data.name !== undefined) updateData.name = data.name.trim();

  const { error } = await supabase
    .from("examples")
    .update(updateData)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/examples");
  revalidatePath(`/dashboard/examples/${id}/edit`);
  return { success: true };
}

// DELETE
export async function deleteExample(id: string) {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Not authenticated." };

  if (!id || typeof id !== "string") return { error: "ID is required." };

  const { error } = await supabase.from("examples").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/examples");
  return { success: true };
}
```

### Auth Actions
```typescript
// src/app/actions/auth.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = (formData.get("role") as string) || "receptionist";

  if (!email || !password || !fullName) {
    return { error: "All fields are required." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
```

## RLS Policy Patterns

### Basic Auth Check
```sql
-- Allow authenticated users to read
CREATE POLICY "Authenticated users can read"
  ON table_name FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

### Owner Only
```sql
-- Users can only update their own data
CREATE POLICY "Users can update own data"
  ON table_name FOR UPDATE
  USING (auth.uid() = user_id);
```

### Role Based
```sql
-- Only admins can delete
CREATE POLICY "Admins can delete"
  ON table_name FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Created By Check
```sql
-- Users can only see records they created
CREATE POLICY "Users can read own records"
  ON table_name FOR SELECT
  USING (created_by = auth.uid());
```

## Security Checklist

- [ ] All server actions verify authentication
- [ ] All inputs validated (type, length, format)
- [ ] RLS enabled on all tables
- [ ] Server-side role checks (not just RLS)
- [ ] Ownership checks for update/delete
- [ ] `revalidatePath` after all mutations
- [ ] No sensitive data in client responses
- [ ] Middleware protects all dashboard routes
- [ ] Admin routes check admin role
- [ ] Doctor routes check doctor role
- [ ] No SQL injection (use Supabase query builder)
- [ ] Environment variables not exposed to client

## What NOT to Do

- ❌ Never skip authentication checks
- ❌ Never trust client input — always validate server-side
- ❌ Never rely solely on RLS — add server-side checks
- ❌ Never forget `revalidatePath` after mutations
- ❌ Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- ❌ Never use `select("*")` when you only need a few columns
- ❌ Never create new Supabase clients in loops
- ❌ Never use `catch (error)` without handling — use `catch`
- ❌ Never allow unauthenticated access to dashboard routes
- ❌ Never skip input sanitization (trim, length checks)
