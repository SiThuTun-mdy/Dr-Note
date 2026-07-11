# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD with security scanning.

## Workflows

### 1. CI (ci.yml)

**Trigger:** Push to `main` or `feat/*`, Pull requests to `main`

**Jobs:**
- Install dependencies
- TypeScript type check
- ESLint linting
- Build application
- Security scanning (TruffleHog, npm audit, Gitleaks)

### 2. Security Scan (security.yml)

**Trigger:** Push to `main`, Pull requests to `main`, Weekly schedule

**Jobs:**
- **Secret Scanning:** TruffleHog for credential detection
- **Dependency Scan:** npm audit + audit-ci for vulnerable packages
- **Code Scan:** CodeQL for SAST (Static Application Security Testing)
- **License Scan:** Check for GPL/AGPL licenses
- **Container Scan:** Trivy for filesystem vulnerabilities

### 3. Deploy to UAT (deploy-uat.yml)

**Trigger:** Push to `main`

**Jobs:**
- Install dependencies
- Pull Vercel environment
- Build application
- Deploy to UAT environment

### 4. Deploy to Production (deploy-prod.yml)

**Trigger:** Manual workflow dispatch

**Jobs:**
- Install dependencies
- Pull Vercel environment
- Build application
- Deploy to Production environment

## Security Standards

| Scan Type | Tool | Purpose |
|-----------|------|---------|
| Secret Detection | TruffleHog, Gitleaks | Find hardcoded credentials |
| Dependency Audit | npm audit, audit-ci | Find vulnerable packages |
| SAST | CodeQL | Find code vulnerabilities |
| License Check | license-checker | Find problematic licenses |
| Vulnerability Scan | Trivy | Find known vulnerabilities |

## Required Secrets

Add these secrets to your GitHub repository:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel authentication token |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |

## Required Environments

Create these environments in GitHub:

| Environment | Protection Rules |
|-------------|------------------|
| `uat` | None (auto-deploy) |
| `production` | Required reviewers |

## Deployment Flow

```
1. Push to feat/* → CI runs tests + security scans
2. Create PR → CI runs tests + security scans
3. Security scan passes → Merge to main
4. Merge to main → Auto-deploy to UAT
5. Test in UAT → Manual approval
6. Deploy to Production → workflow_dispatch
```

## Security Workflow

```
Push/PR → Secret Scan → Dependency Scan → CodeQL → License Check → Trivy
         ↓
    All Pass → Allow Merge/Deploy
         ↓
    Any Fail → Block Merge/Deploy
```

## Getting Started

1. Set up Vercel project
2. Add GitHub secrets
3. Create GitHub environments
4. Push code to trigger CI + security scans
5. Merge to main to deploy to UAT
6. Manually trigger production deployment

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check environment variables |
| Deploy fails | Verify Vercel token |
| UAT not updating | Check GitHub Actions logs |
| Production not deploying | Ensure workflow_dispatch is triggered |
| Secret scan fails | Remove hardcoded secrets from code |
| Dependency audit fails | Update vulnerable packages |
| CodeQL fails | Fix code vulnerabilities |

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [CodeQL Docs](https://codeql.github.com/)
- [TruffleHog Docs](https://trufflesecurity.github.io/trufflehog/)
- [Trivy Docs](https://trivy.dev/)
