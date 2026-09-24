# PEDIGREE — Product Requirements Document

**Product:** Pedigree — Preconception Genetic Assessment and Guidance Platform  
**Version:** 1.0

## 1. Vision
Pedigree is a web platform for recording family relationships and relevant medical/genetic information, visualizing a pedigree, running a transparent rule-based assessment, and generating structured educational guidance.

> This is an academic decision-support project, not a clinical diagnostic system or replacement for a qualified professional.

## 2. Goals
- Secure role-based authentication.
- Family/member/relationship management.
- Pedigree visualization.
- Explainable rule-based assessment.
- Guidance and report generation.
- Genetic counselor review workflow.
- Admin management of users, conditions and rules.

## 3. Roles

### User
Register, login, manage profile, create families, manage members/relationships/conditions, view pedigree, run assessment, view explanations/guidance/history, generate reports.

### Genetic Counselor
Dedicated login, assigned cases, pedigree review, assessment review, notes, recommendations, case status, report review.

### Admin
Dedicated admin login, user/counselor management, condition management, rule management, assignments, analytics, audit logs, notifications/settings.

## 4. Authentication
Required separate UI experiences:
- `/login` — User
- `/counselor/login` — Genetic Counselor
- `/admin/login` — Admin

Public registration must never create an admin account.

## 5. Main User Flow
Landing → Login/Register → Dashboard → Create Family → Add Members → Define Relationships → Add Conditions → Review → Pedigree → Assessment → Result + Explanation → Guidance → Report.

## 6. Functional Requirements
- FR-01 Authentication and RBAC.
- FR-02 User profile.
- FR-03 Family/member CRUD.
- FR-04 Relationship management and validation.
- FR-05 Condition/medical information.
- FR-06 Dynamic pedigree visualization.
- FR-07 Rule-based assessment.
- FR-08 Explainability: facts, triggered rules, reasoning and guidance.
- FR-09 Assessment history.
- FR-10 Counselor review.
- FR-11 Admin management.
- FR-12 PDF reports.

## 7. Main Screens

### Public
Landing, About/How It Works, User Login, Registration, Counselor Login, Admin Login.

### User
Dashboard, Profile, Families, Family Builder, Members, Relationships, Conditions, Pedigree, Assessment, Result, Guidance, History, Reports, Settings.

### Counselor
Dashboard, Assigned Cases, Case Detail, Pedigree Review, Assessment Review, Notes/Recommendations, Reports, Profile.

### Admin
Dashboard, Users, Counselors, Conditions, Rules, Assignments, Analytics, Audit Logs, Notifications, Settings.

## 8. Non-Functional Requirements
Security, responsive UI, accessibility, maintainability, useful loading/error/empty states, server-side authorization, hashed passwords, no secrets in source.

## 9. Success Criteria
A user can complete the full family → pedigree → assessment → report flow; counselors can review cases; admins can manage system data; unauthorized roles cannot access protected APIs.
