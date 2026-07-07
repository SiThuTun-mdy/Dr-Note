# AI SDLC Skill

Use this skill when coordinating software delivery.

## Phase Gates

### Phase 0: Project Brief
**Entry:** Idea defined
**Exit:** Project brief approved
**Checklist:**
- [ ] Problem statement clear
- [ ] Target users identified
- [ ] Core features listed
- [ ] Tech stack decided
- [ ] Timeline established

### Phase 1: Product
**Entry:** Project brief approved
**Exit:** PRD complete
**Checklist:**
- [ ] Vision documented
- [ ] Personas created
- [ ] User stories written
- [ ] MVP scope defined
- [ ] Acceptance criteria set
- [ ] Risks identified

### Phase 2: Architecture
**Entry:** PRD complete
**Exit:** Architecture approved
**Checklist:**
- [ ] Tech stack confirmed
- [ ] ERD designed
- [ ] Database schema defined
- [ ] API spec written
- [ ] RLS policies defined
- [ ] Folder structure set

### Phase 3: Sprint Planning
**Entry:** Architecture approved
**Exit:** Backlog ready
**Checklist:**
- [ ] Stories estimated
- [ ] Tasks broken down
- [ ] Dependencies identified
- [ ] Definition of Done set
- [ ] Daily plan created

### Phase 4: Development
**Entry:** Backlog ready
**Exit:** Feature complete
**Checklist:**
- [ ] Code implemented
- [ ] Tests written
- [ ] Documentation updated
- [ ] No lint errors
- [ ] No type errors

### Phase 5: Review
**Entry:** Feature complete
**Exit:** Review passed
**Checklist:**
- [ ] Code reviewed
- [ ] Security reviewed
- [ ] No Critical findings
- [ ] No High findings
- [ ] Refactoring plan created (if needed)

### Phase 6: QA
**Entry:** Review passed
**Exit:** QA approved
**Checklist:**
- [ ] Test plan created
- [ ] Test cases executed
- [ ] No Critical bugs
- [ ] No High bugs
- [ ] Acceptance criteria met

### Phase 7: Release
**Entry:** QA approved
**Exit:** GO decision
**Checklist:**
- [ ] Regression passed
- [ ] Release notes written
- [ ] Go/No-Go decided
- [ ] DevOps handoff ready

### Phase 8: Deployment
**Entry:** GO decision
**Exit:** Deployed
**Checklist:**
- [ ] Environment ready
- [ ] Migrations applied
- [ ] Smoke test passed
- [ ] Monitoring active
- [ ] Rollback plan ready

### Phase 9: Documentation
**Entry:** Deployed
**Exit:** Handoff complete
**Checklist:**
- [ ] README updated
- [ ] Developer guide written
- [ ] User guide written
- [ ] Demo script ready
- [ ] Lessons learned documented

## Quality Gates

| Gate | Blocker | Action |
|---|---|---|
| Critical bug | Always | Fix before proceeding |
| High bug | Always | Fix before proceeding |
| Security Critical | Always | Fix before proceeding |
| Security High | Always | Fix before proceeding |
| Test coverage < min | Always | Add tests |
| Review failed | Always | Fix findings |
| QA failed | Always | Fix bugs |
| Release NO-GO | Always | Address blockers |

## Escalation Rules

```
Issue detected
├─ Is it Critical/High?
│   ├─ Yes → Stop, fix immediately
│   └─ No → Continue
├─ Can it be fixed in current phase?
│   ├─ Yes → Fix now
│   └─ No → Document, add to backlog
└─ Is it blocking release?
    ├─ Yes → Escalate to Release Manager
    └─ No → Track for next sprint
```

## Rules

- Never skip phases
- Never allow coding before architecture
- Never allow deployment before QA approval
- Work one feature at a time
- Fix Critical and High issues before continuing
- Update Progress.md after each phase
- Document decisions in 10-Decisions.md
