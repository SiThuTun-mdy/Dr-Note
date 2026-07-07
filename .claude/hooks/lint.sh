#!/usr/bin/env bash

if [ -f package.json ] && [ -f eslint.config.mjs ]; then
  npx eslint src/ 2>&1
fi

exit 0
