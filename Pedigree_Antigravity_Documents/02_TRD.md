# PEDIGREE — Technical Requirements Document

## 1. Stack
- React + Vite
- Tailwind CSS
- React Router
- Axios/fetch
- Node.js + Express
- MongoDB + Mongoose
- JWT
- bcrypt
- D3.js for pedigree visualization
- PDF generation library

## 2. Architecture

```text
React/Vite Client
       ↓ HTTPS/REST
Express API
 ├─ Auth/RBAC
 ├─ Family
 ├─ Pedigree
 ├─ Assessment
 ├─ Counselor
 ├─ Admin
 └─ Reports
       ↓
MongoDB

Assessment:
Family Data → Fact Builder → Rule Engine → Triggered Rules
→ Result → Explanation + Guidance
```

## 3. Frontend Structure

```text
src/
├── components/
├── layouts/
├── pages/auth/
├── pages/user/
├── pages/counselor/
├── pages/admin/
├── features/
├── services/
├── hooks/
├── utils/
└── routes/
```

## 4. Backend Structure

```text
server/
├── controllers/
├── routes/
├── models/
├── middleware/
├── services/
├── rules/
├── validators/
├── utils/
├── config/
└── server.js
```

## 5. Auth
Use bcrypt for passwords, JWT for authentication, protected middleware and server-side role authorization.

```text
authenticate()
authorize("USER")
authorize("COUNSELOR")
authorize("ADMIN")
```

## 6. API

### Auth
```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

### Families
```http
GET    /api/families
POST   /api/families
GET    /api/families/:id
PATCH  /api/families/:id
DELETE /api/families/:id
```

### Members
```http
POST   /api/families/:id/members
PATCH  /api/families/:id/members/:memberId
DELETE /api/families/:id/members/:memberId
```

### Relationships
```http
POST   /api/families/:id/relationships
DELETE /api/families/:id/relationships/:relationshipId
```

### Assessment
```http
POST /api/families/:id/assessment
GET  /api/families/:id/assessments
GET  /api/assessments/:id
```

### Counselor
```http
GET   /api/counselor/cases
GET   /api/counselor/cases/:id
PATCH /api/counselor/cases/:id
POST  /api/counselor/cases/:id/notes
```

### Admin
```http
GET   /api/admin/users
GET   /api/admin/counselors
POST  /api/admin/assignments
GET   /api/admin/rules
POST  /api/admin/rules
PATCH /api/admin/rules/:id
DELETE /api/admin/rules/:id
GET   /api/admin/audit-logs
```

## 7. Assessment Pipeline

```text
Database Data → Fact Builder → Normalized Facts → Rule Evaluation
→ Triggered Rules → Result Category → Guidance/Explanation → Assessment Record
```

The engine must be deterministic and explainable.

## 8. Environment

```env
PORT=
MONGODB_URI=
JWT_SECRET=
CLIENT_URL=
```

Never commit secrets.

## 9. Testing
Test authentication, RBAC, family CRUD, relationship validation, rule engine, assessment, reports and critical UI flows.
