# Refresh Token Rotation Configuration

**Document ID**: 09  
**Version**: 1.0  
**Status**: Ready to Implement  
**Created**: 2026-07-11  

---

## Overview

Refresh token rotation is a security feature that automatically invalidates old refresh tokens when a new one is issued. This reduces the window of opportunity for stolen refresh tokens to be used.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                   REFRESH TOKEN ROTATION                        │
└─────────────────────────────────────────────────────────────────┘

1. INITIAL LOGIN
   ┌──────────┐      ┌──────────┐
   │  Client  │─────▶│ Supabase │
   └──────────┘      └──────────┘
         │
         ▼
   Access Token: eyJhbGc...  (expires in 1 hour)
   Refresh Token: abc123...  (single use)

2. TOKEN REFRESH (Normal)
   ┌──────────┐      ┌──────────┐
   │  Client  │─────▶│ Supabase │
   └──────────┘      └──────────┘
         │
         │  Send: abc123... (old refresh token)
         │
         ▼
   New Access Token: eyJhbGc...  (new, expires in 1 hour)
   New Refresh Token: def456...  (new, single use)
   
   OLD TOKEN abc123... IS NOW INVALID

3. STOLEN TOKEN ATTEMPT
   ┌──────────┐      ┌──────────┐
   │ Attacker │─────▶│ Supabase │
   └──────────┘      └──────────┘
         │
         │  Send: abc123... (stolen, already used)
         │
         ▼
   ERROR: Token already used
   ALL TOKENS FOR THIS USER REVOKED
```

---

## Supabase Configuration

### Step 1: Enable in Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Scroll to **Security** section
3. Enable **Refresh Token Rotation**
4. Set **Token Rotation Interval**: `3600` (1 hour)
5. Enable **Reuse Interval** detection

### Step 2: Configure Token Settings

```sql
-- Run in Supabase SQL Editor
-- Update auth settings (if needed)

-- Set refresh token reuse interval (seconds)
-- This detects if a token is used after it was already rotated
UPDATE auth.config
SET security_refresh_token_reuse_interval = 10
WHERE true;
```

### Step 3: Environment Variables

Add to `.env.local`:

```env
# Token rotation settings (handled by Supabase, but documented here)
# These are configured in Supabase Dashboard, not in code
SUPABASE_AUTH_REFRESH_TOKEN_ROTATION=true
SUPABASE_AUTH_TOKEN_REUSE_INTERVAL=10
```

---

## Implementation

### Middleware Updates

The existing middleware already handles token refresh automatically:

```typescript
// src/lib/supabase/middleware.ts
export async function updateSession(request: NextRequest) {
  const supabase = createServerClient(/* ... */)

  // This automatically uses refresh token rotation
  // when Supabase is configured for it
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ... rest of middleware
}
```

### Client-Side Handling

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Auto-refresh token before expiry
        autoRefreshToken: true,
        // Persist session in cookies
        persistSession: true,
        // Detect token reuse
        detectSessionInUrl: true,
      }
    }
  )
}
```

### Handling Token Reuse Detection

When a stolen token is detected, Supabase revokes all tokens for the user. Handle this in your application:

```typescript
// src/lib/supabase/auth-handler.ts
export async function handleAuthStateChange(
  event: string,
  session: Session | null
) {
  switch (event) {
    case 'SIGNED_IN':
      console.log('User signed in')
      break

    case 'SIGNED_OUT':
      console.log('User signed out')
      // Clear any local state
      break

    case 'TOKEN_REFRESHED':
      console.log('Token refreshed successfully')
      break

    case 'USER_UPDATED':
      console.log('User updated')
      break

    case 'PASSWORD_RECOVERY':
      console.log('Password recovery initiated')
      break

    default:
      // Check for auth errors
      if (session === null) {
        // Session expired or token revoked
        console.log('Session ended - may be due to token reuse detection')
        // Redirect to login
        window.location.href = '/login?reason=session_ended'
      }
  }
}
```

---

## Security Benefits

| Benefit | Description |
|---------|-------------|
| **Reduced Theft Window** | Stolen tokens expire after rotation (1 hour max) |
| **Automatic Revocation** | Token reuse detection revokes all user tokens |
| **Session Hijacking Prevention** | Attacker loses access when legitimate user refreshes |
| **Audit Trail** | Each token use is logged for monitoring |

---

## Monitoring & Alerts

### Token Reuse Detection

Monitor for token reuse attempts in Supabase logs:

```sql
-- Query for potential token reuse detection
SELECT
  created_at,
  event_type,
  ip_address,
  user_agent
FROM auth.audit_log_entries
WHERE event_type = 'token.rotation_detected'
ORDER BY created_at DESC
LIMIT 100;
```

### Recommended Alerts

1. **High Priority**: Token reuse detected (possible theft)
2. **Medium Priority**: Multiple failed refresh attempts
3. **Low Priority**: Unusual refresh patterns (time, location)

---

## Testing

### Test Case 1: Normal Token Refresh

1. Login and get access/refresh tokens
2. Wait for access token to expire (or manually expire)
3. Make request that triggers refresh
4. Verify new tokens issued
5. Verify old refresh token is invalid

### Test Case 2: Token Reuse Detection

1. Login and capture refresh token
2. Use refresh token to get new tokens
3. Attempt to use OLD refresh token again
4. Verify error response
5. Verify all user tokens are revoked

### Test Case 3: Stolen Token Scenario

1. User A logs in normally
2. Attacker steals User A's refresh token
3. User A continues using app (triggers normal refresh)
4. Attacker attempts to use stolen token
5. Verify attacker is blocked
6. Verify User A is not affected (new token already issued)

---

## Rollback Plan

If issues arise, disable token rotation:

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Disable **Refresh Token Rotation**
3. Existing sessions will continue to work
4. New sessions will use non-rotating tokens

---

## References

- [Supabase Auth Tokens](https://supabase.com/docs/guides/auth/auth-tokens)
- [Refresh Token Rotation](https://supabase.com/docs/guides/auth/refresh-tokens)
- [Token Security](https://supabase.com/docs/guides/auth/jwts)

---

**Document End**
