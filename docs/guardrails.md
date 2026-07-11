# Code Safety Guardrails

This document describes the automated safety checks in place to prevent dangerous code from being committed to the repository.

## Overview

The repo uses a multi-layered approach to catch dangerous code patterns:

1. **Pre-commit Hook** — Runs automatically before every `git commit`
2. **Claude Code Instructions** — Rules for AI-generated code in `.claude/CLAUDE.md`
3. **Pattern Scanner** — `scripts/safe-code-check.sh` detects known dangerous patterns

## Detected Patterns

### Shell / System Level

| Pattern | Example | Risk |
|---------|---------|------|
| Fork bomb | `:(){ :|:& };:` | Exhausts system resources, crashes PC |
| Dangerous rm | `rm -rf /` | Deletes entire filesystem |
| Disk filler | `dd if=/dev/zero of=/path/bigfile` | Fills disk, causes system instability |
| Filesystem format | `mkfs.ext4 /dev/sda` | Destroys partition data |
| System shutdown | `shutdown -h now` | Shuts down the machine |
| System reboot | `reboot -f` | Forces immediate restart |
| Permission escalation | `chmod 777 /` | Makes all files world-writable |
| Process kill all | `killall` | Terminates all running processes |

### JavaScript / Node.js

| Pattern | Example | Risk |
|---------|---------|------|
| Infinite loop | `while(true){}` | Freezes Node.js process, high CPU |
| eval() usage | `eval(userInput)` | Code injection vulnerability |
| new Function() | `new Function(code)` | Dynamic code execution, injection |
| child_process with shell | `` exec(`cmd ${var}`) `` | Command injection |
| Unprotected fs.rmSync recursive | `fs.rmSync(dir, {recursive: true})` | Accidental mass deletion |
| process.exit in app code | `process.exit(1)` | Abrupt process termination |
| Dynamic import with variable | `` import(`./${path}`) `` | Path traversal, module injection |

### Network / Security

| Pattern | Example | Risk |
|---------|---------|------|
| Disabled SSL verification | `rejectUnauthorized: false` | Man-in-the-middle attacks |
| CORS wildcard | `Access-Control-Allow-Origin: *` | Cross-origin data leaks |

## Running the Scanner Manually

```bash
# Scan the entire src/ directory
bash scripts/safe-code-check.sh src/

# Scan specific files
bash scripts/safe-code-check.sh src/lib/auth.ts

# Scan with verbose output
bash -x scripts/safe-code-check.sh src/
```

## Pre-commit Hook Behavior

When you run `git commit`, the pre-commit hook:

1. **Runs lint-staged** — ESLint with `--fix` on all staged `.js/.ts/.jsx/.tsx` files
2. **Runs safe-code-check.sh** — Scans the repository for dangerous patterns

If either check fails, the commit is blocked. You'll see output like:

```
[GUARDRAIL] Infinite loop
1:while(true){}

═══════════════════════════════════════════════════
  1 dangerous pattern(s) found!
  Review the violations above before proceeding.
  See docs/guardrails.md for details.
═══════════════════════════════════════════════════
```

## Bypassing the Hook

In emergencies, you can bypass the pre-commit hook:

```bash
git commit --no-verify -m "emergency: fix production issue"
```

**Important:** Always explain why you bypassed the hook in the commit message.

## Adding New Patterns

To add new dangerous patterns, edit `scripts/safe-code-check.sh`:

```bash
# Add to the PATTERNS array:
"Pattern Name|regex-pattern-to-match|optional-file-glob"
```

## Files

| File | Purpose |
|------|---------|
| `scripts/safe-code-check.sh` | Pattern scanner script |
| `.husky/pre-commit` | Git pre-commit hook |
| `.claude/CLAUDE.md` | AI safety rules |
| `docs/guardrails.md` | This documentation |

## Future Enhancements

- [ ] Add CI/CD pipeline check (GitHub Actions)
- [ ] Add more patterns for Python, SQL injection, etc.
- [ ] Add severity levels (warning vs. error)
- [ ] Add auto-fix suggestions for common patterns
