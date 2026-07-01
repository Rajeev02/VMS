# Enterprise Visitor Management System (VMS)

An enterprise-grade Visitor Management System built with React Native and Firebase.

## Architecture Overview
This project strictly follows Clean Architecture:
`UI -> Presentation -> Use Cases -> Repositories -> Data Source Interfaces -> Firebase Data Sources`

Firebase is isolated in the Infrastructure layer. The application never imports Firebase SDKs directly into UI or Domain logic, allowing seamless swapping of the backend (e.g., to AWS, Spring Boot, or .NET) in the future.

## Offline First Architecture
We utilize Firestore Offline Persistence and a custom `OfflineManager/SyncQueue` to ensure Front Desk Security operations continue uninterrupted during network outages.

## Architecture Decisions

1. **Strict Entity Separation (Visitor, Visit, Visitor Pass)**
   - *Why?* A Visitor is a permanent identity. A Visit is a transactional appointment. A Visitor Pass is the digital artifact. Separating these prevents duplication of PII and provides a clean audit history per visitor.
2. **Repository Pattern & Abstracted Firebase**
   - *Why?* Enterprise applications require vendor neutrality. Wrapping Firebase behind interfaces ensures UI and Business Logic are completely unaware of the cloud provider.
3. **Offline First**
   - *Why?* Security gates and front desks often experience connectivity issues. The system must never block physical check-in.
4. **Trade-offs for Interview Assignment**
   - We utilize Mock Services for SMS and WhatsApp delivery. Cloud Functions are prepared for architecture but mock-executed locally.

## Future Roadmap

The following enterprise modules are architecturally planned but excluded from the core Visitor Lifecycle for this phase:
- Contractor Management
- Vendor & Delivery Management
- Vehicle & Parking Management
- Badge Printing (NFC/RFID)
- Face Recognition & AI OCR
- Enterprise SSO & Multi-Tenant Support
- Advanced Analytics & Reporting
- Smart Access Control & Calendar Integrations
- Enterprise Workflow Engine
