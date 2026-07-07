#!/usr/bin/env bash

if [ -f package.json ] && npm run 2>/dev/null | grep -q "typecheck"; then
  npm run typecheck 2>&1
fi

exit 0
