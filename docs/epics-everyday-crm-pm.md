# Everyday CRM + PM - Epics and User Flows

## EPIC 1 - CRM: Acquisitions & Lead Management (EPIC-CRM-ACQ)

### Goal
Use the CRM app to manage leads, acquisitions, and relationships, and convert closed deals into Properties in the PM app.

### Key User Stories
- As a Lead Manager, I can track inbound leads (sellers, agents, wholesalers) in a pipeline.
- As an Acquisitions Manager, I can log all communication and documents related to a potential property.
- As a COO, I can see a pipeline of potential acquisitions and their current status.
- As an Acquisitions Manager, when a deal is marked as "Closed/Won", I can create a Property record in the PM app.

### User Flow - Acquisition to Property
1. New seller lead is created as a Person/Company + Deal in CRM.
2. Lead Manager updates pipeline stages as the deal progresses.
3. Activities (calls, emails, notes) accumulate on the Deal and related Person/Company.
4. When the deal is closed:
   - User clicks "Create Property in PM".
   - System creates a Property object and optional initial Units in the PM app.
   - CRM deal links to the newly created Property for future reference.

---

## EPIC 2 - PM: Portfolio Overview & Dashboards (EPIC-PM-PORTFOLIO)

### Goal
Provide portfolio-wide and per-property dashboards (rent roll, occupancy, delinquency, maintenance) in the PM app.

### Key User Stories
- As a COO, I can view a PM dashboard summarizing occupancy, rent roll, collected rent, delinquency, and maintenance load.
- As a Property Manager, I can see a property-specific dashboard with units, leases, and work orders.
- As an Investor/Owner (internal view), I can see high-level performance for my properties.

### User Flow - Portfolio Dashboard
1. User switches to the PM app.
2. User visits `/pm/dashboard`.
3. System calls `portfolioSummary(month)`:
   - Aggregates Properties, Units, Leases, LeaseCharges, Payments, WorkOrders.
4. UI displays:
   - KPI tiles (occupancy, rent roll, collected, delinquent).
   - Table of properties and their key metrics.
5. User clicks a property row to navigate to `/pm/property/:propertyId` for deeper detail.

---

## EPIC 3 - PM: Leasing & Occupancy (EPIC-PM-LEASE)

### Goal
Manage units and leases to maintain high occupancy and clear visibility of leasing status.

### Key User Stories
- As a Leasing Specialist, I can see all units and their availability status.
- As a Property Manager, I can see all active leases, upcoming move-ins, and upcoming move-outs.
- As a Leasing Specialist, I can link tenants (People) to leases and units.

### User Flow - Create a New Lease
1. Leasing Specialist opens `/pm/units` and filters to a specific property and vacant unit.
2. Clicks "Create Lease" for that unit.
3. Fills in lease details: start/end, rent amount, deposit, billing day.
4. Selects tenant(s) from existing People or creates new records.
5. System saves the Lease and updates:
   - Unit status to Occupied (or Pending Move-In depending on business rules).
   - Tenant's record to reference the active lease and unit.

---

## EPIC 4 - PM: Maintenance & Work Orders (EPIC-PM-MAINT)

### Goal
Track and manage maintenance tickets efficiently.

### Key User Stories
- As a Maintenance Coordinator, I can see all work orders by status and priority.
- As a Maintenance Coordinator, I can assign work orders to vendors and set schedules.
- As a Property Manager, I can see all open work orders for a specific property.
- As an Executive, I can see which properties generate the most maintenance burden.

### User Flow - Work Order Lifecycle
1. A work order is created (manually now, via resident portal later).
2. Work order is linked to a Property, Unit, and optionally Tenant and Vendor.
3. Maintenance Coordinator updates status:
   - New -> In Review -> Scheduled -> In Progress -> Completed.
4. When completed:
   - Labor and material costs are recorded.
   - Optionally, a charge is created (if billable to tenant).
5. Work order KPIs feed into property and portfolio dashboards.

---

## EPIC 5 - PM: Simple Accounting & Delinquency (EPIC-PM-ACCT)

### Goal
Provide basic PM accounting for rent charges, payments, and delinquency tracking.

### Key User Stories
- As an Accounting user, I can view charges and payments by property and lease.
- As a Property Manager, I can see which tenants are current vs delinquent.
- As a COO, I can see rent roll, collected, and delinquent amounts per property and portfolio.

### User Flow - Monthly Rent Cycle
1. System (or user) generates rent LeaseCharges for all active leases at the start of the month.
2. As payments are received, Payment records are created and applied to charges.
3. System calculates:
   - Rent roll = sum of rent charges.
   - Collected = sum of payments.
   - Delinquent = rent roll - collected.
4. Delinquent metrics feed:
   - PM dashboard.
   - Property dashboard delinquency card.
   - Delinquency views listing leases/tenants with unpaid balances.

---

## EPIC 6 - Vendors & Relationships (EPIC-PM-VENDORS)

### Goal
Use CRM People/Companies as vendors and connect them to PM operations.

### Key User Stories
- As a Property Manager, I can mark certain Companies/People as vendors.
- As a Maintenance Coordinator, I can assign work orders to vendors.
- As an Executive, I can see which vendors handle the most work orders and their performance.

### User Flow - Vendor Assignment
1. CRM user marks a Company as `isVendor = true`.
2. In a Work Order, Maintenance Coordinator selects that vendor as the assignee.
3. Communication and activities with that vendor are logged via CRM.
4. Vendor performance can be summarized via reports (number of WOs, average completion time, etc.).

---

## EPIC 7 - Resident Portal Foundations (EPIC-PORTAL-RESIDENT)

*(Future, but the backend should support it now.)*

### Goal
Allow residents to interact with their leases and maintenance requests via a dedicated portal.

### Key User Stories
- As a Resident, I can log in and see my active lease, unit, and property info.
- As a Resident, I can submit maintenance requests and see status updates.
- As a Resident, I can view my balance and payment history (later: pay rent online).

### User Flow - Resident Login and Maintenance Request
1. Resident receives an invite email with a portal link and token.
2. Resident creates portal credentials.
3. Resident logs in and sees:
   - Lease summary.
   - Maintenance tab.
4. Resident submits a new maintenance request:
   - System creates a WorkOrder linked to their lease's property/unit and Person record.
5. Maintenance Coordinator manages the WorkOrder in the PM app; resident sees status updates.

---

## EPIC 8 - Owner Portal Foundations (EPIC-PORTAL-OWNER)

*(Future, but dashboards and APIs should be designed to support this.)*

### Goal
Allow property owners/investors to view performance, statements, and distributions.

### Key User Stories
- As an Owner, I can log in and see a list of properties I own and my ownership %.
- As an Owner, I can see high-level performance per property.
- As an Owner, I can view monthly or quarterly statements and download them.

### User Flow - Owner Statement Access
1. Owner logs into the portal.
2. Owner selects a property or portfolio.
3. System fetches summarized metrics (income, expenses, NOI, cash flow).
4. Owner can view the statement online and download a PDF/CSV copy.

---

## EPIC 9 - Platform: Big-App Switcher & Routing (EPIC-PLATFORM-APP-SWITCHER)

### Goal
Provide a clean UX separation between CRM and PM inside the same app shell.

### Key User Stories
- As a user, I can choose whether I am in CRM or PM mode.
- As a user, I always see navigation and pages relevant to the current mode.
- As an admin, I can configure roles/permissions by app and within each app.

### User Flow - Switching Apps
1. User logs into Everyday.
2. By default, user lands in CRM app or PM app based on last-used mode or role.
3. User clicks "CRM" or "Property Management" in the global app switcher.
4. Navigation, route namespace, and views update accordingly.
5. User can switch back and forth without losing context in each app.

---
