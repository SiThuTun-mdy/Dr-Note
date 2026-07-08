# Doctor Note - AI-Driven Clinic Management

A Next.js application for clinic management with AI-powered features.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Team Setup - Supabase MCP

The project uses Supabase MCP for database operations in Claude Code. Each team member needs their own access token.

### Step 1: Get Your Supabase Access Token

1. Go to https://supabase.com/dashboard/account/tokens
2. Click **"Generate new token"**
3. Name: `claude-code`
4. Copy the token (starts with `sbp_`)

### Step 2: Add Token to Your Environment

Add to `.env.local`:
```
SUPABASE_ACCESS_TOKEN=sbp_your_token_here
```

### Step 3: Install MCP Globally (Recommended)

Run this in your terminal:
```bash
claude mcp add --scope user supabase -- npx -y @supabase/mcp-server-supabase@latest --access-token sbp_your_token_here
```

This installs the MCP server globally and works across all projects.

### Step 4: Restart Claude Code

Close and reopen Claude Code for MCP to load.

### Verify Setup

Run `/supabase-setup` in Claude Code to verify everything is connected.

## Alternative: Project-Level MCP

The project includes `.mcp.json` which auto-loads when you open this repo. It uses your `SUPABASE_ACCESS_TOKEN` from `.env.local`.

Just add your token to `.env.local` and restart Claude Code.

## Learn More

- [Supabase MCP Documentation](https://supabase.com/docs/guides/mcp)
- [Claude Code MCP Setup](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [Next.js Documentation](https://nextjs.org/docs)
