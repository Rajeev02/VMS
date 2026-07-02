# VMS Architecture Overview

## 1. High-Level Architecture
The Enterprise Visitor Management System (VMS) is built using a strict **Clean Architecture** combined with a **Feature-First** layout inside a React Native application. This approach ensures that core business rules (Domain Layer) are completely decoupled from UI frameworks (React), External Services (Firebase), and Device APIs (Camera, Storage).

## 2. Clean Architecture Layers

### Domain (`src/domain/`)
The absolute core of the application. It contains no dependencies on React Native, Firebase, or external libraries.
- **Models**: Interfaces for core entities (`Visit`, `Visitor`, `VisitorPass`).
- **Enums**: System-wide states (`VisitStatus`, `PassStatus`, `AuditAction`).
- **Interfaces**: Abstract contracts for external services (`IVisitDataSource`, `IAuditLogService`, `IDocumentService`).

### Use Cases (`src/features/.../usecases/`)
Contains the application-specific business rules. Use Cases orchestrate the flow of data to and from the Domain entities.
- Example: `ProcessCheckInUseCase`, `RegisterWalkInVisitorUseCase`.
- Use Cases do not know about Firebase or React Native; they only interact with interfaces defined in the Domain.

### Infrastructure (`src/infrastructure/`)
Concrete implementations of the Domain interfaces.
- Example: `FirebaseVisitDataSource` implements `IVisitDataSource`.
- Example: `FirestoreAuditLogService` implements `IAuditLogService`.
- If we migrate from Firebase to a custom REST API, only this folder changes.

### Presentation (`src/features/.../screens/`)
React Native UI components and screens. The UI triggers Use Cases and renders data, but contains zero business logic.

## 3. Dependency Injection (Service Locator)
To achieve true decoupling, Use Cases never instantiate Infrastructure classes directly. Instead, they rely on a static Dependency Injection container located at `src/core/di/ServiceLocator.ts`.
```typescript
// Use Cases fetch their dependencies like this:
this.auditLogger = ServiceLocator.getAuditLogger();
```
This pattern allows us to effortlessly swap out `FirestoreAuditLogService` for `MockAuditLogService` during testing.

## 4. State Management & Data Flow
*   **Global UI State**: Managed via **Redux Toolkit** (e.g., Auth State, Theming).
*   **Data Persistence**: Handled entirely via Firestore Native APIs.
*   **Transaction Safety**: Complex operations (like Check-In) utilize Firebase `runTransaction` inside the Repository layer to guarantee atomic writes, preventing race conditions such as double check-ins.

## 5. Directory Structure
```
src/
├── app/               # Redux store configuration
├── core/              # Shared infrastructure (DI ServiceLocator, Logger, RBAC)
├── domain/            # Core business models, enums, and pure interfaces
├── features/          # Feature modules (Domain logic + Presentation)
│   ├── auth/          # Authentication flows and state
│   ├── dashboard/     # Dashboard UI and KPI generation
│   ├── notifications/ # Notification Facades
│   ├── qr/            # QR validation and checkpoint Use Cases
│   ├── reports/       # Report generation (CSV)
│   └── visitor/       # Visitor lifecycle Use Cases
├── infrastructure/    # Concrete implementations (Firebase, Device Storage, Mocks)
└── theme/             # Centralized design tokens and React Native Paper configuration
```
