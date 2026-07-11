# Decisions

Use this file as the project decision log.

## DEC-001: Initial Stack

Decision: Use Next.js 14, TypeScript, Supabase, PostgreSQL, Tailwind CSS, shadcn/ui, Vercel, React Query, Zustand, React Hook Form, Zod, and GitHub Projects.

Reason: Fast MVP delivery with modern full-stack capabilities. Simple stack ensures participants can follow along without infrastructure friction.

Owner: Orchestrator

Status: Accepted

---

## DEC-002: PRD Approved

Decision: Approved the Product Requirements Document (PRD) for Doctor Note MVP.

Reason: Establishes the authoritative source for feature scope, user stories, acceptance criteria, and delivery roadmap.

Owner: Product Manager Agent

Status: Accepted

---

## DEC-003: MVP Scope Definition

Decision: MVP includes Authentication, RBAC, Doctor Management, Patient Registration, Patient Search, Patient Profile, Consultation Notes, and Patient History as Must-Have features. Dashboard and PDF Export are Should-Have.

Reason: Must-Have features deliver the core value proposition -- digitizing clinic records with role-based access. Dashboard and PDF are enhancements that can be deferred if timeline is at risk.

Owner: Product Manager Agent

Status: Accepted

---

## DEC-004: MoSCoW Prioritization

Decision: Use MoSCoW method for feature prioritization. Must-Have features must be complete before any Should-Have work begins.

Reason: 2-week timeline requires strict scope discipline. MoSCoW provides clear cut-off criteria.

Owner: Product Manager Agent

Status: Accepted

---

## DEC-005: External Document Import

Decision: `/warmup` supports importing external PRD, Architecture, and Sprint Backlog documents from other team members.

Reason: Team members may provide documents in their own format. Instead of reformatting, we copy their document directly to `docs/` output folder. This preserves their content and avoids agent re-generation.

Flow:
- Check `templates/docs/{doc}-External.md`
- If exists → copy to `docs/{doc}.md` (skip generation)
- If not exists → generate via agent (normal flow)

Example: `templates/docs/02-PRD-External.md` → `docs/02-PRD.md`

Owner: Orchestrator

Status: Accepted
