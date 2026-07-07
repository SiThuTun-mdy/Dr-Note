# Documentation Skill

Documentation must be clear, accurate, and maintainable.

## Document Structures

### README.md

```markdown
# Project Name

Brief description of what this project does.

## Features

- Feature 1
- Feature 2

## Tech Stack

- Next.js
- Supabase
- Tailwind CSS

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
1. Clone the repo
2. Install dependencies: `npm install`
3. Copy .env.example to .env.local
4. Run development server: `npm run dev`

### Environment Variables
| Variable | Description |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anonymous key |

## Development

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run lint` — Run linter
- `npm run test` — Run tests

## Deployment

See [Deployment Guide](docs/38-Deployment-Report.md)

## License

MIT
```

### Developer Guide

```markdown
# Developer Guide

## Architecture
Overview of system design and components.

## Project Structure
Explanation of folder layout.

## Coding Standards
- TypeScript strict mode
- ESLint rules
- Prettier formatting

## Adding a Feature
1. Create branch
2. Implement feature
3. Add tests
4. Update docs
5. Submit PR

## Database
- Migrations in supabase/migrations/
- Use Supabase CLI for local development

## Testing
- Unit tests in __tests__/
- Integration tests for API routes
- E2E tests for critical paths
```

### API Documentation

```markdown
# API Reference

## Authentication
All API routes require authentication via Supabase Auth.

## Endpoints

### GET /api/patients
Get list of patients.

**Auth:** Required
**Response:** 200 OK
```json
{
  "data": [...],
  "total": 10
}
```

### POST /api/patients
Create a new patient.

**Auth:** Required (admin/receptionist)
**Body:**
```json
{
  "name": "string",
  "email": "string"
}
```
**Response:** 201 Created
```

## Documentation Checklist

- [ ] README with setup instructions
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Architecture diagram (if complex)
- [ ] Deployment guide
- [ ] Contributing guidelines (if team)
- [ ] Changelog maintained

## Anti-Patterns

- ❌ Documentation out of sync with code
- ❌ Missing setup instructions
- ❌ No API documentation
- ❌ Assuming reader knowledge
- ❌ Missing examples
- ❌ No version/date tracking

## Gate Rules

- Documentation must be updated before release
- README must have working setup instructions
- API docs must match implementation
