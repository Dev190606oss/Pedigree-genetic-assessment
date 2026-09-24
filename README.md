# PEDIGREE
### Preconception Genetic Assessment & Guidance Platform

> **A Dual Capstone Project Integrating Software Engineering & Modelling (SEM) with Artificial Intelligence & Expert Systems (AIES)**  
> *Academic Decision-Support Platform — Educational Purpose Only. Not a Clinical Diagnostic Tool.*

---

## 1. Project Overview

**PEDIGREE** is a full-stack clinical decision-support web application designed to bridge reproductive health, family history modelling, and transparent genetic risk evaluation.

The platform provides an end-to-end workflow:
1. **Lineage Capture:** Users construct multi-generational family trees, recording biological parentage, partnerships, carrier states, and clinical diagnoses.
2. **Dynamic Pedigree:** Renders interactive, standards-compliant genealogical diagrams in D3.js with pan, zoom, and node inspector cards.
3. **AIES Expert Inference:** Extracts normalized genealogical facts from the family graph and evaluates them against a deterministic, priority-weighted knowledge base of Mendelian inheritance rules.
4. **Clinical Governance:** Certified genetic counselors review assigned cases, inspect triggered rules, add clinical notes, and provide formal recommendations.
5. **PDF Reporting:** Automatically streams a comprehensive, structured clinical summary document with complete audit trails.

---

## 2. Integrated SEM + AIES Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PEDIGREE UNIFIED PLATFORM                       │
├────────────────────────────────────┬───────────────────────────────────┤
│ Software Engineering (SEM)         │ Expert Systems (AIES)             │
├────────────────────────────────────┼───────────────────────────────────┤
│ • 13 Mongoose Relational Schemas   │ • Graph Fact Extraction           │
│ • Strict 3-Portal Role Security    │ • Deterministic Rule Operators    │
│ • Full CRUD for Pedigree Entities  │ • Priority Conflict Resolution    │
│ • D3.js Interactive Visualizer     │ • Transparent Explainability      │
│ • Counselor Workflow & Triage      │ • Non-Diagnostic Guidance Gen     │
│ • Admin Control & Audit Logs       │ • Dynamic Rule Customization      │
│ • Streamed PDF Clinical Reports    │ • Historical Knowledge Snapshots  │
└────────────────────────────────────┴───────────────────────────────────┘
```

---

## 3. Three Dedicated Role Experiences

### 1. Patient / User (`/login`, `/register`)
- **Dashboard (`/user/dashboard`):** Family metrics, recent assessment summaries, quick actions.
- **Family Cases (`/user/families`):** Case management and deletion.
- **Family Builder (`/user/families/:id/builder`):** 7-step guided workflow:
  `Basic Info` $\rightarrow$ `Members` $\rightarrow$ `Relationships` $\rightarrow$ `Conditions` $\rightarrow$ `Review` $\rightarrow$ `Pedigree` $\rightarrow$ `Assessment`
- **Dynamic Pedigree (`/user/families/:id/pedigree`):** Interactive D3 canvas with medical genetics symbols.
- **Assessment History (`/user/history`):** Historical evaluations with direct PDF downloads.
- **Profile (`/user/profile`):** Account information and role verification.

### 2. Genetic Counselor (`/counselor/login`)
- **Dashboard (`/counselor/dashboard`):** Case queue metrics, pending reviews, clinical note counts.
- **Case Queue (`/counselor/cases`):** Filterable table (`ALL`, `PENDING`, `IN_REVIEW`, `REVIEWED`, `COMPLETED`).
- **Case Review (`/counselor/cases/:familyId`):** Visual pedigree inspection, AIES reasoning audit, clinical note entry, status updating, and report export.

### 3. System Administrator (`/admin/login`)
- **Dashboard (`/admin/dashboard`):** System metrics, risk outcome distribution bars, triggered rule frequency charts.
- **User Management (`/admin/users`):** Roster of all users with search, role filters, and activation toggling.
- **Counselor Management (`/admin/counselors`):** Roster of genetic counselors.
- **Condition Catalog (`/admin/conditions`):** CRUD catalogue for hereditary diseases and codes.
- **AIES Rules Engine (`/admin/rules`):** Live rule knowledge base manager (define custom predicates, operators, and priorities).
- **Case Assignments (`/admin/assignments`):** Allocate patient family cases to counselors.
- **Audit Logs (`/admin/audit-logs`):** Immutable security and operational event trail.

---

## 4. Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, D3.js, Lucide Icons, Axios.
- **Backend:** Node.js, Express, Mongoose, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, PDFKit, Morgan.
- **Database:** MongoDB (Dual-mode: connects to `MONGODB_URI` with automatic zero-config fallback to `mongodb-memory-server` for instant offline execution).
- **Testing:** Vitest, Supertest.

---

## 5. Quickstart Guide

### Prerequisites
- Node.js (v18+)
- MongoDB (or allow automatic in-memory MongoDB)

### 1. Install Dependencies
```bash
# From workspace root:
npm --prefix server install
npm --prefix client install
```

### 2. Seed Database
Populates standard genetic conditions, 9 expert decision rules, default users, a 3-generation demo family with BRCA1 / CF conditions, and pre-computed assessments:
```bash
npm run seed
```

### 3. Run Development Servers
```bash
# Terminal 1 - Backend (port 5000):
npm run dev:server

# Terminal 2 - Frontend (port 5173):
npm run dev:client
```

Or build and run unified:
```bash
npm run build:client
npm run dev:server
# Open http://localhost:5000 in your browser!
```

---

## 6. Pre-Configured Demo Credentials

All portals feature a **Quick-Fill Demo Account** button for instant 1-click evaluation:

| Portal | Email | Password | Role Description |
|---|---|---|---|
| **Patient Portal** (`/login`) | `user@pedigree.local` | `User@123` | Alex Morgan (Proband with BRCA1 carrier history) |
| **Counselor Portal** (`/counselor/login`) | `counselor@pedigree.local` | `Counselor@123` | Dr. Sarah Chen, MS, CGC (Assigned Specialist) |
| **Admin Portal** (`/admin/login`) | `admin@pedigree.local` | `Admin@123` | System Administrator (Full Knowledge Base Control) |

---

## 7. AIES Rule Engine Specification

### Normalized Facts Extracted from Graph
- `proband_exists`, `proband_sex`, `parent_count`, `has_both_parents_recorded`
- `first_degree_relative_affected`, `second_degree_relative_affected`
- `multiple_affected_relatives`, `multi_generational_transmission`
- `consanguinity_detected`, `couple_carrier_match`, `matching_carrier_condition`
- `early_onset_detected` (age of onset < 50)
- `family_history_complete`, `required_family_information_missing`

### Decision-Support Categories
1. `COUNSELOR_REVIEW` (Critical / High Priority): Dual-carrier recessive match, multi-generational dominant transmission, early-onset familial clustering.
2. `REVIEW_RECOMMENDED` (Moderate Priority): First-degree affected relative, consanguinity, isolated carrier status.
3. `INFORMATIONAL` (Standard / Baseline): Standard preconception profile with no identified high-risk indicators.
4. `INSUFFICIENT_INFORMATION`: Missing basic parentage or generational depth.

---

## 8. Verification & Test Suite

The test suite validates authentication guards, RBAC enforcement, rule logic, fact extraction, and PDF generation:

```bash
npm test:server
```

**Test Results:**
- `tests/ruleEngine.test.js` (6 tests passed)
- `tests/api.test.js` (6 tests passed)
- `tests/report.test.js` (1 test passed)
- **Total: 13 / 13 Passed (100%)**
