Scaffold a Next.js + Supabase project in the current directory.

Feature:
$ARGUMENTS

Read:
- docs/00-Project-Brief.md
- docs/10-Decisions.md
- docs/12-Architecture.md (if not TODO)
- docs/Progress.md

Workflow:

1. Check if a Next.js project already exists (package.json in cwd). If yes, skip scaffolding and report current state.

2. Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` with appropriate flags. Confirm with user before executing if cwd is not empty.

3. Install Supabase dependencies:
   - `npm install @supabase/supabase-js @supabase/ssr`

4. Install shadcn/ui:
   - `npx shadcn@latest init`
   - Install core components: `npx shadcn@latest add button card dialog input label table select textarea`

5. Create project structure:
   ```
   supabase/
     config.toml
     migrations/
       00001_initial_schema.sql
     seed.sql
   src/
     lib/
       supabase/
         client.ts
         server.ts
         middleware.ts
     types/
       database.ts
   ```

6. Create `.env.example`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_ACCESS_TOKEN=your-access-token
   ```

7. Verify `.claude/` setup:
   - Check `.claude/skills/` contains: `frontend-design`, `ui-ux-pro-max`, `supabase-skill`, `react-best-practices`, `security-review-skill`, `server-actions-skill`, `doctor-note-domain-skill`, `qa-testing-skill`
   - If `frontend-design` is missing, install it: `npx claude-code-templates@latest --skill creative-design/frontend-design`
   - Check `.claude/agents/` contains all 10 agent definitions
   - Check `.claude/commands/` contains all command definitions
   - Check `.claude/hooks/` contains: `secret-scan.sh`, `lint.sh`, `typecheck.sh`, `progress-reminder.sh`
   - If any are missing, report which ones need to be created

8. Update `docs/Progress.md`:
   - Set Current Phase to "Phase 1: Product"
   - Add "Project scaffolded" to Completed
   - Mark "Sprint planning" and "Development" as In Progress

9. Stage and commit: `git add -A && git commit -m "feat: scaffold Next.js + Supabase project"`

Report what was created and what is next.
