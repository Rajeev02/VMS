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

### Extended Documentation
For a deeper dive into the system's inner workings, please refer to our dedicated documentation inside the `docs/` folder:
*   [📖 Roles & Workflows](docs/ROLES_AND_WORKFLOWS.md): Detailed breakdown of every user persona and step-by-step visitor lifecycles.
*   [🏗️ Architecture](docs/ARCHITECTURE.md): Explanation of the Clean Architecture implementation and Service Locator pattern.
*   [⚙️ Technical Design](docs/TECHNICAL_DESIGN.md): Firebase data schemas, Redux state management, and transaction safety mechanics.

### 2. Visitor Registration Flows
We support both Host Pre-Approval and Walk-In flows cleanly via the `RegisterWalkInVisitorUseCase`.

*   **Host Pre-Approval Flow:** An employee (Host) registers a guest in advance. The system sets the visit to `APPROVED` and dynamically generates a secure `VisitorPass` with a time-limited `validUntil` window. An email/SMS notification with the QR code is sent to the guest.
*   **Walk-in Flow:** A guest arrives without prior notice. Security or Reception creates the visitor profile. The system sets the visit to `PENDING` and **no pass is generated**. The Host receives a notification. Once the Host accepts via `ProcessApprovalUseCase`, the pass is generated.

### 3. Web-Based Digital Pass for Visitors
Because external visitors do not download the VMS application, the system generates a secure, web-based digital pass.
*   Once a visit is `APPROVED`, the system creates a unique cryptographic token and generates a public URL.
*   This URL is emailed/SMS'd to the visitor. They simply tap the link to view their dynamic QR code on their mobile browser.
*   **Live Examples (Ready to Scan):** Try clicking these to see how the web app handles each status, or scan them using the mobile app:
    
    ✅ **Valid Passes**
    1. [John Doe's Pass](https://rajeev02.github.io/vms/pass.html?token=valid-123)
    2. [Jane Smith's Pass](https://rajeev02.github.io/vms/pass.html?token=valid-456)
    
    ❌ **Invalid / Other States**
    3. [Expired Pass](https://rajeev02.github.io/vms/pass.html?token=expired-123)
    4. [Already Used/Scanned](https://rajeev02.github.io/vms/pass.html?token=scanned-123)
    5. [Revoked Pass](https://rajeev02.github.io/vms/pass.html?token=revoked-123)

### 4. Check-In & Multi-Gate Verification
*   **Atomic Check-In:** Security scans the pass. `ValidateQrScanUseCase` ensures the pass is not `EXPIRED` or `REVOKED`. If valid, Firebase `runTransaction` securely locks the DB, setting Visit to `CHECKED_IN`.
*   **Checkpoints:** Security at restricted areas (e.g., Server Room) scans the pass using `VerifyCheckpointUseCase`. This logs the location access in `checkpoint_logs` without checking the user out of the building.
*   **Atomic Check-Out:** Scanning the pass upon exit permanently sets the Visit to `COMPLETED` and the VisitorPass to `EXPIRED`, completely blocking pass reuse.

### 5. System Audit Logging
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

The project adheres strictly to **Clean Architecture** principles.

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

## Installation & Local Setup

### 1. Repository Setup
Clone the repository and install the required dependencies:
```bash
git clone https://github.com/your-org/enterprise-vms.git
cd enterprise-vms
npm install
```

### 2. Firebase Configuration (Mandatory)
Because this project uses native Firebase SDKs (`@react-native-firebase`), you must connect it to a real Firebase project to run it locally.
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Firestore Database** (start in Test Mode for local dev).
3. Enable **Firebase Authentication** (Email/Password provider).
4. Register an **Android App** and an **iOS App** in your Firebase project.
5. Download the `google-services.json` (for Android) and `GoogleService-Info.plist` (for iOS).
6. Place both of these files in the absolute root directory of this repository (`/enterprise-vms/`).

### 3. Running the Application
Since this project uses native libraries like Vision Camera, you must prebuild the app or use Expo Go if plugins allow. For the best development experience:
```bash
# Start the bundler and clear cache
npx expo start --clear

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

---

## Debugging & Troubleshooting

If you run into issues while evaluating or running the project, check these common fixes:

*   **App crashes immediately on launch**: Double-check that your `google-services.json` and `GoogleService-Info.plist` files are correctly placed in the root directory. Firebase native will crash if these are missing.
*   **"Firestore permission denied"**: Ensure your Firestore Security Rules in the Firebase console are set to allow reads/writes (Test Mode).
*   **Metro Bundler Cache Issues**: If you get bizarre TypeScript or module resolution errors, clear the Metro cache by running: `npx expo start -c`.
*   **Vision Camera not working in Simulator**: The iOS simulator does not support hardware cameras. To test QR scanning, you must run the app on a physical device using `npx expo run:ios --device`.

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
