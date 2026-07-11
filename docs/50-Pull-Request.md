# Lightweight Pull Request

## PR Title

feat: complete development framework setup

## Summary

Complete development framework setup with AI tools, documentation, and security configurations for the Dr-Note project. This PR establishes the foundation for the development team to start building MVP features.

## Changes

### AI Tools Configuration
- 16 skills (server-actions, ui-ux-pro-max, react-best-practices, supabase, etc.)
- 10 agents (orchestrator, developer, reviewer, qa, etc.)
- 15 commands (/bootstrap, /warmup, /feature, /review, etc.)
- 6 hooks (secret-scan, lint, typecheck, etc.)
- 3 MCP servers (Supabase, Playwright, GitHub)
- 4 plugins (code-review, vercel, frontend-design, context7)

### Documentation
- AI Tools Usage Guide (`docs/ai-tools-guide.md`)
- Tools & Stack Reference (`docs/tools-and-stack.md`)
- Conflict Analysis (`docs/conflict-analysis.md`)
- Architecture Decision Records (`docs/adr/`)
- Sprint Backlog (10 user stories, 80 tasks)

### Security
- Security review rule added to workflow
- ESLint configured to ignore `.claude/` directory
- RLS policies for all database tables

### Project Setup
- Next.js 14 + Supabase scaffold
- TypeScript, Tailwind CSS, shadcn/ui
- Environment variables template updated

## Testing

- [x] Dev server starts successfully
- [x] Production build passes
- [x] TypeScript check passes
- [x] ESLint check passes
- [x] Security review completed

## Notes

- Closes #3 (Development Framework Setup issue)
- Each developer must install plugins individually: `/plugin code-review`, `/plugin vercel`, `/plugin frontend-design`, `/plugin context7`
- Each developer must add `GITHUB_TOKEN` to `.env.local`
