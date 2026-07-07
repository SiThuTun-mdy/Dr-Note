# Dev Setup Scripts

Helper scripts to verify your development environment is ready.

## Scripts

| Script | Purpose |
|--------|---------|
| `check-prerequest.sh` | Checks required tools (Node.js, Git, npm, etc.) and auth status |
| `check-dev-infra.sh` | Checks project setup, services, and connections (Supabase, Vercel, GitHub) |

## Usage

Run from the **project root**:

```bash
# Check prerequisites
bash docs/dev-setup/scripts/check-prerequest.sh

# Check dev infrastructure
bash docs/dev-setup/scripts/check-dev-infra.sh

# Run both
bash docs/dev-setup/scripts/check-prerequest.sh && bash docs/dev-setup/scripts/check-dev-infra.sh
```

## Output

- `✓` — Passed
- `⚠` — Warning (optional, but recommended to fix)
- `✗` — Failed (must fix)

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | All required checks passed |
| `1` | One or more required checks failed |
