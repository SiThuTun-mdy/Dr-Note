Check Supabase setup status for the Doctor Note project.

Read:
- package.json (check @supabase/supabase-js, @supabase/ssr)
- .env.example (check Supabase variables)
- .env.local (check for real values, not placeholders)
- supabase/migrations/ (check for schema files)
- ~/.claude/.mcp.json (check for global MCP config)
- .mcp.json (check for project MCP config)

Workflow:

1. **Check prerequisites:**
   - Verify `@supabase/supabase-js` and `@supabase/ssr` are installed
   - Verify `.env.example` exists with Supabase variables
   - Verify `supabase/migrations/` folder exists with schema

2. **Check MCP status (two levels):**
   - **Global MCP:** Read `~/.claude/.mcp.json` for `mcpServers.supabase` entry
   - **Project MCP:** Read `.mcp.json` for `mcpServers.supabase` entry
   - **Token:** Read `.env.local` for `SUPABASE_ACCESS_TOKEN` value
   - If EITHER MCP config exists AND token is set (not placeholder): MCP is AVAILABLE
   - If NEITHER MCP config OR token missing/placeholder: MCP is NOT AVAILABLE

3. **Check .env.local status:**
   - If `.env.local` does not exist: NOT CONFIGURED
   - If exists with placeholder values: NEEDS CONFIGURATION
   - If exists with real values (starts with http:// or sbp_): CONFIGURED

4. **Check database status (if MCP available):**
   - Use MCP to list tables: users, doctors, patients, consultations
   - Use MCP to check row counts
   - Use MCP to verify test users exist

5. **Report status:**

---

## Supabase Setup Status

| Item | Status |
|------|--------|
| Prerequisites | ✅/❌ |
| MCP | ✅ AVAILABLE (global/project) / ❌ NOT AVAILABLE |
| .env.local | ✅ CONFIGURED / ⚠️ NEEDS CONFIGURATION |
| Database Schema | ✅ MIGRATED / ⏳ PENDING |
| Test Users | ✅ CREATED / ⏳ PENDING |

---

6. **If setup INCOMPLETE, show guided steps:**

---

## Setup Guide

### Step 1: Get Supabase Access Token
1. Go to https://supabase.com/dashboard/account/tokens
2. Click **"Generate new token"**
3. Name: `claude-code`
4. Copy the token (starts with `sbp_`)

### Step 2: Add Token to `.env.local`
```
SUPABASE_ACCESS_TOKEN=sbp_your_token_here
```

### Step 3: Install MCP Globally
```bash
claude mcp add --scope user supabase -- npx -y @supabase/mcp-server-supabase@latest --access-token sbp_your_token_here
```

### Step 4: Restart Claude Code
Close and reopen for MCP to load.

### Step 5: Run `/supabase-setup` Again

---

7. **If setup COMPLETE, show test users:**

---

## Test Users

| Email | Password | Role |
|-------|----------|------|
| admin@drnote.com | testpass123 | admin |
| doctor@drnote.com | testpass123 | doctor |
| receptionist@drnote.com | testpass123 | receptionist |

---

8. **Show next steps:**
   - Login page (not yet implemented)
   - App features to build

---

## Team Sharing

To share this Supabase MCP setup with your team:

### Global Config (Recommended)
Each developer runs:
```bash
claude mcp add --scope user supabase -- npx -y @supabase/mcp-server-supabase@latest --access-token sbp_THEIR_TOKEN
```

### Project-Level Config
`.mcp.json` is committed with `${SUPABASE_ACCESS_TOKEN}` env var reference. Each developer sets their token in `.env.local`.

---

9. **Update docs/Progress.md:**
   - If all complete: Add "Supabase configured" to Completed
