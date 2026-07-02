# Roles & Business Workflows

The Enterprise Visitor Management System (VMS) utilizes strict Role-Based Access Control (RBAC). The application dynamically restricts UI capabilities and workflows based on the active user's role.

---

## 1. Personas & Roles

### A. Security Guard (`ROLE_GUARD`)
Stationed at entry points (main gate) and internal checkpoints (e.g., Executive Floor).
- **Core Duties**: Scan QR passes, verify identities, register walk-in guests, enforce access control.
- **Capabilities**:
  - `ProcessCheckInUseCase`: Mark a visitor as entered.
  - `ProcessCheckOutUseCase`: Mark a visitor as exited.
  - `VerifyCheckpointUseCase`: Scan a pass for internal movement tracking.
  - `RegisterWalkInVisitorUseCase`: Register unexpected guests (creates a `PENDING` visit).

### B. Host / Employee (`ROLE_HOST`)
The internal employee responsible for the visitor.
- **Core Duties**: Pre-register expected guests, approve/reject walk-in guests.
- **Capabilities**:
  - `RegisterWalkInVisitorUseCase` (Pre-Approval): Creates an `APPROVED` visit and instantly generates a QR pass.
  - `ProcessApprovalUseCase`: Review and approve/reject pending walk-in requests.

### C. Receptionist / Admin (`ROLE_RECEPTIONIST`)
Front-desk administration and compliance monitoring.
- **Core Duties**: Oversee all visitor traffic, generate audit reports, handle edge cases.
- **Capabilities**:
  - All Guard capabilities.
  - `GetDashboardStatsUseCase`: View live metrics (Expected, Active, Completed).
  - `GenerateVisitorReportUseCase` / `ExportAuditLogsUseCase`: Export compliance CSVs.
  - Manual override of approvals and check-ins.

---

## 2. Standard Workflows

### Workflow 1: Pre-Registration (Fast Track)
1. **Host** logs into the VMS and fills out the visitor details.
2. The `RegisterWalkInVisitorUseCase` detects the `Host` role and automatically sets the visit to `APPROVED`.
3. A `VisitorPass` is instantly generated with a secure QR token and a specific validity window.
4. The system emails/texts the QR pass to the guest.
5. The guest arrives, shows the QR code.
6. **Guard** scans the code. The system locks the transaction and sets the visit to `CHECKED_IN`.

### Workflow 2: Walk-In Registration (Requires Approval)
1. Guest arrives unannounced.
2. **Guard** or **Receptionist** registers the visitor on a tablet.
3. The `RegisterWalkInVisitorUseCase` detects the non-host role and sets the visit to `PENDING`. No pass is generated.
4. A notification is sent to the target **Host**.
5. The **Host** reviews the request on their Dashboard and taps "Approve".
6. The `ProcessApprovalUseCase` executes, moving the status to `APPROVED` and dynamically generating the QR pass.
7. The Guard can now scan the newly generated pass or manually check them in.

### Workflow 3: Multi-Gate Checkpoints
1. An already `CHECKED_IN` visitor attempts to enter a restricted area (e.g., Data Center).
2. The internal **Guard** scans their QR pass using `VerifyCheckpointUseCase`.
3. The system validates that the pass is active and logs the location access in `checkpoint_logs`.
4. The overall Visit status remains `CHECKED_IN`.

### Workflow 4: Check-Out & Expiration
1. The visitor leaves the building and the **Guard** scans their pass.
2. The `ProcessCheckOutUseCase` executes.
3. The Visit status is updated to `COMPLETED`.
4. The VisitorPass status is permanently updated to `EXPIRED`. 
5. Any future attempts to scan this QR code will instantly return an `INVALID` warning to the scanner.
