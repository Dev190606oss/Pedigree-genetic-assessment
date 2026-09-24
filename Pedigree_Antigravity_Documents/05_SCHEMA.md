# PEDIGREE — Database Schema Document

**Database:** MongoDB / Mongoose

## 1. Models

### User
```js
{
  _id, name, email, passwordHash,
  role: "USER" | "COUNSELOR" | "ADMIN",
  isActive, createdAt, updatedAt
}
```

### Family
```js
{ _id, ownerId, name, description, status, createdAt, updatedAt }
```

### FamilyMember
```js
{
  _id, familyId, name, sex, dateOfBirth,
  isProband, deceased, notes, createdAt, updatedAt
}
```

### Relationship
```js
{
  _id, familyId, fromMemberId, toMemberId,
  type, metadata, createdAt
}
```

Initial relationship types:
`PARENT_CHILD`, `SPOUSE`, `PARTNER`, `SIBLING`.

Prevent self relationships, duplicates, invalid IDs and cross-family relationships.

### Condition
```js
{
  _id, name, code, description, category,
  isActive, createdAt, updatedAt
}
```

### FamilyMemberCondition
```js
{
  _id, familyId, memberId, conditionId,
  status, ageAtOnset, notes, source, createdAt
}
```

### Rule
```js
{
  _id, name, description, category, priority,
  conditions, result, guidance, explanation,
  isActive, version, createdBy, createdAt, updatedAt
}
```

### Assessment
```js
{
  _id, familyId, userId, inputSnapshot, facts,
  triggeredRules, resultCategory, summary,
  guidance, disclaimer, engineVersion, createdAt
}
```

### CounselorAssignment
```js
{
  _id, familyId, counselorId, assignedBy,
  status, assignedAt, updatedAt
}
```

### CounselorNote
```js
{
  _id, familyId, counselorId, assessmentId,
  note, recommendation, createdAt, updatedAt
}
```

### Report
```js
{
  _id, familyId, assessmentId, generatedBy,
  fileReference, createdAt
}
```

### AuditLog
```js
{
  _id, actorId, action, entityType,
  entityId, metadata, createdAt
}
```

### Notification
```js
{
  _id, recipientId, title, message,
  type, read, createdAt
}
```

## 2. Relationships

```text
User 1 ── N Family
Family 1 ── N FamilyMember
Family 1 ── N Relationship
FamilyMember N ── N Condition
Family 1 ── N Assessment
Counselor 1 ── N CounselorAssignment
Assessment 1 ── N CounselorNote
Assessment 1 ── N Report
```

## 3. Integrity
Validate ownership on every protected resource. Use indexes for common queries. Preserve rule/engine versions in historical assessments. Avoid unnecessary sensitive data.
