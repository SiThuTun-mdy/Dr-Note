#!/usr/bin/env bash

# Get git root directory
GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

MATCHES=$(grep -RIn \
  -E "(SUPABASE_SERVICE_ROLE_KEY|SERVICE_ROLE_KEY|sk_live_|sk_test_|AKIA[0-9A-Z]{16})" \
  "$GIT_ROOT" \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=.git \
  --exclude-dir=.claude \
  --exclude-dir=.github \
  --exclude=".env.example" \
  --exclude="*.md" \
  --exclude="package-lock.json" \
  --exclude="*.sh" \
  --exclude=".env*" 2>/dev/null || true)

if [ -n "$MATCHES" ]; then
  echo "[hook] Potential secret detected:"
  echo "$MATCHES"
  echo "Remove secrets before continuing."
  exit 2
fi

exit 0
