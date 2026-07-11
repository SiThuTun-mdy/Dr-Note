# Sentry Error Tracking Setup Guide

How to add Sentry error tracking to the DRNotes Next.js application.

---

## Prerequisites

- Sentry account (free tier works): https://sentry.io
- Next.js app scaffolded and running

---

## Step 1: Create Sentry Project

1. Go to https://sentry.io → Create Project
2. Select **Next.js** as the platform
3. Name: `dr-notes` (or your preferred name)
4. Choose your organization
5. Copy the **DSN** (format: `https://xxx@yyy.ingest.sentry.io/zzz`)

---

## Step 2: Install Packages

```bash
npx @sentry/wizard@latest -i nextjs
```

The wizard will:
- Install `@sentry/nextjs`
- Create config files (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`)
- Update `next.config.ts` with Sentry webpack plugin
- Create `app/error.tsx` and `app/global-error.tsx` if missing
- Add `.env.sentry-build-plugin` for source maps

**Alternatively, manual install:**

```bash
npm install @sentry/nextjs
```

---

## Step 3: Environment Variables

Add to `.env.local`:

```env
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=dr-notes
SENTRY_AUTH_TOKEN=your-auth-token  # From Sentry Settings → Auth Tokens
```

Add to `.env.example`:

```env
# Sentry (error tracking — get from https://sentry.io)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

**Important:**
- `NEXT_PUBLIC_SENTRY_DSN` — safe to expose (public key)
- `SENTRY_AUTH_TOKEN` — secret, never commit (used for source map upload)

---

## Step 4: Configuration Files

### `sentry.client.config.ts`

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for dynamic sampling
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console
  // while setting up Sentry.
  debug: false,

  // replaysOnErrorSessionSampleRate: 0.1, // Replay for 10% of error sessions
  // replaysSessionSampleRate: 0.1,        // Replay for 10% of all sessions

  // Uncomment to see Sentry logs in the browser console
  // beforeSend(event) {
  //   console.log("[Sentry]", event);
  //   return event;
  // },
});
```

### `sentry.server.config.ts`

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,
  debug: false,
});
```

### `sentry.edge.config.ts`

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,
  debug: false,
});
```

---

## Step 5: Update `next.config.ts`

```typescript
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // your existing config...
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload source maps to Sentry during build
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps in production
  silent: !process.env.CI,

  widenClientFileUpload: true,

  // Route browser requests to Sentry through a proxy to avoid ad-blockers
  // tunnelRoute: "/api/sentry",

  // Automatically tree-shake Sentry logger to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
});
```

---

## Step 6: Error Boundary Components

### `app/global-error.tsx` (catches errors in root layout)

```typescript
"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        {/* This error page uses a plain <next/error> page to render.
            TODO: Replace with your app's error page */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
```

### `app/(dashboard)/error.tsx` (catches errors in dashboard routes)

```typescript
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold text-destructive">
        Something went wrong
      </h2>
      <p className="text-muted-foreground">
        An unexpected error occurred. Our team has been notified.
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
```

---

## Step 7: Custom Error Logging in Server Actions

Capture non-fatal errors in server actions:

```typescript
"use server";

import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";

export async function riskyOperation() {
  const supabase = createClient();

  try {
    // ... operation logic
  } catch (error) {
    // Capture with context for debugging
    Sentry.captureException(error, {
      tags: {
        operation: "riskyOperation",
        component: "server-action",
      },
      extra: {
        // Add any relevant context (never include PII!)
        timestamp: new Date().toISOString(),
      },
    });

    // Return user-friendly error
    return { error: "An unexpected error occurred. Please try again." };
  }
}
```

---

## Step 8: Source Maps (Production)

Source maps are automatically uploaded during `next build` when `SENTRY_AUTH_TOKEN` is set.

For Vercel deployment, add the token to Vercel env vars:

```bash
vercel env add SENTRY_AUTH_TOKEN
```

---

## Step 9: Verify Installation

1. Start dev server: `npm run dev`
2. Trigger an error (e.g., visit a broken page, throw in a server action)
3. Check Sentry dashboard for the error event
4. Verify:
   - Error appears with correct stack trace
   - Breadcrumbs show user actions
   - Tags include route information

---

## Configuration Options

### Sample Rates

| Setting | Value | Purpose |
|---------|-------|---------|
| `tracesSampleRate` | `1.0` (dev) / `0.1` (prod) | Performance tracing |
| `replaysOnErrorSessionSampleRate` | `0.1` | Session replay on errors |
| `replaysSessionSampleRate` | `0.1` | Session replay sampling |

### Recommended Production Config

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,  // 10% of transactions
  replaysOnErrorSessionSampleRate: 0.1,
  replaysSessionSampleRate: 0.01,  // 1% of sessions
  environment: process.env.VERCEL_ENV || "development",
});
```

---

## What Sentry Captures Automatically

| Error Type | Captured? | Notes |
|------------|-----------|-------|
| Unhandled exceptions | ✅ | Client + Server |
| Unhandled promise rejections | ✅ | Client + Server |
| React component errors | ✅ | Via error boundary |
| Failed HTTP requests | ✅ | Client-side fetch |
| Console errors | ✅ | Via `captureConsoleIntegration` |
| Server Action errors | ⚠️ | Must capture manually in try/catch |

---

## Privacy & Compliance

**Never send to Sentry:**
- Patient names, emails, phone numbers
- Medical records or consultation notes
- Authentication credentials
- API keys or secrets

**Safe to send:**
- Error messages (sanitized)
- Stack traces
- Route paths (not query params with PII)
- User IDs (UUIDs, not emails)
- Performance metrics

---

## Related

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry on Vercel](https://docs.sentry.io/platforms/javascript/guides/nextjs/vercel/)
- [[dev-setup/setup-guide]] — Main development setup guide
