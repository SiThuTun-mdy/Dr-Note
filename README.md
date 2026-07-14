# Dr.Note — AI-Driven Clinic Management

A Next.js application for clinic management with AI-powered features, built with Supabase (Postgres + Auth + Storage) and Vercel.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16, App Router, TypeScript strict |
| Styling | Tailwind + shadcn/ui |
| DB/Auth | Supabase (Postgres + RLS + Auth) |
| Hosting | Vercel (`main` → production) |

## Quick Start

```bash
# Install dependencies
cd app
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
Dr-Note/
├── app/                          # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login/     # Public: login page
│   │   │   ├── (dashboard)/      # Authenticated: role-based dashboards
│   │   │   │   ├── admin/        # Admin: user management, staff onboarding
│   │   │   │   ├── doctor/       # Doctor: visits, consultation
│   │   │   │   ├── nurse/        # Nurse: screening
│   │   │   │   ├── reception/    # Receptionist: patient registration
│   │   │   │   ├── patients/     # Patient list & registration
│   │   │   │   ├── prescriptions/# Prescription list
│   │   │   │   ├── consultations/# Consultation list
│   │   │   │   └── my-queue/     # Doctor's patient queue
│   │   │   └── set-password/     # Password setup flow
│   │   ├── components/
│   │   │   ├── ui/               # shadcn primitives
│   │   │   └── features/         # Feature components
│   │   └── lib/
│   │       └── supabase/         # Client/server/middleware helpers
│   └── supabase/
│       └── migrations/           # SQL migrations
├── docs/                         # Project documentation
└── CLAUDE.md                     # AI agent instructions
```

## Features Implemented

### ✅ Authentication & Authorization
- Email/password login with Supabase Auth
- SSR cookie session management
- Role-based access control (RBAC)
- Protected routes with middleware

### ✅ User Management
- Admin user management screen
- Staff onboarding (admin creates doctor/nurse/receptionist accounts)
- Patient registration with demographics
- Patient activation + set-password flow

### ✅ Clinical Workflow
- Diagnosis entry with catalog picker
- Prescription form with dynamic items
- Clinical notes during consultation

### ✅ List Pages (Paginated)
- Consultations list
- My Queue (doctor's patient queue)
- Patients list
- Prescriptions list

## Routes

| Route | Role | Description |
|-------|------|-------------|
| `/login` | Public | Authentication |
| `/set-password` | Public | Password setup |
| `/admin` | Admin | Dashboard |
| `/admin/users` | Admin | User management |
| `/admin/staff/new` | Admin | Staff onboarding |
| `/doctor` | Doctor | Doctor dashboard |
| `/nurse` | Nurse | Nurse dashboard |
| `/reception` | Receptionist | Reception dashboard |
| `/reception/patients/new` | Receptionist | Patient registration |
| `/patients` | All staff | Patient list |
| `/patients/register` | All staff | Patient registration |
| `/consultation` | Doctor | Active consultation |
| `/consultations` | All staff | Consultation list |
| `/prescriptions` | All staff | Prescription list |
| `/my-queue` | Doctor | Patient queue |
| `/history` | All staff | Visit history |
| `/waiting` | All staff | Waiting room |

## Team Setup — Supabase MCP

The project uses Supabase MCP for database operations in Claude Code.

### Step 1: Get Your Supabase Access Token

1. Go to https://supabase.com/dashboard/account/tokens
2. Click **"Generate new token"**
3. Name: `claude-code`
4. Copy the token (starts with `sbp_`)

### Step 2: Add Token to Your Environment

Add to `app/.env.local`:
```
SUPABASE_ACCESS_TOKEN=sbp_your_token_here
```

### Step 3: Install MCP Globally

```bash
claude mcp add --scope user supabase -- npx -y @supabase/mcp-server-supabase@latest --access-token sbp_your_token_here
```

### Step 4: Restart Claude Code

Close and reopen Claude Code for MCP to load.

## Development Workflow

```bash
# Lint
cd app && npm run lint

# Type check
cd app && npx tsc --noEmit

# Build
cd app && npm run build
```

## Learn More

- [Supabase MCP Documentation](https://supabase.com/docs/guides/mcp)
- [Claude Code MCP Setup](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [Next.js Documentation](https://nextjs.org/docs)
