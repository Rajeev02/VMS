# Enterprise Visitor Management System (VMS)

[![React Native](https://img.shields.io/badge/React_Native-Expo-blue.svg)](https://expo.dev/)
[![Architecture](https://img.shields.io/badge/Architecture-Clean-brightgreen.svg)]()
[![Backend](https://img.shields.io/badge/Database-Firebase-orange.svg)](https://firebase.google.com/)

A production-grade, end-to-end Enterprise Visitor Management System built with React Native (Expo) and Firebase. This application handles the entire visitor lifecycle from pre-registration and host approval to QR-based multi-gate checkpoint verification and strict compliance auditing.

## Overview

The Enterprise VMS is designed to replace legacy paper-based logbooks with a secure, digital, and automated workflow. It addresses the security and compliance needs of large corporate campuses by ensuring every entry, internal movement, and exit is cryptographically tied to a dynamic QR pass and immutably recorded.

---

## Core Features & Workflows

### 1. Role-Based Access Control (RBAC) & Personas
The system dynamically limits UI capabilities based on who logs in.

| Persona | Role | Primary Capabilities |
| :--- | :--- | :--- |
| **Security Guard** | Point of Entry | Scan QR passes, Log Multi-Gate Checkpoints, Create Walk-in Visitors (which require Host approval). |
| **Host (Employee)** | Internal Employee | Pre-approve expected guests (which generates a pass instantly), Approve/Reject walk-in guests. |
| **Receptionist** | Admin / Monitor | View live traffic dashboard, Export Audit Logs (CSV), Override approvals. |

### 2. Visitor Registration Flows
We support both Host Pre-Approval and Walk-In flows cleanly via the `RegisterWalkInVisitorUseCase`.

*   **Host Pre-Approval Flow:** An employee (Host) registers a guest in advance. The system sets the visit to `APPROVED` and dynamically generates a secure `VisitorPass` with a time-limited `validUntil` window. An email/SMS notification with the QR code is sent to the guest.
*   **Walk-in Flow:** A guest arrives without prior notice. Security or Reception creates the visitor profile. The system sets the visit to `PENDING` and **no pass is generated**. The Host receives a notification. Once the Host accepts via `ProcessApprovalUseCase`, the pass is generated.

### 3. Check-In & Multi-Gate Verification
*   **Atomic Check-In:** Security scans the pass. `ValidateQrScanUseCase` ensures the pass is not `EXPIRED` or `REVOKED`. If valid, Firebase `runTransaction` securely locks the DB, setting Visit to `CHECKED_IN`.
*   **Checkpoints:** Security at restricted areas (e.g., Server Room) scans the pass using `VerifyCheckpointUseCase`. This logs the location access in `checkpoint_logs` without checking the user out of the building.
*   **Atomic Check-Out:** Scanning the pass upon exit permanently sets the Visit to `COMPLETED` and the VisitorPass to `EXPIRED`, completely blocking pass reuse.

### 4. System Audit Logging
Every critical action is logged immutably via `IAuditLogService` into the `system_audit_logs` collection to satisfy SOC2/GDPR compliance. Receptionists can export this data as a CSV.

---

## Test Credentials

For manual testing, you can use the following mock credentials. These route you to the appropriate UI flows based on the RBAC implementation.

| Persona | Email (Login) | Password |
| :--- | :--- | :--- |
| **Host** | `host@company.com` | `password123` |
| **Security Guard** | `guard@company.com` | `password123` |
| **Receptionist** | `admin@company.com` | `password123` |

*(Note: In the local dev environment, the Mock Auth Service bypasses actual Firebase Auth, but enforces the role bindings)*.

---

## Architecture

The project adheres to Robert C. Martin's Clean Architecture principles.

### Dependency Injection (Service Locator)
We use a static `ServiceLocator` to inject external dependencies (`IAuditLogService`, `IStorageService`) into our Use Cases. This ensures the Domain is 100% pure and highly testable. 
```typescript
// Example: Use Case Decoupling
this.auditLogger = auditLogger || ServiceLocator.getAuditLogger();
```

### Directory Structure

```text
src/
├── app/                  # Redux store configuration
├── core/                 # Shared utilities, Logger, RBAC, ServiceLocator DI
├── domain/               # Enterprise business rules (Models, Enums, Interfaces)
├── features/             # Feature modules (Use Cases, Screens, Components)
│   ├── auth/             # Login and RBAC State
│   ├── dashboard/        # Receptionist KPI Dashboard
│   ├── notifications/    # Email/SMS Mock facades
│   ├── qr/               # QR Scanning, Validation, and Checkpoint logic
│   ├── reports/          # CSV Generation and Audit Exports
│   └── visitor/          # Visitor Lifecycle (Approval, Check-In/Out)
├── infrastructure/       # Concrete implementations (Firebase, Mock services)
└── theme/                # Global styling and color tokens
```

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

*   **Transaction Safety:** Database writes for Check-In and Check-Out are locked via Firestore native transactions, preventing race conditions like double check-ins.
*   **QR Security:** QR codes contain secure random tokens, not plain-text user data. Passes are strictly validated against `validFrom` and `validUntil` timestamps.
*   **Audit Trail:** The `IAuditLogService` captures the `userId` of the security guard/receptionist performing any mutating action, ensuring non-repudiation.

---

## Future Enhancements & Roadmap

The Enterprise VMS is built on a highly extensible foundation. Here are several feature flows that can be implemented next:

1. **Facial Recognition Check-in**: Integrate a third-party SDK (like AWS Rekognition or Azure Face) to allow VIP visitors to check-in via face scan instead of a QR code.
2. **Push Notifications (FCM/APNs)**: Replace the current `MockNotificationServices` with actual Firebase Cloud Messaging to send real-time push alerts to Hosts when their guests arrive.
3. **Hardware Integration (Turnstiles/Printers)**: Connect the VMS to physical turnstiles via Bluetooth/Wi-Fi APIs, or integrate with badge printers (e.g., Brother QL series) to automatically print sticky badges upon check-in.
4. **Self-Service Kiosk Mode**: Create a locked-down iPad/Android tablet view where walk-in visitors can register themselves, take their own photo, and automatically ping the Host for approval.
5. **Advanced Analytics Dashboard**: Add charts and graphs (using libraries like `react-native-chart-kit`) to the Receptionist dashboard to visualize peak visitor hours and checkpoint bottlenecks.

---

## Migrating Away From Firebase (Custom Backend)

Because this project strictly adheres to **Clean Architecture**, replacing Firebase with your own custom backend (e.g., Node.js/Express, Spring Boot, or Go) is incredibly straightforward and requires **zero changes to the UI or Use Cases**.

### Migration Steps:

1. **Create New Data Sources**: 
   Inside `src/infrastructure/`, create new files implementing the Domain interfaces. For example, create `RestApiVisitDataSource.ts` that implements `IVisitDataSource` using Axios/Fetch instead of Firestore.
   
2. **Implement API Calls**:
   ```typescript
   // Example of RestApiVisitDataSource.ts
   export class RestApiVisitDataSource implements IVisitDataSource {
     async updateVisit(id: string, updates: Partial<Visit>): Promise<Visit> {
       const response = await axios.patch(`https://api.yourcompany.com/visits/${id}`, updates);
       return response.data;
     }
     // ... implement other interface methods
   }
   ```

3. **Update the Service Locator**:
   Open `src/core/di/ServiceLocator.ts` and swap out the Firebase implementations for your new REST implementations.
   ```typescript
   // Change this:
   // this.auditLogger = new FirestoreAuditLogService();
   
   // To this:
   this.auditLogger = new RestApiAuditLogService();
   ```

4. **Migrate Auth & Storage**:
   Similarly, swap out Firebase Auth with JWT/OAuth logic in your Redux slices, and replace Firebase Storage with your own S3/Blob storage uploads in `IStorageService`.

Because the entire Domain and Use Case layer only speaks to the interfaces (like `IVisitDataSource`), the rest of the application will seamlessly switch to your custom backend without breaking a single business rule!
