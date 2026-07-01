# Enterprise Visitor Management System (VMS)

An enterprise-grade Visitor Management System built with React Native and Firebase. It provides front-desk receptionists and security guards with a robust toolset for checking in visitors, issuing digital passes, scanning QR codes, and maintaining audit logs.

## Overview

The VMS application digitizes the physical front-desk experience. It allows hosts to pre-approve visits, receptionists to register walk-ins, and security officers to scan and validate digital passes in real time. It is built strictly on Clean Architecture principles, ensuring that UI components, business rules, and cloud infrastructure are decoupled and maintainable.

## Features

- **Role-Based Access Control (RBAC):** Strict permission segregation across roles (Super Admin, Company Admin, Receptionist, Security Guard, Host, Standard Employee). Permissions dynamically determine UI visibility and access.
- **Visitor Lifecycle Management:** End-to-end tracking of a visit from `PENDING` to `APPROVED`, `CHECKED_IN`, and `CHECKED_OUT`.
- **QR Code Check-In:** Native camera integration using `expo-camera` to scan digital passes and automatically look up active visits.
- **Real-Time Dashboard Analytics:** Aggregates real-time backend statistics for total visitors, upcoming visits, and active check-ins.
- **Offline-First Resilience:** Integrates an `OfflineManager` and Firestore caching to ensure security operations persist during localized network outages.
- **Dynamic Theming:** Deeply integrated Dark/Light mode powered by Redux and React Native Paper semantic tokens.

## Architecture

This project strictly follows **Clean Architecture**:

`UI -> Presentation (Redux) -> Use Cases -> Repositories -> Data Source Interfaces -> Firebase Implementation`

Firebase is entirely isolated in the Infrastructure layer. The application never imports Firebase SDKs directly into UI or Domain logic, allowing for seamless swapping of the backend (e.g., to AWS, Spring Boot, or .NET) in the future.

### Data Modeling

We enforce strict entity separation:
- **Visitor**: A permanent identity (Name, Company, Phone).
- **Visit**: A transactional appointment (Time, Host, Purpose, Status).
- **Visitor Pass**: The digital artifact representing an approved visit (QR Token).

## Technology Stack

| Category | Technology |
|----------|------------|
| **Framework** | React Native (Expo) |
| **Language** | TypeScript |
| **State Management** | Redux Toolkit |
| **UI Components** | React Native Paper |
| **Routing** | React Navigation |
| **Backend** | Firebase (Auth, Firestore) |
| **Hardware** | Vision Camera (`expo-camera`) |

## Project Structure

```
├── App.tsx                     # Application entry and global providers
├── src/
│   ├── app/                    # Redux store configuration
│   ├── components/             # Reusable UI components
│   ├── core/                   # Core utilities (auth, logger, offline, seeders)
│   ├── domain/                 # Business logic, models, and interfaces
│   ├── features/               # Feature-sliced modules (dashboard, visitor, qr)
│   ├── infrastructure/         # External services implementations (Firebase)
│   ├── navigation/             # Routing and Navigation Guards
│   └── theme/                  # Global design tokens and themes
```

## Prerequisites

- Node.js (v18+)
- Expo CLI
- Firebase Project with Firestore and Auth enabled
- iOS Simulator or Android Emulator (or a physical device with Expo Go)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rajeev02/VMS.git
   cd VMS
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Ensure you have a valid Firebase configuration in `src/infrastructure/firebase/init.ts` or via `.env`.

4. **Seed the Database:**
   To populate Firebase with necessary roles, default permissions, and test accounts:
   ```bash
   npm run seed
   ```

5. **Start the application:**
   ```bash
   npx expo start
   ```

## Quick Start & Demo Credentials

To test the different user workflows and RBAC boundaries, the database seeder provisions the following accounts (password for all accounts is `password`):

| Role | Email |
|------|-------|
| Super Admin | `superadmin@vms.com` |
| Company Admin | `companyadmin@vms.com` |
| Receptionist | `receptionist@vms.com` |
| Security Guard | `security@vms.com` |
| Host | `host@vms.com` |
| Standard Employee | `employee@vms.com` |

Log in using `receptionist@vms.com` to test walk-in registrations and approvals. Log in using `security@vms.com` to test QR scanning and physical check-in flows.

## Usage

- **Navigating the Dashboard:** The Home tab displays a real-time summary of visits. Tapping a statistic (e.g., "Pending") immediately filters the Visitors list to show only pending visits.
- **Scanning a Pass:** Use the Scan tab to open the camera. Point it at a generated Visitor Pass QR code. The app will resolve the token to an active Visit and navigate you to the Check-In screen.
- **Changing Themes:** Navigate to the Settings tab to toggle Dark Mode, which instantaneously updates the semantic colors across the application via Redux.

## License

MIT License
