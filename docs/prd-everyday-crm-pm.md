# Everyday Platform PRD - Unified CRM & Property Management

## 1. Overview

Everyday is building a unified platform that combines:

- A **CRM app** for relationships, lead management, acquisitions, vendors, investors, and lenders.
- A **Property Management (PM) app** for operating a portfolio: properties, units, tenants, work orders, charges, payments, and reporting.

Both apps run on top of the Twenty CRM engine (React + NestJS, metadata-driven objects) with a shared database and shared core objects (People, Companies, Activities).

The platform should feel like two "big apps" in one:

- **CRM** - oriented around people, deals, and communication.
- **Property Management** - oriented around properties, leases, and operations.

A top-level app switcher controls which module the user is in at any time.

---

## 2. Goals

1. **Unify CRM and PM** into a single system of record.
2. **Preserve and extend Twenty CRM**, not replace it.
3. Provide a **PM experience comparable to AppFolio/Buildium** for:
   - Portfolio overview
   - Leasing and occupancy
   - Maintenance
   - Simple accounting and cash-flow reporting
4. Ensure the platform supports **scaling** to many properties and hundreds of units.
5. Lay a foundation for future **Resident Portal** and **Owner Portal** experiences.

---

## 3. Non-Goals

- Full GAAP/trust-accounting replacement for specialized PM accounting systems.
- Highly customized multi-entity general ledger or tax workflows.
- Complex vendor billing/payables management (beyond basic support).
- Full-featured resident or owner mobile apps (initially web-based portals only, later).

---

## 4. Personas

1. **COO / Director of Operations**
   - Needs a portfolio-wide view of occupancy, rent roll, delinquency, and maintenance.
   - Reviews cash flow, NOI, and property performance.
2. **Lead Manager / Acquisitions**
   - Uses CRM pipelines to manage seller and agent relationships.
   - Converts acquisitions into active Properties and Units in PM.
3. **Property Manager**
   - Manages leases, renewals, delinquency, notices, and communications.
   - Needs dashboards for rent, late payments, and move-ins/move-outs.
4. **Leasing Specialist**
   - Tracks prospects, applications, approvals, and move-ins.
   - Needs clear views of unit availability and leasing status.
5. **Maintenance Coordinator**
   - Manages work orders, vendors, and scheduling.
   - Needs SLA visibility and property/unit context.
6. **Investor / Owner (future portal user)**
   - Wants clear understanding of performance, distributions, and key docs.
7. **Resident / Tenant (future portal user)**
   - Wants to pay rent, view lease, submit maintenance, and message management.

---

## 5. Scope

### In-Scope (MVP)

- **CRM app**:
  - Keep all existing CRM functionality (People, Companies, Pipelines, Activities, Tasks).
  - Add minimal integrations from CRM into PM:
    - Convert acquisition to Property.
    - Link People/Companies to PM entities (tenant, owner, vendor).
- **PM app** (internal web):
  - Property, Unit, Lease, Work Order object management.
  - PM dashboards:
    - Portfolio dashboard (per month / period).
    - Property-specific dashboard.
  - Leasing view: unit status, lease status.
  - Maintenance board: work orders by status, priority, and property.
  - Simple accounting:
    - Lease charges (rent, late fee, utilities).
    - Payments.
    - Basic delinquency metrics and rent-roll.
  - Inventory and inspections (lightweight but structurally in place).
  - Reporting foundation for owner/portfolio cash-flow and NOI.

### Out-of-Scope (for first release)

- Automated bank reconciliation.
- Complex multi-entity trust accounting.
- Detailed CAM reconciliation.
- Highly granular capex project planning (beyond basic tasks and work orders).
- Mobile-specific UX.

---

## 6. System Overview

### 6.1 Big-App Separation

- **CRM App**
  - Route namespace: `/crm/**`
  - Navigation:
    - Companies
    - People
    - Pipelines
    - Activities
    - Tasks/Projects
  - Data focus: People, Companies, Pipelines, Activities, generic CRM objects.
- **PM App**
  - Route namespace: `/pm/**`
  - Navigation:
    - PM Dashboard
    - Properties
    - Units
    - Leases
    - Work Orders
    - Accounting (Charges/Payments)
    - Inventory
    - Inspections
  - Data focus: Property, Unit, Lease, WorkOrder, LeaseCharge, Payment, InventoryItem, Inspection.

The top-level app switcher controls which module is active and which navigation/route tree is visible.

---

## 7. Data Model (High-Level)

### Core Shared Objects (existing)

- **Person (Contact)**: tenants, vendors, agents, owners, lenders, etc.
- **Company (Account)**: ownership entities, banks, vendors, brokerages, PM entities.
- **Activity**: emails, calls, notes, tasks, timeline events.
- **Pipeline/Deal**: acquisition/opportunity tracking.

### Property Management Objects (custom)

- **Property**
  - A physical property.
  - Related to: Units, Leases, WorkOrders, LedgerLines, Owner stakes.
- **Unit**
  - A rentable unit (apartment, house, space).
  - Related to: Property, Leases, WorkOrders, InventoryItems.
- **Lease**
  - Agreement between tenants and owner.
  - Related to: Property, Unit, Person (Tenants), LeaseCharges, Payments.
- **WorkOrder**
  - Maintenance or service ticket.
  - Related to: Property, Unit, Tenant, Vendor.
- **LeaseCharge**
  - Individual billed item (rent, late fee, utility).
  - Related to: Lease, Property, Unit.
- **Payment**
  - Recorded payment toward LeaseCharges.
  - Related to: Lease, Property, Unit, Payer (Person).
- **InventoryItem / Inspection**
  - Support unit-level inventory and inspections.
- **OwnershipStake**
  - Links Company (owner) to Property with ownership percentage and terms.

---

## 8. Key Functional Requirements

### 8.1 CRM App

- Maintain all existing CRM features.
- Allow marking People/Companies with roles: `isTenant`, `isOwner`, `isVendor`, etc.
- Allow acquisitions pipeline stages to create a Property record on close.
- Allow vendors to be linked to WorkOrders and properties.

### 8.2 PM App - Navigation & Dashboard

- PM Dashboard:
  - KPIs: total properties, units, occupancy %, rent roll, collected, delinquent, open work orders.
  - Per-property summary rows.
- Property Dashboard:
  - KPIs for a single property.
  - Subviews:
    - Units (filtered).
    - Leases (filtered).
    - Work Orders (filtered).

### 8.3 Leasing & Occupancy

- Table views for Units with:
  - Property, unit number, beds/baths, rent, status, ready date.
- Table views for Leases with:
  - Property, unit, tenants, rentAmount, leaseStatus, start/end dates.
- Ability to track:
  - Vacant vs occupied units.
  - Upcoming move-ins/move-outs.

### 8.4 Maintenance

- Work order list and board:
  - Filter by property, priority, status.
- Ability to:
  - Create/assign work orders.
  - Update status and track timestamps.
  - Attach tenants and vendors.
  - Capture basic cost information.

### 8.5 Accounting & Delinquency (Simple)

- Automatically or manually create monthly rent charges for active leases.
- Record payments and mark charges as paid/partially paid.
- Compute:
  - Rent roll per property and portfolio.
  - Collected and delinquent amounts.
- Provide delinquency views by:
  - Property.
  - Lease/tenant.

### 8.6 Reporting & Owner Statements

- Provide data structures that support:
  - Per-property operating income, expenses, and NOI over time.
  - Cash-flow style views with beginning/ending cash per period.
- MVP: internal dashboards with the ability to export to CSV or PDF-compatible formats.

---

## 9. Non-Functional Requirements

- **Performance:** Portfolio dashboard must load within 2-3 seconds for up to ~50 properties and several hundred units.
- **Security:** Role-based access control (e.g., maintenance users cannot see financials; accounting cannot modify pipeline stages, etc.).
- **Auditability:** Key financial changes (charges/payments) should be trackable via activities or logs.
- **Extensibility:** Design PM module to support future Resident/Owner portals without rewriting core logic.

---

## 10. Milestones & Phasing

### Phase 1 - Foundations

- Implement big-app switcher (CRM vs PM).
- Implement PM navigation.
- Expose Property, Unit, Lease, WorkOrder as first-class objects in PM app.
- Create basic PM and Property dashboards with mocked or minimal data.

### Phase 2 - Leasing & Maintenance

- Complete Unit and Lease list/detail views.
- Complete WorkOrder list/board and workflows.
- Connect People/Companies to Leases and WorkOrders.

### Phase 3 - Accounting & Reporting

- Implement LeaseCharge and Payment flows.
- Implement rent-roll, delinquency, and simple cash-flow metrics.
- Build portfolio/property dashboards backed by real data.

### Phase 4 - Owner/Resident Portal Foundations

- Expose secure APIs for read-only owner/tenant views.
- Prototype internal owner/tenant statement pages.

---
