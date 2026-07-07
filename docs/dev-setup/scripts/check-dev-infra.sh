#!/bin/bash
# ============================================================
# Dr-Note Dev Infrastructure Check Script
# Checks project setup, services, and connections
# ============================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
WARN=0

# ============================================================
# Helper functions
# ============================================================
check_pass() {
    echo -e "  ${GREEN}✓${NC} $1"
    ((PASS++))
}

check_fail() {
    echo -e "  ${RED}✗${NC} $1"
    ((FAIL++))
}

check_warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
    ((WARN++))
}

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ============================================================
# 1. Project Structure
# ============================================================
print_header "Project Structure"

# --- package.json ---
if [[ -f "package.json" ]]; then
    check_pass "package.json exists"
else
    check_fail "package.json not found — are you in the project root?"
fi

# --- node_modules ---
if [[ -d "node_modules" ]]; then
    check_pass "node_modules installed"
else
    check_warn "node_modules not found — run: npm install"
fi

# --- .env.local ---
if [[ -f ".env.local" ]]; then
    check_pass ".env.local exists"
else
    check_warn ".env.local not found — run: cp .env.example .env.local"
fi

# --- .env.example ---
if [[ -f ".env.example" ]]; then
    check_pass ".env.example exists"
else
    check_warn ".env.example not found (optional, but recommended)"
fi

# --- next.config ---
if [[ -f "next.config.js" || -f "next.config.mjs" || -f "next.config.ts" ]]; then
    check_pass "Next.js config found"
else
    check_warn "Next.js config not found"
fi

# --- tsconfig ---
if [[ -f "tsconfig.json" ]]; then
    check_pass "TypeScript config found"
else
    check_warn "tsconfig.json not found"
fi

# ============================================================
# 2. Environment Variables
# ============================================================
print_header "Environment Variables (from .env.local)"

if [[ -f ".env.local" ]]; then
    # Check Supabase URL
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local 2>/dev/null; then
        SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'")
        if [[ -n "$SUPABASE_URL" && "$SUPABASE_URL" != "" ]]; then
            check_pass "NEXT_PUBLIC_SUPABASE_URL is set"
        else
            check_warn "NEXT_PUBLIC_SUPABASE_URL is empty"
        fi
    else
        check_fail "NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
    fi

    # Check Supabase Anon Key
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local 2>/dev/null; then
        ANON_KEY=$(grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'")
        if [[ -n "$ANON_KEY" && "$ANON_KEY" != "" ]]; then
            check_pass "NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
        else
            check_warn "NEXT_PUBLIC_SUPABASE_ANON_KEY is empty"
        fi
    else
        check_fail "NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local"
    fi

    # Check Service Role Key
    if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local 2>/dev/null; then
        check_pass "SUPABASE_SERVICE_ROLE_KEY is set"
    else
        check_warn "SUPABASE_SERVICE_ROLE_KEY not found (needed for server-side)"
    fi
else
    check_warn "Skipping env checks — .env.local not found"
fi

# ============================================================
# 3. Git & GitHub
# ============================================================
print_header "Git & GitHub"

# --- Git repo ---
if git rev-parse --is-inside-work-tree &>/dev/null; then
    check_pass "Inside a Git repository"
else
    check_fail "Not inside a Git repository"
fi

# --- Git remote ---
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [[ -n "$REMOTE_URL" ]]; then
    check_pass "Git remote configured: ${REMOTE_URL}"
else
    check_warn "No Git remote configured — run: git remote add origin <url>"
fi

# --- Current branch ---
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
if [[ -n "$CURRENT_BRANCH" ]]; then
    check_pass "On branch: ${CURRENT_BRANCH}"
else
    check_warn "Could not determine current branch"
fi

# --- GitHub repo check ---
if command -v gh &>/dev/null; then
    REPO_INFO=$(gh repo view --json nameWithOwner 2>/dev/null)
    if [[ -n "$REPO_INFO" ]]; then
        REPO_NAME=$(echo "$REPO_INFO" | grep -o '"nameWithOwner":"[^"]*"' | cut -d'"' -f4)
        check_pass "GitHub repo connected: ${REPO_NAME}"
    else
        check_warn "GitHub repo not linked — run: gh repo create"
    fi

    # --- Branch protection ---
    PROTECTION=$(gh api repos/{owner}/{repo}/branches/${CURRENT_BRANCH}/protection 2>/dev/null)
    if [[ -n "$PROTECTION" ]]; then
        check_pass "Branch protection enabled on ${CURRENT_BRANCH}"
    else
        check_warn "Branch protection not found on ${CURRENT_BRANCH}"
    fi
else
    check_warn "GitHub CLI not installed — skipping GitHub checks"
fi

# ============================================================
# 4. Supabase
# ============================================================
print_header "Supabase"

# --- Supabase CLI ---
if command -v supabase &>/dev/null; then
    check_pass "Supabase CLI installed"

    # --- Link status ---
    if [[ -f "supabase/.temp/project-ref" ]]; then
        PROJECT_REF=$(cat supabase/.temp/project-ref 2>/dev/null)
        check_pass "Supabase project linked: ${PROJECT_REF}"
    else
        check_warn "Supabase project not linked locally — run: supabase link"
    fi

    # --- Migrations folder ---
    if [[ -d "supabase/migrations" ]]; then
        MIGRATION_COUNT=$(ls supabase/migrations/*.sql 2>/dev/null | wc -l)
        check_pass "Migrations folder found (${MIGRATION_COUNT} files)"
    else
        check_warn "supabase/migrations/ not found"
    fi
else
    check_warn "Supabase CLI not installed — run: npm install -g supabase"
fi

# --- Supabase connection test ---
if [[ -f ".env.local" ]] && command -v curl &>/dev/null; then
    SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    if [[ -n "$SUPABASE_URL" ]]; then
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${SUPABASE_URL}/rest/v1/" 2>/dev/null)
        if [[ "$HTTP_STATUS" == "200" || "$HTTP_STATUS" == "401" ]]; then
            check_pass "Supabase API reachable (HTTP ${HTTP_STATUS})"
        else
            check_warn "Supabase API returned HTTP ${HTTP_STATUS}"
        fi
    fi
fi

# ============================================================
# 5. Vercel
# ============================================================
print_header "Vercel"

if command -v vercel &>/dev/null; then
    # --- Vercel link ---
    if [[ -f ".vercel/project.json" ]]; then
        PROJECT_NAME=$(cat .vercel/project.json 2>/dev/null | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
        check_pass "Vercel project linked: ${PROJECT_NAME}"
    else
        check_warn "Vercel project not linked — run: vercel link"
    fi

    # --- Vercel env vars ---
    if [[ -f ".vercel/project.json" ]]; then
        VERCEL_ENVS=$(vercel env ls 2>/dev/null | grep -c "SUPABASE")
        if [[ "$VERCEL_ENVS" -gt 0 ]]; then
            check_pass "Vercel has Supabase env vars (${VERCEL_ENVS} found)"
        else
            check_warn "No Supabase env vars found in Vercel — run: vercel env add"
        fi
    fi
else
    check_warn "Vercel CLI not installed — run: npm install -g vercel"
fi

# ============================================================
# 6. GitHub Actions Secrets
# ============================================================
print_header "GitHub Actions Secrets"

if command -v gh &>/dev/null; then
    SECRETS=$(gh secret list 2>/dev/null)
    if [[ -n "$SECRETS" ]]; then
        # Check specific secrets
        echo "$SECRETS" | grep -q "NEXT_PUBLIC_SUPABASE_URL" && check_pass "NEXT_PUBLIC_SUPABASE_URL secret set" || check_warn "NEXT_PUBLIC_SUPABASE_URL secret not found"
        echo "$SECRETS" | grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" && check_pass "NEXT_PUBLIC_SUPABASE_ANON_KEY secret set" || check_warn "NEXT_PUBLIC_SUPABASE_ANON_KEY secret not found"
        echo "$SECRETS" | grep -q "SUPABASE_SERVICE_ROLE_KEY" && check_pass "SUPABASE_SERVICE_ROLE_KEY secret set" || check_warn "SUPABASE_SERVICE_ROLE_KEY secret not found"
        echo "$SECRETS" | grep -q "VERCEL_TOKEN" && check_pass "VERCEL_TOKEN secret set" || check_warn "VERCEL_TOKEN secret not found"
    else
        check_warn "No GitHub secrets found — run: gh secret set <name>"
    fi
else
    check_warn "GitHub CLI not installed — skipping secrets check"
fi

# ============================================================
# 7. GitHub Environments
# ============================================================
print_header "GitHub Environments"

if command -v gh &>/dev/null; then
    ENVS=$(gh api repos/{owner}/{repo}/environments 2>/dev/null | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    if [[ -n "$ENVS" ]]; then
        echo "$ENVS" | grep -q "production" && check_pass "Production environment configured" || check_warn "Production environment not found"
        echo "$ENVS" | grep -q "uat" && check_pass "UAT environment configured" || check_warn "UAT environment not found"
    else
        check_warn "No GitHub environments found — configure in repo Settings → Environments"
    fi
else
    check_warn "GitHub CLI not installed — skipping environments check"
fi

# ============================================================
# 8. Dev Server
# ============================================================
print_header "Development Server"

# --- Check if port 3000 is in use ---
if command -v lsof &>/dev/null; then
    if lsof -i :3000 &>/dev/null; then
        check_pass "Port 3000 is in use (dev server running?)"
    else
        check_warn "Port 3000 is free — run: npm run dev"
    fi
elif command -v netstat &>/dev/null; then
    if netstat -an 2>/dev/null | grep -q ":3000.*LISTEN"; then
        check_pass "Port 3000 is in use (dev server running?)"
    else
        check_warn "Port 3000 is free — run: npm run dev"
    fi
elif command -v ss &>/dev/null; then
    if ss -tln 2>/dev/null | grep -q ":3000"; then
        check_pass "Port 3000 is in use (dev server running?)"
    else
        check_warn "Port 3000 is free — run: npm run dev"
    fi
else
    check_warn "Cannot check port 3000 (lsof/netstat/ss not available)"
fi

# ============================================================
# Summary
# ============================================================
print_header "Summary"

TOTAL=$((PASS + FAIL + WARN))
echo -e "  ${GREEN}✓ Passed: ${PASS}${NC}"
echo -e "  ${YELLOW}⚠ Warnings: ${WARN}${NC}"
echo -e "  ${RED}✗ Failed: ${FAIL}${NC}"
echo ""

if [[ $FAIL -eq 0 ]]; then
    echo -e "${GREEN}Infrastructure looks good! Ready to develop.${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}Some checks failed. Please fix the issues above.${NC}"
    echo ""
    exit 1
fi
