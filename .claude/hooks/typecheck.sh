#!/usr/bin/env bash

# Get git root directory
GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

if [ -f "$GIT_ROOT/app/package.json" ]; then
  cd "$GIT_ROOT/app" && npx tsc --noEmit 2>&1
fi

exit 0
