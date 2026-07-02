# Technical Design Document

This document outlines the core technical decisions, data schemas, and state management strategies for the Enterprise Visitor Management System (VMS).

## 1. Firebase Data Models

The system relies on a NoSQL document database (Firestore) with three primary collections: `visitors`, `visits`, and `visitor_passes`. This normalization prevents massive document bloat.

### `visitors` Collection
Stores the immutable identity of the person.
```typescript
interface Visitor {
  id: string;              // UUID
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  governmentId?: string;
  photoUrl?: string;       // URI to Firebase Storage
  status: VisitorStatus;   // ACTIVE, BLOCKED, BLACKLISTED
}
```

### `visits` Collection
Stores the lifecycle of a specific entry attempt.
```typescript
interface Visit {
  id: string;              // UUID
  visitorId: string;       // Ref -> visitors.id
  hostId: string;          // Employee Host ID
  purpose: string;
  status: VisitStatus;     // PENDING, APPROVED, CHECKED_IN, COMPLETED
  entryTime?: string;      // ISO string
  expectedExitTime?: string;
}
```

### `visitor_passes` Collection
Stores the secure QR tokens used for access control.
```typescript
interface VisitorPass {
  id: string;              // UUID
  visitId: string;         // Ref -> visits.id
  visitorId: string;       // Ref -> visitors.id
  qrToken: string;         // Secure random token
  status: PassStatus;      // GENERATED, EXPIRED, REVOKED
  validFrom: string;       // Time window start
  validUntil: string;      // Time window end
}
```

### `system_audit_logs` Collection
Immutable ledger for SOC2/GDPR compliance.
```typescript
interface AuditLog {
  id: string;
  timestamp: string;
  action: AuditAction;     // CHECK_IN, CREATE, VERIFY
  userId: string;          // Guard/Admin performing the action
  visitId?: string;
  details: object;
}
```

## 2. React Native & UI Strategy

### Navigation
We use `@react-navigation/native-stack` and `@react-navigation/bottom-tabs`. The routing dynamically switches between `AuthNavigator` and `AppNavigator` based on the Redux `isAuthenticated` state.

### State Management (Redux Toolkit)
- **`authSlice`**: Stores the JWT token, current user ID, and active Role.
- **`themeSlice`**: Manages Light/Dark mode toggles and dynamic custom design tokens.
- **Local Component State**: Ephemeral UI states (like loading spinners, active dashboard tabs, form inputs) are managed locally via `useState` to avoid Redux bloat.

### Styling & Theming
We utilize `react-native-paper` combined with custom design tokens. A unified `theme.ts` file provides centralized access to colors, fonts, and spacing, ensuring consistent aesthetics across the massive component library.

## 3. Transaction Safety (Firestore)

To prevent race conditions at scale (e.g., two guards scanning the same QR code at two different gates simultaneously), we rely on Firebase native transactions (`runTransaction`).

In `VisitorRepository.executeCheckInTransaction`, the transaction explicitly locks the `Visit` and `VisitorPass` documents. It first checks if the status is already `CHECKED_IN`—if it is, the transaction aborts. If not, it updates both documents simultaneously. This guarantees data integrity and prevents duplicate check-ins.
