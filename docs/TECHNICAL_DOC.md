# Technical Documentation & Architecture Guidelines

This document outlines the internal architecture, design decisions, and system constraints for the Visitor Management System (VMS).

---

## 1. Clean Architecture Layers

The VMS enforces a strict, layered architecture to decouple UI components from business rules, and business rules from the cloud infrastructure.

### Presentation Layer (`src/features`, `src/components`)
- **Responsibility:** User Interface, navigation, and state mapping.
- **Rules:** 
  - Cannot import from `src/infrastructure` directly.
  - Interacts with Business Logic only through `UseCases` or `Repositories`.
  - Driven by global state via Redux (`src/app/store.ts`).

### Domain Layer (`src/domain`)
- **Responsibility:** Core business models and data source contracts (interfaces).
- **Rules:**
  - Has zero dependencies on external frameworks (e.g., no Firebase, no Expo imports).
  - Defines the shape of entities (`Visitor`, `Visit`, `VisitorPass`).
  - Defines repository interfaces (`IVisitorDataSource`, `IVisitDataSource`) that the infrastructure layer must fulfill.

### Infrastructure Layer (`src/infrastructure`)
- **Responsibility:** Concrete implementations of the Domain interfaces.
- **Rules:**
  - This is the **only** layer where Firebase, external APIs, or local SQLite storage configurations exist.
  - Implements the Data Sources (e.g., `FirebaseVisitDataSource` implements `IVisitDataSource`).

---

## 2. Entity Modeling Strategy

In many basic systems, a "Visitor" and their "Visit" are merged into a single object. The VMS separates these into strictly bounded contexts to preserve data integrity and prevent PII duplication.

1. **Visitor:** 
   - A permanent identity containing Name, Phone, Email, and Company.
   - Example ID: `vis_8f812a`
2. **Visit:** 
   - A transactional record connecting a `Visitor` to a `Host` for a specific `Purpose` at a scheduled `Time`.
   - Contains dynamic statuses (`PENDING`, `APPROVED`, `CHECKED_IN`).
   - Example ID: `vst_99b21z`
3. **Visitor Pass:** 
   - A digital artifact (QR token) generated upon an approved `Visit`. 
   - Has an expiration cycle and maps 1:1 back to a `Visit`.

When fetching data for the UI (e.g., `VisitorsScreen`), the `VisitorListUseCase` joins `Visits` with `Visitors` on the client to present a unified DTO.

---

## 3. Role-Based Access Control (RBAC) Engine

Permissions are not manually verified component-by-component. Instead, the application relies on an RBAC engine that dynamically computes capabilities during authentication.

1. **Role Definitions:** Configured in `src/core/auth/RoleMappings.ts`.
2. **Session Hydration:** When a user logs in, `FirebaseAuthDataSource` intercepts their `role` string, calculates the exact list of `Permissions` enums (e.g., `[Permissions.SCAN_QR, Permissions.CHECK_IN]`), and injects it into Redux.
3. **Guarded UI:** Components are wrapped in a `<PermissionGuard>` component.
   ```tsx
   <PermissionGuard permission={Permissions.CHECK_IN}>
     <Button onPress={checkIn}>Check In Visitor</Button>
   </PermissionGuard>
   ```

---

## 4. Offline-First Resilience

To ensure that security guards and front-desk receptionists are never blocked by network latency, the VMS is configured for offline resilience:

- **Firestore Persistence:** Enabled in `src/infrastructure/firebase/init.ts`. Standard queries will instantly resolve from the local SQLite cache while syncing in the background.
- **Offline Manager:** Found in `src/core/network/OfflineManager.ts`. It monitors network states via `@react-native-community/netinfo`.
- **Mutation Queueing:** (Planned) Critical write operations (like `CheckIn`) that occur offline will be queued and forcefully synced when the connection is restored.

---

## 5. Security & Validation

- **QR Token Scans:** Scanned tokens are not predictable integers. They are cryptographically robust strings mapping to a `VisitorPass`.
- **Undefined Safeguards:** Firebase throws terminal crashes if an `undefined` property is passed. Repositories must sanitize objects (converting `undefined` to `null` or default strings) before pushing to `FirebaseCrudDataSource`.

---

## 6. Theming & Dark Mode

The VMS uses `react-native-paper` for its component library, augmented by a custom Redux slice for global theme switching.

- **Storage:** The active theme is stored in `themeSlice` (`state.theme.isDarkMode`).
- **Provider:** The `ThemeWrapper` in `App.tsx` intercepts the Redux state and dynamically passes `AppLightTheme` or `AppDarkTheme` to the root `PaperProvider`.
- **Hardcoded Colors Forbidden:** Never use hex codes like `#FFFFFF` or `#000000` in component styling. Always refer to `theme.colors.background`, `theme.custom.colors.textPrimary`, etc.
