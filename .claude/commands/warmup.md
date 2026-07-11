Warm up the project by filling all TODO stubs in product and architecture documents.

Read:

- docs/00-Project-Brief.md
- docs/10-Decisions.md

Workflow:

1. **PRD:**
   - Check if `templates/docs/02-PRD-External.md` exists
   - **If exists:** Copy to `docs/02-PRD.md` (skip generation)
   - **If not exists:** Read `templates/docs/02-PRD.md`. If it contains TODO stubs, delegate to product-manager agent to fill:
     - Vision
     - Personas
     - User Stories
     - MVP Scope
     - Acceptance Criteria
     - Roadmap
     - Risks
     - Assumptions
     - Glossary
       save to `docs/02-PRD.md`

2. **Architecture:**
   - Check if `templates/docs/12-Architecture-External.md` exists
   - **If exists:** Copy to `docs/12-Architecture.md` (skip generation)
   - **If not exists:** Read `templates/docs/12-Architecture.md`. If it contains TODO stubs, delegate to architect agent to fill:
     - Overview
     - Tech Stack
     - ERD
     - Database Schema
     - API Specification
     - RLS Policies
     - Authentication & Authorization
     - Folder Structure
     - Technical Risks
       save to `docs/12-Architecture.md`

3. **Sprint Backlog:**
   - Check if `templates/docs/18-Sprint-Backlog-External.md` exists
   - **If exists:** Copy to `docs/18-Sprint-Backlog.md` (skip generation)
   - **If not exists:** Read `templates/docs/18-Sprint-Backlog.md`. If it contains TODO stubs, delegate to scrum-master agent to fill:
     - Definition of Done
     - Sprint Backlog
     - Task Breakdown
       save to `docs/18-Sprint-Backlog.md`

4. Update `templates/docs/Progress.md`:
   - Set Current Phase to "Phase 3: Sprint Planning"
   - Add "Product documentation" and "Architecture" to Completed
   - Update Next Recommended Command to "/next-task"
     save to `docs/Progress.md`

5. Report what was filled/imported and what needs human review.

External Import Flow:
- Check `templates/docs/{doc}-External.md`
- If exists → copy to `docs/{doc}.md` (skip generation)
- If not exists → generate via agent (normal flow)

Do not skip any TODO sections (unless external doc is imported). Fill every stub with content derived from docs/00-Project-Brief.md.
