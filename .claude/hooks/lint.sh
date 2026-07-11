#!/usr/bin/env bash

# Get git root directory
GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

if [ -f "$GIT_ROOT/app/package.json" ] && [ -f "$GIT_ROOT/app/eslint.config.mjs" ]; then
  cd "$GIT_ROOT/app" && npx eslint src/ 2>&1
fi

exit 0
