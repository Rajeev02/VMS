# Enterprise Visitor Management System (VMS)

[![React Native](https://img.shields.io/badge/React_Native-Expo-blue.svg)](https://expo.dev/)
[![Architecture](https://img.shields.io/badge/Architecture-Clean-brightgreen.svg)]()
[![Backend](https://img.shields.io/badge/Database-Firebase-orange.svg)](https://firebase.google.com/)

A production-grade, end-to-end Enterprise Visitor Management System built with React Native (Expo) and Firebase. This application handles the entire visitor lifecycle from pre-registration and host approval to QR-based multi-gate checkpoint verification and strict compliance auditing.

## Overview

The Enterprise VMS is designed to replace legacy paper-based logbooks with a secure, digital, and automated workflow. It addresses the security and compliance needs of large corporate campuses by ensuring every entry, internal movement, and exit is cryptographically tied to a dynamic QR pass and immutably recorded.

### Primary Use Cases
*   **Security Teams:** Rapidly verify visitor identity at main gates and internal checkpoints using mobile QR scanning.
*   **Receptionists:** Monitor real-time visitor traffic (Expected, Active, Completed) via a unified dashboard and generate compliance reports.
*   **Employees (Hosts):** Securely pre-register guests or approve walk-in requests before passes are generated.

---

## Core Features

*   **Clean Architecture Enforcement:** The codebase strictly separates Domain (entities, use cases), Infrastructure (Firebase, device APIs), and Presentation (React components, Redux), ensuring the business logic remains fully decoupled and highly testable via Dependency Injection (`ServiceLocator`).
*   **Role-Based Access Control (RBAC):** UI features and system capabilities are dynamically restricted based on the authenticated user's role (Security Guard, Receptionist, Host).
*   **Dynamic QR Generation & Validation:** Generates secure QR tokens tied to specific visits. Scanners enforce expiration windows, check-in statuses, and revocation, blocking unauthorized entry or pass reuse.
*   **Multi-Gate Verification:** Supports optional internal checkpoints (e.g., Executive Floor, Server Room) that log location-specific access without altering the primary check-in/out state.
*   **Atomic Transactions:** Firebase `runTransaction` guarantees that visit state changes (e.g., Check-In, Check-Out) are completely atomic, preventing concurrency issues like double check-ins.
*   **Immutable System Audit Logging:** Every critical state transition (Pass Generated, Check-In, Checkpoint Verified, Check-Out) writes a detailed, timestamped event to the `system_audit_logs` collection for SOC2/GDPR compliance.
*   **Data Export & Reporting:** Receptionists can generate and natively share CSV reports summarizing daily visitor traffic or full system audit logs.

---

## Architecture

The project adheres to Robert C. Martin's Clean Architecture principles.

### Components

1.  **Domain (`src/domain/`)**
    *   Contains the core business models (`Visit`, `Visitor`, `VisitorPass`) and pure repository/service interfaces (`IVisitDataSource`, `IAuditLogService`).
2.  **Core (`src/core/`)**
    *   Houses universal abstractions like `Logger`, RBAC utilities (`auth/permissions`), and the `ServiceLocator` for Dependency Injection.
3.  **Infrastructure (`src/infrastructure/`)**
    *   Implements the Domain interfaces. Contains concrete implementations like `FirebaseVisitDataSource` and `FirestoreAuditLogService`.
4.  **Features (Use Cases & Presentation) (`src/features/`)**
    *   Organized by module (e.g., `qr`, `visitor`, `dashboard`, `reports`).
    *   Each module contains its specific Use Cases (e.g., `ProcessCheckInUseCase`) which orchestrate the domain logic, completely agnostic of the UI.
    *   Contains the React Native UI screens (e.g., `QRScannerScreen.tsx`) which trigger the Use Cases.

---

## Technology Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | React Native (Expo) |
| **Language** | TypeScript |
| **State Management** | Redux Toolkit |
| **Database** | Firebase Firestore |
| **Styling** | React Native Paper / StyleSheet |
| **Camera/Scanner** | `expo-camera` |
| **Navigation** | React Navigation |

---

## Project Structure

```text
src/
├── app/                  # Redux store configuration
├── core/                 # Shared utilities, Logger, RBAC, ServiceLocator DI
├── domain/               # Enterprise business rules (Models, Enums, Interfaces)
├── features/             # Feature modules (Use Cases, Screens, Components)
│   ├── dashboard/        # Receptionist KPI Dashboard
│   ├── notifications/    # Email/SMS Mock facades
│   ├── qr/               # QR Scanning, Validation, and Checkpoint logic
│   ├── reports/          # CSV Generation and Audit Exports
│   └── visitor/          # Visitor Lifecycle (Approval, Check-In/Out)
├── infrastructure/       # Concrete implementations (Firebase, Mock services)
└── theme/                # Global styling and color tokens
```

---

## Prerequisites

*   Node.js (v18+)
*   Expo CLI (`npm install -g expo-cli`)
*   Firebase Account and configured Project

---

## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/enterprise-vms.git
    cd enterprise-vms
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Firebase Configuration:**
    *   Ensure `@react-native-firebase/app` and `@react-native-firebase/firestore` are properly linked.
    *   Place your `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) in the root directory.

4.  **Run the application locally (Expo Go):**
    ```bash
    npx expo start
    ```

---

## Security

*   **Transaction Safety:** Database writes for Check-In and Check-Out are locked via Firestore native transactions.
*   **QR Security:** QR codes contain secure tokens, not plain-text user data. Passes are strictly validated against `validFrom` and `validUntil` timestamps.
*   **Audit Trail:** The `IAuditLogService` captures the `userId` of the security guard/receptionist performing any mutating action, ensuring non-repudiation.
