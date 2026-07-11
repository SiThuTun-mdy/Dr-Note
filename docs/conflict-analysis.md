# Conflict Analysis

Tracks potential conflicts between skills, plugins, and tools. Use this to understand tool relationships and resolution rules.

---

## Resolution Rules

1. **Colleague suggestion wins** — If a colleague suggests a tool that conflicts, their choice takes priority
2. **Domain-specific beats generic** — Project-specific skills take precedence over general ones
3. **Plugin beats skill** — Installed plugins override project skills when overlapping
4. **Complementary > conflicting** — Most tools serve different purposes, not direct conflicts

---

## Skills Analysis

| Skill | Domain | Overlaps With | Conflict? |
|-------|--------|---------------|-----------|
| `ui-ux-pro-max` | Universal UI/UX | `frontend-design` | ❌ Complementary |
| `react-best-practices` | React/Next.js performance | — | ✅ No overlap |
| `supabase-skill` | Database | — | ✅ No overlap |
| `security-review-skill` | Security | — | ✅ No overlap |
| `qa-testing-skill` | Testing | — | ✅ No overlap |
| `backend-skill` | Backend | — | ✅ No overlap |

---

## Plugins Analysis

| Plugin | Overlaps With | Conflict? |
|--------|---------------|-----------|
| `frontend-design` | `ui-ux-pro-max`, `frontend-dev-skill` | ❌ Complementary |
| `code-review` | `/review` command | ❌ Different purpose |
| `vercel` | — | ✅ No overlap |
| `context7` | — | ✅ No overlap |

### `frontend-design` vs `ui-ux-pro-max`

**No conflict** — different focus:
- `frontend-design` = Design philosophy (bold, distinctive aesthetics)
- `ui-ux-pro-max` = Comprehensive design intelligence (67 styles, 161 palettes)

---

## Commands Analysis

| Command | Overlaps With | Conflict? |
|---------|---------------|-----------|
| `/review` | `/code-review` (plugin) | ❌ Different scope |
| `/pr-review` | `/code-review` (plugin) | ⚠️ Similar scope |
| `/qa` | — | ✅ No overlap |
| `/feature` | — | ✅ No overlap |
| `/security-review` | `security-review-skill` | ❌ Complementary |

### `/review` vs `/code-review`

**No conflict** — different workflow stages:
- `/review` = Internal code review (during development)
- `/code-review` = External PR review (before merge)

### `/pr-review` vs `/code-review`

**Potential conflict** — both review PRs on GitHub:
- `/pr-review` = Command: detailed review with report generation
- `/code-review` = Plugin: automated PR review with comments

**Resolution:** Keep both — `/pr-review` generates detailed reports, `/code-review` provides quick automated checks. Use `/pr-review` for thorough reviews, `/code-review` for quick checks.

### `/security-review` vs `security-review-skill`

**No conflict** — complementary:
- `/security-review` = Command to run security scan
- `security-review-skill` = Guidance for security review patterns

---

## MCP Analysis

| MCP Server | Overlaps With | Conflict? |
|------------|---------------|-----------|
| `supabase` | — | ✅ No overlap |
| `playwright` | `qa-testing-skill` | ❌ Complementary |
| `github` | — | ✅ No overlap |

### `playwright` MCP vs `qa-testing-skill`

**No conflict** — different layers:
- `playwright` MCP = Browser automation tool for E2E testing
- `qa-testing-skill` = Testing patterns and guidance (skill)

---

## Testing Tools Analysis

| Tool | Type | Overlaps With | Conflict? |
|------|------|---------------|-----------|
| `@playwright/test` | Test runner | `qa-testing-skill` | ❌ Complementary |
| `playwright` MCP | Browser automation | `qa-testing-skill` | ❌ Complementary |
| `vitest` | Unit test runner | — | ✅ No overlap |

### Testing Stack Summary

- **Unit/Integration tests:** Vitest
- **E2E tests:** Playwright
- **Testing guidance:** `qa-testing-skill`
- **Browser automation:** Playwright MCP

---

## Future Conflicts to Watch

| Potential Addition | Might Conflict With | Resolution |
|--------------------|---------------------|------------|
| New UI framework skill | `ui-ux-pro-max` | Compare scope, keep more specific |
| Testing plugin | `qa-testing-skill` | Plugin wins |
| New backend skill | `backend-skill` | Compare scope, keep more specific |
| Jest/Vitest conflict | `@playwright/test` | Different test levels (unit vs E2E) |

---

## Update Log

| Date | Change | Resolution |
|------|--------|------------|
| 2026-07-08 | Installed `@playwright/test` | No conflict — E2E test runner |
| 2026-07-08 | Installed `playwright` MCP | No conflict — complementary to `qa-testing-skill` |
| 2026-07-08 | Installed `context7` plugin | No conflict |
| 2026-07-08 | Installed `github` MCP | No conflict — PR/issue management |
| 2026-07-08 | Created `server-actions-skill` | No conflict — Next.js Server Actions patterns |
| 2026-07-08 | Created `/pr-review` command | Similar to `/code-review` but different depth |
| 2026-07-08 | Removed `documentation-skill.md` | Redundant with `context7` plugin |
| 2026-07-08 | Installed `react-best-practices` skill | No conflict — complementary |
| 2026-07-08 | Installed `frontend-design` plugin | No conflict — complementary |
| 2026-07-08 | Installed `ui-ux-pro-max` skill | Replaced `uiux-skill` (colleague's choice wins) |
| 2026-07-08 | Removed `uiux-skill.md` | Replaced by `ui-ux-pro-max` |
| 2026-07-08 | Removed `frontend-dev-skill.md` | Redundant with `react-best-practices` |
| 2026-07-08 | Removed `nextjs-skill.md` | Redundant with `react-best-practices` |
| 2026-07-08 | Initial conflict analysis | — |
