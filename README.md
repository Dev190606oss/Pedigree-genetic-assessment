# GeneTrace
### Preconception Genetic Assessment & Guidance Platform

> **An Integrated Dual Platform Combining Software Engineering & Modelling (SEM) with Artificial Intelligence & Expert Systems (AIES)**  
> *Deterministic, Explainable Preconception Decision Support — Clinical Decision Support & Educational Guidance Platform.*

---

## 1. Project Overview

**GeneTrace** is an enterprise-grade full-stack clinical decision-support platform designed to bridge reproductive health, family pedigree modeling, and transparent, rule-based genetic risk evaluation.

The platform combines two foundational disciplines into one seamless application:
1. **Software Engineering & Modelling (SEM):** Robust relational and graph data models, 3-tier Role-Based Access Control (Patient, Genetic Counselor, Clinical Administrator), D3.js pedigree visualization with standard medical genetics nomenclature, counselor case triage workflows, audit logging, and automated clinical PDF reporting.
2. **Artificial Intelligence & Expert Systems (AIES):** A transparent, deterministic, rule-based production system implementing working memory (base vs. derived facts), multi-pass forward chaining until fixpoint, priority-weighted conflict resolution, goal-driven backward chaining, and explicit knowledge boundary handling (uncertainty management).

---

## 2. Integrated SEM + AIES Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             GENETRACE UNIFIED PLATFORM                           │
├────────────────────────────────────────┬─────────────────────────────────────────┤
│ Software Engineering & Modelling (SEM) │ Artificial Intelligence & Experts (AIES)│
├────────────────────────────────────────┼─────────────────────────────────────────┤
│ • 13 Mongoose Relational Schemas       │ • Graph Fact Extraction (50+ predicates)│
│ • Strict 3-Portal Role Security (RBAC) │ • IF-THEN Production Rules (AND/OR)     │
│ • Graph Integrity Validation Guardrails│ • Multi-Pass Forward Chaining Loop      │
│ • Interactive D3.js Pedigree Chart     │ • Priority-Weighted Conflict Resolution │
│ • Counselor Workflow & Note Triage     │ • Goal-Driven Backward Chaining Engine  │
│ • Admin Control & Immutable Audit Logs │ • 100% Explainable AI Deduction Traces  │
│ • Dynamic PDF Clinical Report Stream   │ • Uncertainty & Knowledge Boundaries    │
│ • Interactive AIES Analysis Studio     │ • 4 Pre-Loaded Synthetic Demo Cases     │
└────────────────────────────────────────┴─────────────────────────────────────────┘
```

---

## 3. Dedicated Portals & AIES Analysis Studio

### 1. Patient / User Portal (`/login`, `/register`)
- **Dashboard (`/user/dashboard`):** Family metrics, recent assessment summaries, quick actions.
- **Family Cases (`/user/families`):** Multi-family records management and status tracking.
- **Family Builder (`/user/families/:id/builder`):** 7-step guided workflow:
  `Basic Info` $\rightarrow$ `Members` $\rightarrow$ `Relationships` $\rightarrow$ `Conditions` $\rightarrow$ `Review` $\rightarrow$ `Pedigree` $\rightarrow$ `Assessment`.
- **Dynamic Pedigree View (`/user/families/:id/pedigree`):** Interactive D3 canvas rendering standardized clinical pedigree nomenclature (squares = males, circles = females, diamonds = unknown sex, shaded = affected, dot = carrier, double line = consanguinity).
- **Assessment View (`/user/assessments/:id`):** Executive summary, extracted base facts, triggered rules, forward chaining passes, goal proof trees, conflict resolution audit, and uncertainty limitation notices.
- **PDF Report Download:** One-click streaming of complete clinical summary PDF.

### 2. Genetic Counselor Portal (`/counselor/login`)
- **Dashboard (`/counselor/dashboard`):** Case queue metrics, triage states, pending reviews.
- **Case Queue (`/counselor/cases`):** Filterable table (`ALL`, `PENDING`, `IN_REVIEW`, `REVIEWED`, `COMPLETED`).
- **Case Review (`/counselor/cases/:familyId`):** Visual pedigree inspection, AIES reasoning audit, clinical note entry, status updating, and report export.

### 3. Clinical Administrator Portal (`/admin/login`)
- **Dashboard (`/admin/dashboard`):** System metrics, risk distribution charts, rule frequency analytics.
- **User Management (`/admin/users`):** Roster of all users with search, role filters, and activation toggling.
- **Counselor Management (`/admin/counselors`):** Roster and credentials management.
- **Condition Catalog (`/admin/conditions`):** Hereditary conditions catalog with inheritance modes.
- **AIES Rules Engine (`/admin/rules`):** Knowledge base manager to create and audit production rules.
- **Case Assignments (`/admin/assignments`):** Allocate patient family cases to counselors.
- **Audit Logs (`/admin/audit-logs`):** Immutable operational and authentication event log.

### 4. GeneTrace AIES Analysis Studio (`/expert-system`)
A dedicated live interactive demonstration interface accessible to students, faculty, and evaluators:
- **Case Selector:** 1-click execution across 4 pre-loaded synthetic demonstration cases or live patient families.
- **Tab 1: Multi-Pass Forward Chaining:** Step through Pass 1, Pass 2, etc., showing triggered rules, newly asserted facts, and detailed logs of non-firing rules showing *exact unmet premises*.
- **Tab 2: Working Memory & Facts:** Live inspection of Base Lineage Facts vs. Derived Intermediate Facts with search and filters.
- **Tab 3: Knowledge Base Explorer:** Filterable catalog of IF-THEN production rules with configurable `AND`/`OR` operators, priorities, categories, and guidance.
- **Tab 4: Backward Chaining Goal Investigator:** Interactive hypothesis tester: query any goal fact (e.g. `autosomal_dominant_pattern`, `dual_carrier_recessive_risk`) and view recursive proof trees.
- **Tab 5: Explainable AI & Audit:** Causal pipeline diagram, Conflict Resolution Decision Audit, and uncertainty limitation warnings.

---

## 4. 4 Curated Synthetic Demonstration Cases

| Case | Title | Inheritance / Pattern | Key AI Concepts Demonstrated | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **Case 1** | Consanguinity & Cystic Fibrosis Match | Autosomal Recessive / Consanguinity | Multi-premise rule evaluation, consanguinity inference, dual-carrier match deduction, critical severity conflict resolution. | `COUNSELOR_REVIEW` (Rule `RULE-AR-01`, 25% recurrence risk) |
| **Case 2** | Familial Huntington's Disease | Autosomal Dominant / Vertical | Vertical transmission across 3 generations, early-onset clustering, multi-pass chaining (`R04` $\rightarrow$ `R08`), backward chaining proof. | `COUNSELOR_REVIEW` (Rule `RULE-AD-01`, 50% transmission risk) |
| **Case 3** | Advanced Parental Age & Obstetric History | Chromosomal / Aneuploidy Risk | Quantitative numeric thresholds (`GREATER_THAN`), non-Mendelian risk synthesis, compound guidance generation. | `REVIEW_RECOMMENDED` (Rules `RULE-AMA-01`, `RULE-APA-01`, `RULE-RPL-01`) |
| **Case 4** | Incomplete Biological Lineage (Adopted) | Uncertainty / Knowledge Boundary | Open-world assumption: absence of reported illness $\neq$ low genetic risk. System flags incomplete lineage. | `INSUFFICIENT_INFORMATION` (Rule `R09`, Universal screening advised) |

---

## 5. Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, D3.js, Lucide Icons, Axios.
- **Backend:** Node.js, Express, Mongoose, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, PDFKit, Morgan.
- **Database:** MongoDB (Dual-mode: connects to `MONGODB_URI` with automatic zero-config fallback to `mongodb-memory-server` for instant offline execution).
- **Testing:** Vitest, Supertest (38 automated unit tests passing with 100% success rate).

---

## 6. Quickstart Guide

### Prerequisites
- Node.js (v18.x or v20.x recommended)
- npm (v9.x or later)
- MongoDB (optional; defaults to embedded in-memory database)

### Installation
```bash
# Install dependencies for both backend and frontend
npm run install:all
```

### Seeding Demo Data
```bash
# Seeds demo accounts, conditions catalog, default production rules, and sample families
npm run seed
```

**Pre-seeded Demo Credentials (Both `@genetrace.local` and `@pedigree.local` domains are active):**
- **Patient User (Client):** `user@genetrace.local` (or `user@pedigree.local`) / `User@123`
- **Genetic Counselor:** `counselor@genetrace.local` (or `counselor@pedigree.local`) / `Counselor@123`
- **Clinical Admin:** `admin@genetrace.local` (or `admin@pedigree.local`) / `Admin@123`

### Running Development Servers
```bash
# Terminal 1: Backend API & Expert System Engine (Port 5001)
npm run dev:server

# Terminal 2: Frontend Client (Port 5173)
npm run dev:client
```
Visit **http://localhost:5173** in your web browser.

### Running Automated Test Suite
```bash
# Run all unit tests
npm --prefix server run test
```

---

## 7. Syllabus & College Viva Voce Documentation

For full syllabus concept mappings, algorithmic details, worked mathematical/logical traces, and faculty viva questions & answers, please refer to:
- [`AIES_EXPERT_SYSTEM.md`](./AIES_EXPERT_SYSTEM.md)
