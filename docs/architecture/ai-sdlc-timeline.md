# AI SDLC Activity Timeline

**Project:** Dr-Note (Vibecoding Tour Demo)
**Date:** 2026-07-07
**Status:** Reference Document

> This is a reference document for planning future AI SDLC projects.

---

## Phase Sequence (Mermaid)

```mermaid
graph LR
    subgraph "Phase 0: Foundation"
        A[Project Setup] --> B[GitHub Repo]
        B --> C[CI/CD Pipeline]
        C --> D[Vercel Deploy]
    end

    subgraph "Phase 0.5: Context"
        E[CLAUDE.md] --> F[Memory Files]
        F --> G[Docs Structure]
        G --> H[Skills Setup]
    end

    subgraph "Phase 1: Planning"
        I[Requirements] --> J[Spec Writing]
        J --> K[API Design]
        K --> L[DB Schema]
    end

    subgraph "Phase 2: Design"
        M[Architecture] --> N[Component Design]
        N --> O[Flow Diagrams]
        O --> P[ADRs]
    end

    subgraph "Phase 3: Coding"
        Q[Spec-to-Code] --> R[Implementation]
        R --> S[Review]
        S --> T[Iterate]
    end

    subgraph "Phase 4: Testing"
        U[Unit Tests] --> V[Integration Tests]
        V --> W[Fix Issues]
    end

    subgraph "Phase 5: Docs"
        X[Update README] --> Y[API Docs]
        Y --> Z[User Guide]
    end

    subgraph "Phase 6: Deploy"
        AA[Pre-deploy] --> AB[Preview Deploy]
        AB --> AC[UAT]
        AC --> AD[Production]
    end

    D --> E
    H --> I
    L --> M
    P --> Q
    T --> U
    W --> X
    Z --> AA

    style A fill:#4CAF50,color:#fff
    style E fill:#2196F3,color:#fff
    style I fill:#FF9800,color:#fff
    style M fill:#9C27B0,color:#fff
    style Q fill:#F44336,color:#fff
    style U fill:#00BCD4,color:#fff
    style X fill:#795548,color:#fff
    style AA fill:#607D8B,color:#fff
```

---

## Gantt Timeline

```mermaid
gantt
    title AI SDLC Project Timeline
    dateFormat  YYYY-MM-DD
    section Phase 0: Foundation
    Project Setup           :a1, 2026-07-07, 2d
    GitHub Repo & Board     :a2, after a1, 1d
    CI/CD Pipeline          :a3, after a2, 2d
    Vercel Deployment       :a4, after a3, 1d
    section Phase 0.5: Context
    CLAUDE.md Setup         :b1, after a4, 1d
    Memory Files            :b2, after b1, 1d
    Docs Structure          :b3, after b2, 1d
    Skills Setup            :b4, after b3, 2d
    section Phase 1: Planning
    Requirements Gathering  :c1, after b4, 2d
    Spec Writing            :c2, after c1, 3d
    API Design              :c3, after c2, 2d
    DB Schema               :c4, after c3, 1d
    section Phase 2: Design
    Architecture            :d1, after c4, 2d
    Component Design        :d2, after d1, 2d
    Flow Diagrams           :d3, after d2, 1d
    ADRs                    :d4, after d3, 1d
    section Phase 3: Coding
    Spec-to-Code            :e1, after d4, 3d
    Implementation          :e2, after e1, 5d
    Review & Iterate        :e3, after e2, 2d
    section Phase 4: Testing
    Unit Tests              :f1, after e3, 2d
    Integration Tests       :f2, after f1, 2d
    Fix Issues              :f3, after f2, 1d
    section Phase 5: Docs
    Update README           :g1, after f3, 1d
    API Docs                :g2, after g1, 1d
    User Guide              :g3, after g2, 1d
    section Phase 6: Deploy
    Pre-deploy Checks       :h1, after g3, 1d
    Preview Deploy          :h2, after h1, 1d
    UAT                     :h3, after h2, 2d
    Production              :h4, after h3, 1d
```

---

## Activity Sequence Table

| Order | Phase | Activity | Dependencies | Duration |
|-------|-------|----------|--------------|----------|
| 1 | 0 | Project Setup | — | 2 days |
| 2 | 0 | GitHub Repo & Board | 1 | 1 day |
| 3 | 0 | CI/CD Pipeline | 2 | 2 days |
| 4 | 0 | Vercel Deployment | 3 | 1 day |
| 5 | 0.5 | CLAUDE.md Setup | 4 | 1 day |
| 6 | 0.5 | Memory Files | 5 | 1 day |
| 7 | 0.5 | Docs Structure | 6 | 1 day |
| 8 | 0.5 | Skills Setup | 7 | 2 days |
| 9 | 1 | Requirements Gathering | 8 | 2 days |
| 10 | 1 | Spec Writing | 9 | 3 days |
| 11 | 1 | API Design | 10 | 2 days |
| 12 | 1 | DB Schema | 11 | 1 day |
| 13 | 2 | Architecture | 12 | 2 days |
| 14 | 2 | Component Design | 13 | 2 days |
| 15 | 2 | Flow Diagrams | 14 | 1 day |
| 16 | 2 | ADRs | 15 | 1 day |
| 17 | 3 | Spec-to-Code | 16 | 3 days |
| 18 | 3 | Implementation | 17 | 5 days |
| 19 | 3 | Review & Iterate | 18 | 2 days |
| 20 | 4 | Unit Tests | 19 | 2 days |
| 21 | 4 | Integration Tests | 20 | 2 days |
| 22 | 4 | Fix Issues | 21 | 1 day |
| 23 | 5 | Update README | 22 | 1 day |
| 24 | 5 | API Docs | 23 | 1 day |
| 25 | 5 | User Guide | 24 | 1 day |
| 26 | 6 | Pre-deploy Checks | 25 | 1 day |
| 27 | 6 | Preview Deploy | 26 | 1 day |
| 28 | 6 | UAT | 27 | 2 days |
| 29 | 6 | Production | 28 | 1 day |

**Total Estimated Duration:** ~45 working days (~9 weeks)

---

## Phase Summary

| Phase | Name | Duration | Key Activities |
|-------|------|----------|----------------|
| 0 | Foundation | 1 week | Project setup, GitHub, CI/CD, Vercel |
| 0.5 | Context | 1 week | CLAUDE.md, memory, docs, skills |
| 1 | Planning | 1.5 weeks | Requirements, specs, API, DB schema |
| 2 | Design | 1 week | Architecture, components, diagrams, ADRs |
| 3 | Coding | 2 weeks | Spec-to-code, implementation, review |
| 4 | Testing | 1 week | Unit tests, integration tests, fixes |
| 5 | Docs | 3 days | README, API docs, user guide |
| 6 | Deploy | 1 week | Pre-deploy, preview, UAT, production |

---

## Critical Path

The following activities are **blocking** — if delayed, the entire project slips:

```
Project Setup → CLAUDE.md → Requirements → Spec Writing → Implementation → UAT → Production
```

---

## Parallel Activities

These activities can be done in parallel:

| Parallel Group | Activities |
|----------------|------------|
| Foundation | GitHub Repo + CI/CD Pipeline |
| Context | Memory Files + Docs Structure |
| Planning | API Design + DB Schema |
| Testing | Unit Tests + Integration Tests |
| Docs | README + API Docs |

---

## Risk Factors

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI tool downtime | Delays coding | Have fallback to manual coding |
| Spec changes mid-project | Rework | Lock specs before coding |
| Team unfamiliar with AI tools | Slower start | Training session first |
| Supabase free tier limits | Need upgrade | Monitor usage early |

---

> _Use this timeline as a reference for future AI SDLC projects. Adjust durations based on team size and project complexity._
