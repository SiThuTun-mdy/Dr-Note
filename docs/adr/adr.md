# Architecture Decision Records (ADRs)

This document serves as the index for all Architecture Decision Records (ADRs) for the Dr-Note project.

## What is an ADR?

An ADR is a short document that captures a single architectural decision along with its context and consequences. It is a way to record important decisions that affect the project's architecture, ensuring clarity and shared understanding among team members.

## When to Create an ADR

An ADR is mandatory when:

- The team decides to adopt a new framework, library, or major tool.
- There is a significant change in the project's architecture or infrastructure.
- A technical decision is made that will affect the project long-term.
- An architectural principle or standard is established.

## ADR Format

ADRs are created and discussed in the `/docs/adr/decisions/` directory, using the format `NNNN-title-with-dashes.md`.

Each ADR should include:

- **Title:** A short, descriptive title.
- **Date:** The date the decision was made.
- **Status:** Proposed, Accepted, Deprecated, or Superseded.
- **Context:** The situation or problem that led to the decision.
- **Decision:** The decision that was made.
- **Alternatives Considered:** A summary of other options evaluated.
- **Consequences:** The expected impact of the decision.

## 1. AI-Driven Development Approach

**Date:** 2026-07-07
**Status:** Accepted
**Deciders:** KST, NLT, NCO

### Context

Dr-Note is a demo project for the **Vibecoding Tour** — a hands-on training session focused on AI-assisted software development. The primary goal is to demonstrate how AI tools can accelerate the development lifecycle, not to showcase a specific tech stack.

### Decision

We will use AI tools across all stages of development as the core learning objective:

| Stage             | AI Tool / Approach                                            |
| ----------------- | ------------------------------------------------------------- |
| Planning & Design | AI-assisted requirement gathering and architecture discussion |
| Coding            | AI pair programming (e.g., Claude Code, GitHub Copilot)       |
| Code Review       | AI-powered review and suggestion                              |
| Testing           | AI-generated test cases and validation                        |
| Documentation     | AI-assisted documentation writing                             |
| Deployment        | Standard CI/CD with AI-guided troubleshooting                 |

### Claude Code Features (Training Focus)

The training will specifically cover these Claude Code capabilities:

| Feature | Description |
|---------|-------------|
| **Skills** | Reusable prompt templates for common tasks |
| **Agents** | Autonomous sub-agents for parallel and complex workflows |
| **MCP** | Model Context Protocol for external tool integration |
| **Commands** | Slash commands for quick actions and workflows |
| **Hooks** | Custom triggers for automated behaviors on tool calls |

> 📖 See [Claude Code Tools](claude-code-tools.md) for detailed examples and usage patterns.

### Tech Stack (Supporting)

The tech stack is chosen for simplicity and fast setup — it serves the demo, not the other way around:

- **Frontend:** Next.js 14 + TypeScript + Tailwind + shadcn/ui
- **Backend/DB:** Supabase (PostgreSQL + auto REST API)
- **Hosting:** Vercel + Supabase free tier
- **State:** React Query + Zustand
- **Forms:** React Hook Form + Zod
- **Task Tracking:** GitHub Projects

### Consequences

- **Focus:** Training content centers on AI tool usage patterns, not framework deep-dives
- **Reproducibility:** Simple stack ensures participants can follow along without infrastructure friction
- **Takeaway:** Participants learn transferable AI-assisted development habits applicable to any stack

---
