# /feature — Implement Feature

Feature:
$ARGUMENTS

Read:
- docs/02-PRD.md
- docs/12-Architecture.md
- docs/18-Sprint-Backlog.md (if exists — tasks may come from GitHub Project)
- docs/Progress.md
- docs/guide/03-design-system.md (if exists — PM's design guidelines)

## Mandatory Workflow

### 1. Understand the Feature
- Read PRD for acceptance criteria
- Read Architecture for technical patterns
- Read Sprint Backlog for task details
- Identify dependencies

### 2. Implement
- Write code following architecture patterns
- Use server actions, Supabase, shadcn/ui, Tailwind CSS
- Follow `backend-skill` patterns (auth first, validate input, defense in depth)
- Apply `frontend-design` for UI components
- Handle errors properly with try/catch
- Validate all inputs with Zod

### 3. Developer Self-Review
Review your own code for:
- [ ] **Security** — auth checks, input sanitization, no secrets exposed, RLS enforced
- [ ] **Error handling** — try/catch, structured responses, no raw error dumps
- [ ] **Input validation** — Zod schemas, server-side validation
- [ ] **Code quality** — TypeScript strict, no `any`, proper typing

### 4. Commit
```
git add -A && git commit -m "feat(<scope>): <description>"
```

### 5. QA Checks
Run ALL of these and fix any failures:
```bash
npm run lint          # ESLint
npx tsc --noEmit      # TypeScript
npm run build         # Build verification
```

### 6. Fix Issues
If Step 5 found problems:
1. Fix the issues
2. Re-run the failed checks
3. Repeat until all checks pass

### 7. Review
- Ask reviewer agent to review code quality and security
- Fix Critical and High findings

### 8. QA
- Ask qa agent to create/update tests
- Verify acceptance criteria are met

### 9. Update Docs
- Update `docs/Progress.md`
- Update `docs/10-Decisions.md` if new decisions are made

Do not implement unrelated features.
Do not skip any step.
Do not commit code that fails QA checks.
