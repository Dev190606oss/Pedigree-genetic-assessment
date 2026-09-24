# PEDIGREE — User Journey & App Flow

## 1. Overall Flow

```text
Landing
 ├── User Login/Register → User Dashboard
 │   → Family → Members → Relationships → Conditions
 │   → Pedigree → Assessment → Result → Guidance → Report
 │
 ├── Counselor Login → Counselor Dashboard
 │   → Assigned Cases → Case → Pedigree Review
 │   → Assessment Review → Notes/Recommendations → Report
 │
 └── Admin Login → Admin Dashboard
     → Users / Counselors / Conditions / Rules
     → Assignments / Analytics / Audit Logs / Settings
```

## 2. User Journey
1. Landing page.
2. Register/login.
3. Dashboard.
4. Create family/case.
5. Add family members.
6. Define valid relationships.
7. Add relevant conditions.
8. Review completeness.
9. View pedigree.
10. Confirm information.
11. Run assessment.
12. Generate facts.
13. Evaluate rules.
14. Show result.
15. Show triggered rules and explanation.
16. Show educational guidance.
17. Save assessment history.
18. Generate report.

## 3. Counselor Journey

```text
Counselor Login
→ Dashboard
→ Assigned Cases
→ Select Case
→ Review Data
→ Review Pedigree
→ Review Assessment
→ Add Notes/Recommendations
→ Update Status
→ Review Report
```

## 4. Admin Journey

```text
Admin Login
→ Dashboard
→ Users
→ Counselors
→ Conditions
→ Rules
→ Assignments
→ Analytics
→ Audit Logs
→ Settings
```

## 5. Authentication

```text
Login → Validate → Authenticate → Read Role
USER → /user/dashboard
COUNSELOR → /counselor/dashboard
ADMIN → /admin/dashboard
```

Unauthenticated: 401. Wrong role: 403.

## 6. Required UI States
Every data-driven page must handle loading, empty, success, validation error, server error, unauthorized, not found and unsaved changes.
