# MASTER PROMPT — BUILD PEDIGREE

You are an expert full-stack product engineer, UI/UX designer, software architect, database designer, QA engineer and AIES rule-engine developer.

Build the complete application described in the Pedigree documentation.

## PROJECT
**Pedigree — Preconception Genetic Assessment and Guidance Platform**

The same application must serve both Software Engineering/Modelling and AIES requirements.

The AIES portion must be a genuine, visible, explainable rule-based expert system, not a fake AI wrapper.

> Educational/project decision-support only. Never present results as medical diagnosis.

## SOURCE DOCUMENTS
Treat these as source of truth:
1. `01_PRD.md`
2. `02_TRD.md`
3. `03_USER_JOURNEY_APP_FLOW.md`
4. `04_DESIGN_SYSTEM.md`
5. `05_SCHEMA.md`
6. `06_IMPLEMENTATION.md`
7. `07_TRACKER.md`
8. `08_RULES.md`

Do not invent a different architecture when these documents already specify one. If a detail is genuinely unspecified, choose the simplest maintainable solution consistent with them.

## STACK
Frontend: React, Vite, Tailwind CSS, React Router, Axios/fetch, D3.js.

Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, PDF generation.

## NON-NEGOTIABLE AUTHENTICATION

### User
`/login`
`/register`
→ `/user/dashboard`

### Genetic Counselor
`/counselor/login`
→ `/counselor/dashboard`

### Admin
`/admin/login`
→ `/admin/dashboard`

Public registration must never create ADMIN.

Backend must enforce RBAC; frontend checks alone are not security.

## USER ROLE
Register/login, profile, family/member/relationship/condition management, pedigree, assessment, explanation, guidance, history, reports, logout.

## COUNSELOR ROLE
Login, assigned cases, family/pedigree review, assessment review, notes, recommendations, status, report review.

## ADMIN ROLE
Login, users, counselors, conditions, rules, assignments, analytics, audit logs, notifications/settings.

## REQUIRED PAGES

Public:
Landing, About/How It Works, User Login, Registration, Counselor Login, Admin Login.

User:
Dashboard, Profile, Families, Family Builder, Members, Relationships, Conditions, Pedigree, Assessment, Result, Guidance, History, Reports, Settings.

Counselor:
Dashboard, Assigned Cases, Case Detail, Pedigree Review, Assessment Review, Notes/Recommendations, Reports, Profile.

Admin:
Dashboard, Users, Counselors, Conditions, Rules, Assignments, Analytics, Audit Logs, Notifications, Settings.

## CORE FLOW
```text
Landing
→ Login/Register
→ Dashboard
→ Create Family
→ Add Members
→ Define Relationships
→ Add Conditions
→ Review
→ Pedigree
→ Assessment
→ Facts
→ Rule Evaluation
→ Result
→ Explanation
→ Guidance
→ Report
```

## PEDIGREE
Build a real data-driven interactive pedigree. It must support family nodes, relationships, condition indicators, legend, zoom, pan, reset, member selection and details. Do not hardcode the pedigree.

## AIES ENGINE
Implement:
```text
Fact Builder
→ Rule Matcher
→ Rule Evaluator
→ Result Aggregator
→ Explanation Generator
→ Guidance Generator
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

Rules must be deterministic, explainable and separate from UI code.

## DATABASE
Required models:
User, Family, FamilyMember, Relationship, Condition, FamilyMemberCondition, Rule, Assessment, CounselorAssignment, CounselorNote, Report, AuditLog, Notification.

Follow `05_SCHEMA.md`.

## UI
Use a clean, modern, calm and professional interface. Reusable components. Responsive. Accessible. Every data-driven page needs loading, empty, error and success states where appropriate.

## REPORT
Generate a PDF with:
1. Cover
2. Case information
3. Family summary
4. Pedigree summary
5. Conditions
6. Assessment
7. Triggered rules
8. Explanation
9. Guidance
10. Counselor notes
11. Disclaimer

## SECURITY
Use bcrypt, JWT, backend RBAC, input validation, ownership checks, environment variables, safe errors and audit logging. Never expose password hashes or secrets.

## IMPLEMENTATION ORDER
1. Setup
2. Authentication/RBAC
3. User dashboard
4. Family management
5. Relationships
6. Conditions
7. Pedigree
8. Rule engine
9. Assessment
10. Counselor
11. Admin
12. Reports
13. Tests
14. Responsive/accessibility polish
15. Final QA

Build working vertical slices rather than disconnected mock screens.

## DEMO DATA
Seed:
- one admin
- one counselor
- one demo user
- demo family
- demo members
- relationships
- conditions
- rules
- assessment

Use fictional/safe data only.

## FINAL QA
Verify:
- all three login experiences
- registration
- logout
- RBAC
- family/member/relationship/condition CRUD
- dynamic pedigree
- facts/rules/result/explanation
- assessment history
- counselor review
- admin rule/condition management
- PDF report
- responsive UI
- no dead links/buttons
- no critical console errors

## SEM + AIES
SEM should be demonstrable through requirements, roles/use cases, workflows, UML/domain structure, schema, architecture, APIs, testing and project tracking.

AIES should be demonstrable through facts, knowledge/rules, inference, rule evaluation, explanation and guidance.

Use the same application and data for both subjects.

## FINAL DELIVERABLE
Provide working frontend, backend, database models, APIs, authentication, RBAC, pedigree, rule engine, assessment, counselor module, admin module, reports, seed data, tests, README, environment example and updated tracker.

Never claim an incomplete feature works.
