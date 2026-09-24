# PEDIGREE — UI/UX Design Specification

## 1. Direction
Modern, clean, calm, trustworthy, professional and accessible. Healthcare-inspired but not pretending to be a clinical product.

Avoid excessive gradients, flashy animation and dense hospital-dashboard styling.

## 2. Layout

```text
┌──────────────────────────────────────────┐
│ Top Bar / Profile                        │
├────────────┬─────────────────────────────┤
│ Sidebar    │ Main Content                │
│ Navigation │ Cards / Forms / Tables      │
└────────────┴─────────────────────────────┘
```

Mobile: collapsible navigation, stacked cards, responsive tables.

## 3. Reusable Components
Button, Input, Select, Checkbox, Radio, Modal, Drawer, Card, Badge, Alert, Toast, Tooltip, Dropdown, Tabs, Table, Pagination, EmptyState, LoadingSkeleton, ConfirmationDialog, Breadcrumb, Stepper.

## 4. Authentication UI

### User Login
Email, Password, Remember Me, Login, Forgot Password, Register, links to Counselor Login and Admin Login.

### Counselor Login
Clearly labeled Counselor Portal.

### Admin Login
Clearly labeled Admin Portal.

## 5. User Dashboard
Show family count, members, conditions, latest assessment and status.

Primary CTA: **Continue Assessment**  
Secondary CTA: **View Pedigree**

## 6. Family Builder
Use stepper:

```text
Basic Info → Members → Relationships → Conditions → Review → Pedigree → Assessment
```

## 7. Pedigree
Zoom, pan, reset, legend, member selection and details panel.

## 8. Assessment
Use hierarchy:

```text
Result
↓
Summary
↓
Why this result?
↓
Triggered Rules
↓
Relevant Facts
↓
Guidance
↓
Counselor Review
```

Do not use wording that implies a medical diagnosis.

## 9. Accessibility
Keyboard navigation, labels, visible focus, proper headings, useful validation, adequate contrast, do not rely only on color.

## 10. Responsive Targets
1440px, 1024px, 768px, 390px. No major overflow.
