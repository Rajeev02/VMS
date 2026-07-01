# Enterprise Visitor Management System (VMS)

An enterprise-grade Physical Identity & Access Management (PIAM) mobile application built with React Native and Expo. 

This project demonstrates senior-level engineering practices, focusing on robust domain modeling, clean architecture, security by design, and strict data integrity.

## 🏗 Architecture Principles

This application is built upon several strict engineering principles designed for scalability and enterprise deployments:

### 1. Domain Separation (The Core Tenet)
In many simple apps, a "Visitor" and a "Visit" are merged. In this enterprise system, they are strictly separated:
* **Visitor**: The permanent identity of the person (Name, Phone, Email, Gov ID, Photo, Lifetime Visit Count, Status). A visitor record is created **only once**.
* **Visit**: The transactional record of an appointment (Host, Time, Purpose, Location).
* **Visitor Pass**: The temporary, secure digital token generated specifically for a single Visit (QR Token, Expiry, Status).

### 2. Configuration over Hardcoding (Feature Flags)
Business rules change based on the physical site. 
The application utilizes a `FeatureFlagService` allowing remote toggling of critical rules without app updates:
* `governmentIdMandatory`: boolean
* `visitorPhotoMandatory`: boolean
* `qrVerificationEnabled`: boolean

### 3. Abstract Infrastructure Layer
The application is entirely decoupled from its backend database. It uses an `IStorageProvider` interface managed by a `StorageManager` singleton. The current implementation uses a `MockFirebaseProvider`, but migrating to PostgreSQL, Supabase, or a REST API requires zero changes to the UI or Domain layers.

### 4. Smart Duplicate Prevention
The system enforces strict duplicate detection during walk-in registration. The `SmartSearchService` evaluates searches in a priority sequence before allowing profile creation:
1. Government ID
2. Phone Number
3. Email
4. Name

### 5. Offline-First Resilience
Physical security desks suffer from intermittent internet access. The application uses a `SyncQueue` to capture `CREATE`, `UPDATE`, and `DELETE` mutations locally when offline, and automatically synchronizes them when `@react-native-community/netinfo` detects a connection restoration.

### 6. Role vs Permission Decoupling (PBAC)
The UI does not hardcode roles (`if role === 'ADMIN'`). Instead, it uses Permission-Based Access Control (`if hasPermission(AppPermission.APPROVE_VISIT)`). The `AuthorizationService` handles mapping roles to granular permissions.

### 7. Comprehensive Audit Logging
Every action (Login, Create Visit, Generate Pass, Verify QR, Check-In, Check-Out) writes an immutable record to the `AuditRepository`. The UI utilizes these logs to generate real-time chronological security timelines for investigations.

### 8. Enterprise Localization (i18n)
Built using `i18next`, the system is architected from day one to support multiple languages (English, Hindi, Kannada) and handles pluralization/interpolation correctly.

---

## 🛠 Tech Stack

* **Framework**: React Native (Expo)
* **Language**: TypeScript (Strict Mode)
* **State Management**: Redux Toolkit (Slices for Auth, Theme)
* **Navigation**: React Navigation (Native Stack)
* **UI Components**: React Native Paper (Material Design 3)
* **Lists**: `@shopify/flash-list` (High performance rendering)
* **i18n**: `i18next`, `react-i18next`
* **Network Status**: `@react-native-community/netinfo`

---

## 📂 Project Structure (Feature-First)

```
src/
├── components/          # Shared, dumb UI components (Buttons, Inputs, Badges)
├── core/                # Infrastructure & Abstractions
│   ├── analytics/       # Analytics tracking
│   ├── authz/           # RBAC/PBAC Logic
│   ├── config/          # Feature Flags
│   ├── i18n/            # Localization Engine
│   ├── logger/          # Centralized logging
│   ├── network/         # Offline Sync Queue
│   ├── notifications/   # Push/SMS/Email abstractions
│   └── storage/         # Secure storage & Abstract DB Providers
├── domain/              # Core Business Logic (Clean Architecture)
│   ├── models/          # Visitor, Visit, Pass, Audit Types & Enums
│   └── repositories/    # Data Access Layer implementations
├── features/            # Feature-centric modules
│   ├── auth/            # Login, Auth State
│   ├── dashboard/       # Main Overview
│   └── visitor/         # Registration, Verification, Details
├── navigation/          # React Navigation routers
└── theme/               # Global App Theme
```

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Run on iOS Simulator
npm run ios

# Run on Android Emulator
npm run android

# Start Metro Bundler
npm start
```
