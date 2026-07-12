# /security-review — Security Vulnerability Scan

Run security review using the `security-review-skill` checklist.

Read:
- docs/12-Architecture.md
- docs/23-Review-Report.md (if exists)
- docs/Progress.md
- src/app/actions/**/*.ts
- src/lib/supabase/**/*.ts
- src/middleware.ts

## Scan Categories

### 1. Authentication
- Login requires email + password
- Password minimum length enforced (8+ chars)
- Session expires after reasonable time
- Logout invalidates session
- No hardcoded credentials in code
- Auth tokens not logged

### 2. Authorization
- RBAC enforced on all endpoints
- Role checks before data access
- No direct database access bypassing auth
- Admin routes protected
- API routes validate user permissions

### 3. RLS / Data Access
- RLS enabled on all business tables
- Policies prevent unauthorized SELECT
- Policies prevent unauthorized INSERT/UPDATE/DELETE
- Service role never exposed to client
- No data leakage through API responses

### 4. Input Validation
- Server-side validation on all inputs (Zod schemas)
- Client-side validation for UX (not security)
- SQL injection prevention (parameterized queries via Supabase)
- XSS prevention (escaped output)
- File upload validation (type, size)

### 5. Error Handling
- Generic error messages to users
- Detailed errors only in server logs
- No stack traces exposed
- No database errors exposed
- No internal paths exposed

### 6. Secret Management
- No secrets in code
- No secrets in git history
- Environment variables for all secrets
- .env.example (no real values)
- .gitignore includes .env

### 7. Sensitive Data
- PII encrypted at rest
- HTTPS enforced
- No sensitive data in URLs
- No sensitive data in logs
- Data retention policies

## Common Vulnerability Patterns to Scan

| Pattern | Risk | Fix |
|---|---|---|
| `formData.get()` without validation | Injection | Use zod schema |
| Missing RLS policy | Data leak | Add policy with auth.uid() |
| Service role on client | Full DB access | Move to server action |
| `innerHTML` with user input | XSS | Use `textContent` or sanitize |
| String concatenation in SQL | SQL injection | Use parameterized queries |
| No rate limiting on auth | Brute force | Add rate limiter |
| Exposed error messages | Info disclosure | Generic error responses |

## Output

Create/update:
- docs/24-Security-Report.md

Format findings as:
```
[FIND-XXX] Severity: Critical/High/Medium/Low
Category: Authentication/Authorization/RLS/Validation/Secrets/Sensitive Data
File: path/to/file.ts:line
Description: What the vulnerability is
Impact: What an attacker could do
Recommendation: How to fix it
```

## Gate Rules

- Critical > 0 → BLOCK release
- High > 0 → BLOCK release
- Medium → Must have remediation plan
- Low → Track for next sprint

Do not proceed with deployment if Critical or High findings exist.
