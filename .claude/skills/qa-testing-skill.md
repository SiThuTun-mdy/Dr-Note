# QA Testing Skill

## Test Pyramid

```
        ┌─────────┐
        │  E2E    │  Few, slow, high confidence
        ├─────────┤
        │ Integration │  Moderate, test boundaries
        ├─────────┤
        │  Unit   │  Many, fast, isolated
        └─────────┘
```

## Test Types

### Unit Tests
- Test individual functions/components in isolation
- Mock external dependencies
- Fast execution (< 100ms each)

### Integration Tests
- Test multiple components working together
- Test API routes with real database
- Test Server Actions with Supabase

### E2E Tests
- Test complete user workflows
- Use Playwright or Cypress
- Test critical paths only

## Test Case Format

```
[TC-XXX] Module: Test Case Name
Precondition: What must be true before
Steps:
  1. Action
  2. Action
Expected: What should happen
Priority: High/Medium/Low
Type: Positive/Negative/Edge
```

## Patterns

### Unit Test (Vitest)

```typescript
// __tests__/utils/format.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate, formatCurrency } from '@/utils/format'

describe('formatDate', () => {
  it('formats ISO date to readable string', () => {
    expect(formatDate('2024-01-15')).toBe('January 15, 2024')
  })

  it('handles null gracefully', () => {
    expect(formatDate(null)).toBe('N/A')
  })
})

describe('formatCurrency', () => {
  it('formats number to SGD', () => {
    expect(formatCurrency(1000)).toBe('SGD 1,000.00')
  })
})
```

### Server Action Test

```typescript
// __tests__/actions/patient.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPatient } from '@/app/actions/patient'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: '123', name: 'Test Patient' },
            error: null,
          })),
        })),
      })),
    })),
  })),
}))

describe('createPatient', () => {
  it('creates patient with valid data', async () => {
    const formData = new FormData()
    formData.set('name', 'Test Patient')
    formData.set('email', 'test@example.com')

    const result = await createPatient(formData)

    expect(result.data).toBeDefined()
    expect(result.data.name).toBe('Test Patient')
  })

  it('returns error with invalid data', async () => {
    const formData = new FormData()
    formData.set('name', '')

    const result = await createPatient(formData)

    expect(result.error).toBeDefined()
  })
})
```

### Component Test (React Testing Library)

```typescript
// __tests__/components/PatientCard.test.tsx
import { render, screen } from '@testing-library/react'
import { PatientCard } from '@/components/PatientCard'

describe('PatientCard', () => {
  const mockPatient = {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
  }

  it('renders patient name', () => {
    render(<PatientCard patient={mockPatient} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('renders patient email', () => {
    render(<PatientCard patient={mockPatient} />)
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })
})
```

## Test Coverage Targets

| Type | Minimum | Target |
|---|---|---|
| Unit | 70% | 80% |
| Integration | 60% | 70% |
| E2E (critical paths) | 100% | 100% |

## Bug Report Format

```
[BUG-XXX] Severity: Critical/High/Medium/Low
Module: Which feature
Description: What happened
Expected: What should happen
Actual: What actually happened
Steps to Reproduce:
  1. Step
  2. Step
Environment: Browser, OS
```

## Gate Rules

- Critical bugs > 0 → BLOCK release
- High bugs > 0 → BLOCK release
- Medium bugs → Must have fix plan
- Low bugs → Track for next sprint
- Test coverage < minimum → BLOCK release
