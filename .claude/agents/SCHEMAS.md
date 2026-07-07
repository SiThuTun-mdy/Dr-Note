# Agent Output Schemas

Every agent must return structured output matching its schema below. The orchestrator uses these schemas to validate handoffs between agents.

## product-manager

```json
{
  "decisions": [
    { "id": "DEC-XXX", "title": "string", "rationale": "string", "status": "Accepted" }
  ],
  "documents": [
    { "path": "docs/XX-Name.md", "status": "Complete|Draft|Updated" }
  ],
  "blockers": ["string"]
}
```

**Required outputs:** PRD, Personas, User Stories, MVP Scope, Acceptance Criteria, Risks, Assumptions.

## architect

```json
{
  "decisions": [
    { "id": "DEC-XXX", "title": "string", "rationale": "string", "status": "Accepted" }
  ],
  "documents": [
    { "path": "docs/XX-Name.md", "status": "Complete|Draft|Updated" }
  ],
  "techStack": {
    "frontend": "string",
    "backend": "string",
    "database": "string",
    "hosting": "string"
  },
  "risks": [
    { "id": "RISK-XXX", "description": "string", "severity": "High|Medium|Low", "mitigation": "string" }
  ]
}
```

**Required outputs:** Architecture, ERD, API Specification, Database Schema, RLS Policies, Folder Structure.

## scrum-master

```json
{
  "backlog": [
    {
      "id": "US-XXX",
      "title": "string",
      "priority": "Must|Should|Could|Won't",
      "estimate": "string",
      "dependencies": ["US-XXX"],
      "tasks": [
        { "id": "TASK-XXX", "title": "string", "estimate": "string" }
      ]
    }
  ],
  "dailyPlan": {
    "date": "YYYY-MM-DD",
    "tasks": ["TASK-XXX"],
    "blockers": ["string"]
  },
  "definitionOfDone": ["string"]
}
```

**Required outputs:** Sprint Backlog, Task Breakdown, Definition of Done, Daily Plan.

## developer

```json
{
  "filesChanged": [
    { "path": "string", "action": "Created|Modified|Deleted" }
  ],
  "testsAdded": [
    { "path": "string", "type": "Unit|Integration|E2E" }
  ],
  "decisions": [
    { "id": "DEC-XXX", "title": "string", "rationale": "string" }
  ],
  "blockers": ["string"]
}
```

**Required outputs:** Implementation code, tests, updated Progress.md.

## reviewer

```json
{
  "findings": [
    {
      "id": "FIND-XXX",
      "severity": "Critical|High|Medium|Low",
      "category": "Security|Architecture|TypeSafety|ErrorHandling|Performance|Maintainability|Accessibility",
      "file": "string",
      "line": 0,
      "description": "string",
      "recommendation": "string"
    }
  ],
  "verdict": "PASS|FAIL",
  "summary": "string"
}
```

**Verdict rule:** FAIL if any Critical or High findings exist.

## qa

```json
{
  "testResults": {
    "passed": 0,
    "failed": 0,
    "skipped": 0,
    "details": [
      { "name": "string", "status": "passed|failed|skipped", "error": "string|null" }
    ]
  },
  "bugs": [
    {
      "id": "BUG-XXX",
      "severity": "Critical|High|Medium|Low",
      "module": "string",
      "description": "string",
      "expected": "string",
      "actual": "string",
      "status": "Open|Fixed|Closed"
    }
  ],
  "acceptanceCriteriaMet": {
    "total": 0,
    "met": 0,
    "failed": 0,
    "details": [
      { "criterion": "string", "status": "Met|Failed|Blocked" }
    ]
  },
  "readyForRelease": false
}
```

**readyForRelease rule:** true only if no Critical or High bugs remain and all acceptance criteria are met.

## release-manager

```json
{
  "decision": "GO|NO-GO",
  "checklist": [
    { "item": "string", "status": "Pass|Fail|Skipped", "notes": "string" }
  ],
  "openIssues": [
    { "id": "string", "severity": "Critical|High|Medium|Low", "description": "string" }
  ],
  "notes": ["string"]
}
```

**Decision rules:**
- Critical bug > 0 = NO-GO
- High bug > 0 = NO-GO
- Security review failed = NO-GO
- Regression failed = NO-GO
- Otherwise = GO

## devops

```json
{
  "envVars": [
    { "name": "string", "status": "Set|Missing|Placeholder", "notes": "string" }
  ],
  "migrations": {
    "total": 0,
    "applied": 0,
    "pending": 0,
    "status": "ready|pending|failed"
  },
  "infrastructure": {
    "hosting": "ready|not_configured",
    "database": "ready|not_configured",
    "auth": "ready|not_configured",
    "storage": "ready|not_configured"
  },
  "deploymentReady": false,
  "rollbackPlan": "string"
}
```

## documentation

```json
{
  "documentsWritten": [
    { "path": "string", "status": "Created|Updated", "audience": "Developer|User|Stakeholder|All" }
  ],
  "summary": "string"
}
```

**Required outputs:** README, Developer Guide, User Guide, Demo Script, Release Notes, Handoff.
