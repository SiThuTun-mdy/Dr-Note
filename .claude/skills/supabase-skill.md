# Supabase Skill

Use for Supabase Auth, PostgreSQL, Storage, and RLS.

## Decision Trees

### Client Type Selection

```
Where is this code running?
├─ Server Component / API Route → createClient (server)
├─ Server Action → createClient (server)
├─ Client Component → createBrowserClient (browser)
└─ Middleware → createClient (middleware)
```

### RLS Policy Decision

```
Does this table contain user-specific data?
├─ Yes → Enable RLS
│   └─ Who should access?
│       ├─ Only the owner → USING (auth.uid() = user_id)
│       ├─ Owner + admin → USING (auth.uid() = user_id OR role = 'admin')
│       └─ Authenticated users → USING (auth.role() = 'authenticated')
└─ No (reference data) → Still enable RLS, allow read for all authenticated
```

## Patterns

### Server Client Setup

```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component, ignore
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component, ignore
          }
        },
      },
    }
  )
}
```

### Browser Client Setup

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Middleware Setup

```typescript
// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser()

  // Protect routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### RLS Policy Patterns

```sql
-- Owner-only access
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Owner + admin access
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Authenticated read, owner write
CREATE POLICY "Anyone can read published posts"
  ON posts FOR SELECT
  USING (published = true OR auth.uid() = author_id);

CREATE POLICY "Authors can insert/update own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);
```

### Migration Pattern

```sql
-- supabase/migrations/00001_create_profiles.sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'doctor', 'receptionist')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## Anti-Patterns

- ❌ Using service role key on client-side
- ❌ Skipping RLS on business tables
- ❌ Not using `auth.uid()` for user-context queries
- ❌ Hardcoding table names instead of using schema
- ❌ Not maintaining migrations (using dashboard SQL editor)

## Checklist

- [ ] RLS enabled on all business tables
- [ ] Policies for SELECT, INSERT, UPDATE, DELETE
- [ ] Service role only on server paths
- [ ] Migrations in `supabase/migrations/`
- [ ] Seed data in `supabase/seed.sql`
- [ ] Environment variables documented
