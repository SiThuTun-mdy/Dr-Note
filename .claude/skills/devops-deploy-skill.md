# DevOps Deploy Skill

Use for deployment readiness and infrastructure.

## Decision Trees

### Deployment Target

```
What are you deploying?
├─ Next.js App → Vercel
│   └─ Auto-deploy from main branch
├─ Supabase → Supabase Cloud
│   └─ Migrations via CLI
├─ Static assets → Vercel/CDN
└─ Custom backend → Vercel Serverless / Docker
```

### Environment Setup

```
Is this a new environment?
├─ Yes → Create env vars
│   ├─ Copy from .env.example
│   ├─ Generate Supabase project
│   └─ Set Vercel env vars
└─ No → Verify existing vars
    ├─ Check all required vars set
    └─ Check no placeholder values
```

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] QA validated
- [ ] Release Manager approved (GO decision)
- [ ] No Critical/High bugs open

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` — Set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — Set (server only)
- [ ] All custom env vars documented

### Database
- [ ] Migrations tested locally
- [ ] Migrations applied to staging
- [ ] Migrations applied to production
- [ ] RLS policies verified
- [ ] Seed data loaded (if applicable)

### Hosting
- [ ] Vercel project configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL/HTTPS enabled
- [ ] Build settings correct

### Post-Deployment
- [ ] Smoke test passed
- [ ] No console errors
- [ ] Auth flow working
- [ ] Critical paths verified
- [ ] Monitoring/alerts configured

## Vercel Deployment Pattern

```yaml
# vercel.json (if needed)
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

## Rollback Procedure

```
1. Identify issue
   ├─ Build failure → Revert commit, push
   ├─ Runtime error → Check Vercel logs, revert if needed
   └─ Data issue → Check Supabase logs, manual fix

2. Execute rollback
   ├─ Vercel: Promote previous deployment
   ├─ Database: Run rollback migration
   └─ Config: Revert env vars

3. Verify rollback
   ├─ Smoke test
   ├─ Check logs
   └─ Notify team
```

## Anti-Patterns

- ❌ Deploying without QA approval
- ❌ Using placeholder env vars in production
- ❌ Skipping database migrations testing
- ❌ No rollback plan
- ❌ Deploying on Fridays (without on-call)
- ❌ Skipping smoke tests

## Gate Rules

- Release Manager decision = NO-GO → DO NOT DEPLOY
- Critical/High bugs open → DO NOT DEPLOY
- Migrations not tested → DO NOT DEPLOY
- Rollback plan missing → DO NOT DEPLOY
