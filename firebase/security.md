# Security Architecture & Rules

This project adheres to Firebase security best practices and the Principle of Least Privilege.

## 1. Authentication Strategy
Only **Employees** authenticate (Admin, Host, Security). Visitors do not have accounts and do not authenticate.
Employee roles dictate system permissions.

## 2. Firestore Security Rules
- **Global**: `request.auth != null` is required for almost all operations.
- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: Full read/write access to all collections.
  - `SECURITY`: Read/write access to `visitors`, `visits`, `visitor_passes`.
  - `HOST`: Read/write access *only* to `visits` where `hostId == request.auth.uid`.

## 3. Data Protection
- **No Sensitive Logs**: Passwords or raw PII are never logged to Cloud Functions or Audit Logs.
- **Protected Collections**: Internal collections (`users`, `settings`, `permissions`) are strictly restricted to Admins.
- **Visitor Passes**: The public `visitor_passes` URLs are served by Firebase Hosting and Cloud Functions, preventing direct Firestore exposure to unauthenticated web clients.

## 4. Storage Security
- Visitor photos and Government IDs are stored in paths like `/visitors/{visitorId}/`.
- Read/write access requires an authenticated Employee token. Public anonymous reads are blocked.
