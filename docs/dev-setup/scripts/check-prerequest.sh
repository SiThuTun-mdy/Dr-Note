#!/bin/bash
# ============================================================
# Dr-Note Prerequisite Check Script
# Checks all required tools for the Vibecoding Tour project
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

version_ge() {
    # Returns 0 if $1 >= $2
    printf '%s\n%s' "$2" "$1" | sort -V -C
}

# ============================================================
# 1. Required Tools
# ============================================================
print_header "Required Tools"

# --- Git ---
if command -v git &>/dev/null; then
    GIT_VERSION=$(git --version | awk '{print $3}')
    check_pass "Git installed (v${GIT_VERSION})"
else
    check_fail "Git is not installed"
fi

# --- Node.js ---
if command -v node &>/dev/null; then
    NODE_VERSION=$(node --version | sed 's/v//')
    if version_ge "$NODE_VERSION" "18.0.0"; then
        check_pass "Node.js installed (v${NODE_VERSION})"
    else
        check_warn "Node.js v${NODE_VERSION} found, but >= 18.0.0 recommended"
    fi
else
    check_fail "Node.js is not installed"
fi

# --- npm ---
if command -v npm &>/dev/null; then
    NPM_VERSION=$(npm --version)
    check_pass "npm installed (v${NPM_VERSION})"
else
    check_fail "npm is not installed"
fi

# --- Package Manager (optional: pnpm or yarn) ---
if command -v pnpm &>/dev/null; then
    PNPM_VERSION=$(pnpm --version)
    check_pass "pnpm installed (v${PNPM_VERSION})"
elif command -v yarn &>/dev/null; then
    YARN_VERSION=$(yarn --version)
    check_pass "yarn installed (v${YARN_VERSION})"
else
    check_warn "pnpm/yarn not found (npm will work, but pnpm recommended)"
fi

# ============================================================
# 2. Project Tools (Optional but recommended)
# ============================================================
print_header "Project & Deployment Tools"

# --- GitHub CLI ---
if command -v gh &>/dev/null; then
    GH_VERSION=$(gh --version | head -1 | awk '{print $3}')
    check_pass "GitHub CLI installed (v${GH_VERSION})"
else
    check_warn "GitHub CLI not installed (needed for GitHub Projects integration)"
fi

# --- Vercel CLI ---
if command -v vercel &>/dev/null; then
    VERCEL_VERSION=$(vercel --version 2>/dev/null | head -1)
    check_pass "Vercel CLI installed (${VERCEL_VERSION})"
else
    check_warn "Vercel CLI not installed (needed for deployment)"
fi

# --- Supabase CLI ---
if command -v supabase &>/dev/null; then
    SUPABASE_VERSION=$(supabase --version 2>/dev/null | head -1)
    check_pass "Supabase CLI installed (${SUPABASE_VERSION})"
else
    check_warn "Supabase CLI not installed (optional for local dev)"
fi

# ============================================================
# 3. AI Tools
# ============================================================
print_header "AI Development Tools"

# --- Claude Code ---
if command -v claude &>/dev/null; then
    check_pass "Claude Code CLI installed"
else
    check_warn "Claude Code CLI not installed (needed for AI-assisted development)"
fi

# --- GitHub Copilot ---
if command -v gh &>/dev/null; then
    if gh extension list 2>/dev/null | grep -q copilot; then
        check_pass "GitHub Copilot extension installed"
    else
        check_warn "GitHub Copilot extension not found (optional for AI pair programming)"
    fi
else
    check_warn "Cannot check GitHub Copilot (gh CLI not installed)"
fi

# ============================================================
# 4. Auth Status
# ============================================================
print_header "Authentication Status"

# --- Git config ---
GIT_NAME=$(git config --global user.name 2>/dev/null)
GIT_EMAIL=$(git config --global user.email 2>/dev/null)
if [[ -n "$GIT_NAME" && -n "$GIT_EMAIL" ]]; then
    check_pass "Git configured: ${GIT_NAME} <${GIT_EMAIL}>"
else
    check_warn "Git user.name or user.email not configured"
fi

# --- GitHub auth ---
if command -v gh &>/dev/null; then
    if gh auth status &>/dev/null; then
        GH_USER=$(gh auth status 2>&1 | grep "Logged in" | awk '{print $NF}')
        check_pass "GitHub authenticated (${GH_USER})"
    else
        check_warn "GitHub not authenticated (run: gh auth login)"
    fi
fi

# --- Vercel auth ---
if command -v vercel &>/dev/null; then
    if vercel whoami &>/dev/null; then
        VERCEL_USER=$(vercel whoami 2>/dev/null)
        check_pass "Vercel authenticated (${VERCEL_USER})"
    else
        check_warn "Vercel not authenticated (run: vercel login)"
    fi
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
    echo -e "${GREEN}All required tools are installed! You're ready to go.${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}Some required tools are missing. Please install them before continuing.${NC}"
    echo ""
    exit 1
fi
