# VMS Architecture Overview

## 1. High-Level Architecture
The Visitor Management System (VMS) is built using a **Feature-First Architecture** inside a React Native application (Expo managed workflow with Config Plugins). This approach groups code by business domain (e.g., `auth`, `visitor`, `qr`) rather than technical concern, making the codebase highly scalable and maintainable for enterprise environments.

## 2. Directory Structure
```
src/
├── app/               # Application entry point, global Redux store, main providers
├── core/              # Shared infrastructure (Network, Storage, Logger, Auth/RBAC logic)
├── features/          # Domain-specific feature modules
│   ├── auth/          # Authentication flows and state
│   ├── dashboard/     # Dashboard UI and logic
│   ├── visitor/       # Visitor list, details, creation, and mock data repo
│   └── qr/            # QR scanning functionality
├── navigation/        # React Navigation stack and tab configurations
├── shared/            # Reusable UI components, generic hooks, utilities
└── theme/             # Centralized design tokens and React Native Paper configuration
```

## 3. Core Principles
*   **Separation of Concerns**: The API client, local storage, business logic (Redux Slices/Repos), and UI are strictly separated.
*   **Offline-First**: Uses an `OfflineManager` that queues failed requests locally using `SecureStorage` and automatically syncs them when network connectivity is restored (via `@react-native-community/netinfo`).
*   **Security**: Tokens are stored securely using `expo-secure-store`. Logging strips sensitive information, and role-based access control (RBAC/PBAC) is heavily enforced on both navigation and UI component levels (`PermissionGuard`).
*   **Performance**: Utilizes `FlashList` for large data sets, prevents unnecessary renders via component structuring, and carefully manages lifecycle hooks for heavy modules like `react-native-vision-camera`.

## 4. State Management & Data Flow
*   **Global UI & Business State**: Managed via **Redux Toolkit**.
*   **Authentication Flow**: Validates session on startup. Navigation dynamically renders `AuthNavigator` or `AppNavigator` based on state.
*   **Mock Repositories**: Data access logic is abstracted into `Repository` classes, making it trivial to swap mock data for real API calls (using `ApiClient`) in the future.

## 5. Future Extensibility
This architecture supports dropping in new features (e.g., `features/parking`, `features/contractors`) simply by adding a new folder under `src/features/` and registering its routes/reducers, without touching existing feature code.
