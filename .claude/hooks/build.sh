#!/usr/bin/env bash

if [ -f package.json ] && npm run 2>/dev/null | grep -q "build"; then
  npm run build 2>&1
fi

exit 0
