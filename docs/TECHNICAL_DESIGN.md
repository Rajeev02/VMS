# Technical Design & Architectural Considerations

This document outlines the technical decisions, trade-offs, and architectural considerations made prior to and during the implementation of the Enterprise Visitor Management System (VMS).

## 1. Framework Selection: Expo (Prebuild / Config Plugins) vs Bare React Native CLI
**Consideration:** Enterprise applications often require deep native integrations (e.g., Camera, Secure Enclave, MDM solutions). Historically, this pushed teams toward Bare React Native CLI. However, maintaining iOS/Android folders leads to difficult upgrades and native build failures over time.
**Decision:** We chose **Expo with Custom Development Clients (Prebuild)**.
**Why:** It provides the native capabilities of a bare workflow without the maintenance overhead of managing `ios` and `android` directories. Native dependencies (like `react-native-vision-camera` and `expo-secure-store`) are injected deterministically via Config Plugins inside `app.json`.

## 2. Directory Structure: Feature-First vs Layer-First
**Consideration:** As applications grow, a layer-first structure (grouping by `components`, `screens`, `hooks`) becomes extremely difficult to navigate because related business logic is scattered across the repository.
**Decision:** We chose a **Feature-First Architecture**.
**Why:** The codebase is partitioned by business domain (`auth`, `visitor`, `qr`, `dashboard`). Each feature contains its own screens, components, and state slices. This enforces strict separation of concerns, prevents circular dependencies, and makes it trivial for large teams to work on different modules simultaneously without merge conflicts.

## 3. Styling & Theming
**Consideration:** Maintaining consistent UI spacing, colors, and typography across a large mobile application requires strict enforcement. Options included NativeWind (Tailwind), Restyle (Shopify), or standard React Native StyleSheets with a centralized Theme Provider.
**Decision:** We opted for a **Centralized Theme Provider with React Native Paper**.
**Why:** Following the project constraints to avoid utility-first CSS frameworks like NativeWind, we built a strict, centralized token system (`src/theme/theme.ts`). React Native Paper provides accessible, Material Design-compliant baseline components, while our custom theme tokens ensure that any new component strictly adheres to the enterprise color palette and spacing rules.

## 4. State Management: UI State vs Server State
**Consideration:** Mixing asynchronous network calls with synchronous UI state inside standard React Contexts or basic Redux setups leads to bloated components and "prop drilling".
**Decision:** We utilized **Redux Toolkit (RTK)**.
**Why:** RTK clearly separates synchronous application state (like User Sessions and Permissions) from the UI layer. For data fetching, a centralized Repository pattern was implemented, allowing us to easily swap the current mock API implementations with RTK Query or Apollo GraphQL in the future without touching the UI components.

## 5. Security & Authorization (RBAC vs PBAC)
**Consideration:** Hardcoding roles (e.g., `if (user.role === 'ADMIN')`) into UI components is an anti-pattern. If a "Host" role suddenly requires access to a feature previously only for "Admins", the entire UI layer must be refactored.
**Decision:** We implemented **Permission-Based Access Control (PBAC)** via a `PermissionGuard` wrapper.
**Why:** The backend returns an array of specific permissions (e.g., `SCAN_QR`, `CHECK_IN`). UI buttons and navigation tabs are rendered conditionally based on these discrete permissions rather than the user's overarching role. This makes the frontend completely agnostic to business-level role changes. Additionally, all JWT tokens are stored securely in the device's hardware keychain using `expo-secure-store`.

## 6. Offline-First Resilience
**Consideration:** Visitor Management Systems are often used in building lobbies or basements where cellular and Wi-Fi connectivity is spotty. The app cannot crash or lose check-in data when a network request drops.
**Decision:** We implemented a custom **OfflineManager**.
**Why:** It intercepts API requests. If the device is offline (`@react-native-community/netinfo`), the request is serialized and stored locally. A background listener automatically processes the queue and syncs the data with the backend the moment network connectivity is restored.

## 7. Performance & Memory Management (QR Scanner)
**Consideration:** Continuous use of the camera sensor in a React Native application is a notorious source of memory leaks, device overheating, and battery drain.
**Decision:** We implemented strict lifecycle hooks on the `QRScannerScreen` using `react-native-vision-camera`.
**Why:** By utilizing React Navigation's `useIsFocused` hook, we guarantee that the camera sensor is immediately torn down and resources are released to the OS the millisecond the user navigates away from the scanner tab. Furthermore, all large lists (like the Visitor List) utilize `@shopify/flash-list` to recycle views and maintain 60 FPS scrolling, avoiding the memory bloat of standard FlatLists.

## 8. Error Handling
**Consideration:** A white screen of death is unacceptable in an enterprise environment.
**Decision:** We implemented a Global **ErrorBoundary** and a Centralized **Logger**.
**Why:** The Error Boundary catches React rendering errors and displays a friendly fallback UI with a retry mechanism. The Centralized Logger replaces `console.log` ensuring that in production, sensitive user data is never accidentally leaked to standard output, while still allowing for structured error reporting to services like Sentry.
