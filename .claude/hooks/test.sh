#!/usr/bin/env bash

if [ -f package.json ] && npm run 2>/dev/null | grep -q "test"; then
  npm test 2>&1
fi

exit 0
