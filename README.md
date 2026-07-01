# Enterprise Visitor Management System

A production-quality React Native application demonstrating enterprise mobile engineering best practices, clean architecture, and modular design.

## Features
*   **Role-Based Access Control (RBAC/PBAC)**: Fine-grained UI and navigation guards based on user permissions.
*   **Offline Support**: Network state monitoring, request queuing, and automatic synchronization.
*   **Secure Authentication**: JWT flow with secure token persistence and auto-login routines.
*   **High Performance**: Uses `FlashList` for long lists and strict memory management for native modules like the Camera.
*   **Enterprise Architecture**: Feature-first folder structure, separated data/API layers, and centralized theme tokens.

## Prerequisites
*   Node.js (>= 18.x)
*   Expo CLI (`npm install -g expo-cli`)
*   iOS Simulator / Android Emulator

## Setup Guide

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Run the Project (Development Client recommended due to native modules)**
    Since this project uses `react-native-vision-camera` and `expo-secure-store`, it requires a custom development client (prebuild) or testing via EAS Build.
    ```bash
    npx expo run:ios
    # OR
    npx expo run:android
    ```

## Environment Variables
In a production setup, create a `.env` file at the root:
```env
API_BASE_URL=https://api.vms.enterprise.com
```

## Available Mock Users
*   **Admin**: `admin@vms.com` / `password` (Has `ALL` permissions)
*   **Security**: `security@vms.com` / `password` (Has specific scanner and check-in permissions)

## Future Improvements
*   Replace mock repositories with real REST/GraphQL integrations.
*   Implement `redux-persist` for robust state hydration across sessions.
*   Add E2E tests using Detox.
*   Integrate crash reporting (e.g., Sentry) into the centralized `Logger`.
