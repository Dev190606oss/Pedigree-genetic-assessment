# PEDIGREE — Implementation Plan

## Phase 0 — Setup
- Frontend React/Vite
- Backend Express
- Tailwind
- MongoDB
- Environment variables
- Routing
- Error handling

## Phase 1 — Authentication
User registration, user login, counselor login, admin login, bcrypt, JWT, protected routes, role middleware, logout.

## Phase 2 — User Dashboard
Layout, sidebar, profile, summary cards, empty/loading/error states.

## Phase 3 — Family Builder
Family CRUD, member CRUD, relationships, validation, conditions.

## Phase 4 — Pedigree
Graph transformation, visualization, zoom/pan, legend, member selection and validation warnings.

## Phase 5 — AIES Rule Engine
Implement:
```text
Fact Builder
Rule Matcher
Rule Evaluator
Result Aggregator
Explanation Generator
Guidance Generator
```

Service:
```js
runAssessment(familyData)
```

Return:
```js
{
  resultCategory,
  summary,
  facts,
  triggeredRules,
  guidance,
  disclaimer
}
```

## Phase 6 — Assessment UI
Readiness, confirmation, processing, result, rule explanation, guidance and history.

## Phase 7 — Counselor
Dashboard, assigned cases, case details, pedigree review, assessment review, notes, recommendations and status.

## Phase 8 — Admin
Dashboard, users, counselors, conditions, rules, assignments, analytics and audit logs.

## Phase 9 — Reports
Generate PDF with case, family, pedigree, assessment, rules, explanation, guidance, counselor notes and disclaimer.

## Phase 10 — Testing
Unit, integration and critical UI tests.

## Phase 11 — Polish
Responsive UI, accessibility, loading/error/empty states, security review and console cleanup.

## Definition of Done
UI + API + validation + authorization + persistence + error states + basic tests + no broken existing features.
