# Roles, Workflows, and Access Control

The Visitor Management System (VMS) operates on a strict Role-Based Access Control (RBAC) engine. This document outlines every role in the system, their specific feature access, and their standard operational workflows.

---

## 1. Receptionist

**Role Summary:** The primary operator at the front desk. Responsible for managing walk-ins, overseeing the daily calendar of visits, and intervening when manual approvals are required.

**Feature Access (Permissions):**
- ✅ `VIEW_ALL_VISITORS` (Can see all past, active, and upcoming visits across the company)
- ✅ `REGISTER_WALK_IN` (Can manually register a new visitor without an invite)
- ✅ `CREATE_PRE_APPROVED` (Can pre-approve VIPs or expected guests)
- ✅ `CHECK_IN` & `CHECK_OUT` (Can manually check visitors in/out if the QR scanner is down)
- ❌ Cannot manage users or system settings.

**Standard Workflow:**
1. Log in to the dashboard to view "Today's Visits" and "Pending" arrivals.
2. When a walk-in visitor arrives, navigate to the `CreateVisitor` flow to register their details and capture their photo.
3. If an employee submits a pending visit request, review it on the `VisitorDetailsScreen` and press **Approve**.
4. Check out visitors manually at the end of the day if they forgot to scan out.

---

## 2. Security Guard

**Role Summary:** The physical gatekeeper of the building. Needs rapid, frictionless tools to verify identities and execute check-ins/check-outs without navigating complex dashboards.

**Feature Access (Permissions):**
- ✅ `SCAN_QR` (Access to the hardware camera integration)
- ✅ `CHECK_IN` & `CHECK_OUT` (Execute physical entry/exit state mutations)
- ✅ `REGISTER_WALK_IN` (Register delivery drivers or sudden arrivals)
- ✅ `VIEW_ALL_VISITORS` (To verify watchlists or active building occupancy)
- ✅ `MANUAL_VERIFY` (Can physically verify ID cards against the digital pass)

**Standard Workflow:**
1. Remain on the **Scan** tab holding the device.
2. When a visitor presents their digital QR pass, scan it.
3. The app instantly routes to the `VisitorDetailsScreen` and loads the Visit data.
4. Verify the visitor's face against the digital photo.
5. Press **Check In**. The system automatically logs the audit timestamp and updates the building occupancy.
6. When the visitor leaves, scan the pass again and press **Check Out**.

---

## 3. Host / Standard Employee

**Role Summary:** Employees of the company who are expecting guests. 

**Feature Access (Permissions):**
- ✅ `VIEW_OWN_VISITORS` (Can ONLY see visits where they are listed as the `hostId`)
- ✅ `CREATE_PRE_APPROVED` (Only for Hosts: Can send an invite to an expected guest)
- ❌ Cannot approve walk-ins.
- ❌ Cannot scan QR codes.
- ❌ Cannot check visitors into the physical building.

**Standard Workflow (Host):**
1. Log in to see a dashboard filtered solely to their own upcoming meetings.
2. Tap the **+** button to pre-register an expected guest (e.g., an interview candidate).
3. The system generates a digital pass and (simulated) emails it to the guest.
4. Receive a push notification when the Security Guard checks their guest into the lobby.

---

## 4. Company Admin

**Role Summary:** The IT or Operations manager for a specific tenant/company using the VMS.

**Feature Access (Permissions):**
- ✅ `VIEW_ALL_VISITORS`
- ✅ `MANAGE_USERS` (Can invite new Receptionists or Security Guards to the platform)
- ✅ All Receptionist features (`CREATE_PRE_APPROVED`, `CHECK_IN`, `CHECK_OUT`)

**Standard Workflow:**
1. Monitor the overall dashboard to ensure building capacity isn't exceeded.
2. Navigate to the Users/Employees list to provision accounts for new hires.
3. Audit the timeline logs on the `VisitorDetailsScreen` to investigate security incidents.

---

## 5. Super Admin

**Role Summary:** The system provider or global IT administrator.

**Feature Access (Permissions):**
- ✅ `ALL` (Bypasses all permission guards. Has unrestricted access to every tenant and every feature).

**Standard Workflow:**
- Rarely logs into the mobile application.
- Used primarily to provision new `Company Admin` accounts when a new organization purchases the VMS software.
- Can access global debug tools and system-wide audit logs.

---

## Technical Implementation Notes

The UI dynamically adapts to these roles. For instance, the **Approve** button on a `PENDING` visit is wrapped in a permission guard:

```tsx
<PermissionGuard permission={Permissions.CREATE_PRE_APPROVED}>
  <SecondaryButton title="Approve" onPress={() => handleUpdateStatus(VisitStatus.APPROVED)} />
</PermissionGuard>
```
If a `Security Guard` views a pending visit, they will not see the Approve button, but they will see the `Check In` button once it is approved. If a `Standard Employee` logs in, the `DashboardRepository` ensures their stats only reflect visits tied to their specific `hostId`.
