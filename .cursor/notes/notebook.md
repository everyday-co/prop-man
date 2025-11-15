# Project Notebook

## 2025-11-15
- Initialized `.cursor` tools/notes from mycursorrules template.
- Need to assist with Homebrew-based PostgreSQL role setup (ensure `postgres` role exists or create it).
- Confirmed `psql` available via `/opt/homebrew/opt/postgresql@16/bin` after exporting PATH.
- Ran `\du` to verify only `adamjudeh` role existed; created `postgres` superuser role manually.
- Re-ran `\du` to confirm both `adamjudeh` and `postgres` roles are present.
- Switched Node via `nvm use` to v24.5.0 (per `.nvmrc` requirement) and reran `yarn`; install completed with expected peer warnings.
- Added `.cursor` notes/tools scaffolding from mycursorrules template and committed (`chore(cursor): add agent scaffolding`).
- Added remote `prop` (https://github.com/everyday-co/prop-man.git) and pushed `main` after collaborator access granted.
- Redis service managed via Homebrew (`brew services start redis`).
- `npx nx database:reset twenty-server` completed (one flaky-task warning but run succeeded).
- Freed port 3000 by stopping stray `next dev` process from `/Users/adamjudeh/lending-os`; verified `npx nx start twenty-server` serves `/healthz` when run under Node 24.5.0.

### CRM + PM Kickoff Prompt
The full kickoff directive that guides the CRM + PM unification work is captured below for future reference:

```text
You are working inside a fork of the Twenty CRM monorepo.

TECH CONTEXT

- Monorepo: Nx-style, with a React/TypeScript frontend and NestJS backend.

- Twenty is a metadata-driven CRM: objects, fields, relations, views, pipelines, activities, etc.

- We MUST preserve all existing CRM functionality (People, Companies, Pipelines, Activities, etc.) and extend the app with a new Property Management (PM) “big app” that lives alongside CRM.

HIGH-LEVEL PRODUCT VISION

We are building a unified platform for Everyday with two first-class “apps” inside the same codebase:

1) CRM APP (existing Twenty)

   - Manages relationships and pipelines: sellers, buyers, investors, lenders, vendors, agents, tenants (as contacts).

   - Uses People, Companies, Pipelines, Activities, Tasks, Emails, etc.

   - Handles lead intake, acquisitions, vendor onboarding, investor relations, and general deal flow.

2) PROPERTY MANAGEMENT (PM) APP (new)

   - Manages properties, units, leases, tenants, work orders, charges, payments, inventory, and inspections.

   - Provides PM dashboards, delinquency views, rent roll, maintenance views, and (later) owner and resident portals.

   - Re-uses People/Companies as tenants, owners, vendors, etc.

We want a “big app” feel: a top-level app switcher for CRM vs Property Management, separate route groups (/crm/** and /pm/**), and separate navigation, but shared core objects (People, Companies, Activities, etc.).

IMPORTANT PRESERVATION RULES

- DO NOT break or refactor core CRM functionality.

- DO NOT remove or rename CRM routes, objects, or components.

- DO NOT bypass the metadata/custom-object engine (no new raw ORM entities for PM objects unless absolutely necessary).

- We EXTEND the CRM with PM-specific modules, objects, dashboards, and navigation.

CUSTOM OBJECTS (ASSUME THEY ALREADY EXIST IN THE UI)

These are configured via Twenty’s Data Model UI. Do NOT create ORM entities; instead query via metadata/object APIs as existing code does for standard objects.

Assume at minimum the following custom objects and fields:

1) Property

   - name

   - street, city, state, postalCode

   - propertyType (select: SF, Duplex, MF 2–4, MF 5–49, MF 50+)

   - unitCount (number)

   - ownerCompany (relation → Company)

   - status (select: Active, Under Contract, Sold)

   - acquisitionDate (date)

   - acquisitionPrice (currency)

2) Unit

   - unitNumber (text)

   - property (relation → Property)

   - bedrooms, bathrooms (number)

   - squareFeet (number)

   - marketRent (currency)

   - currentRent (currency)

   - status (select: Vacant, Vacant-Ready, Occupied, Notice, Turn, Down)

   - readyDate (date)

   - marketingNotes (long text)

3) Lease

   - property (relation → Property)

   - unit (relation → Unit)

   - tenants (multi-relation → Person)

   - startDate, endDate (date)

   - rentAmount (currency)

   - depositAmount (currency)

   - billingDayOfMonth (number)

   - leaseStatus (select: Application, Approved, Active, Renewal Offered, Renewal Signed, Notice, Ended)

4) WorkOrder

   - title (text)

   - property (relation → Property)

   - unit (relation → Unit)

   - tenant (relation → Person)

   - category (select)

   - priority (select: Low, Normal, High, Emergency)

   - status (select: New, In Review, Scheduled, In Progress, Waiting on Resident, Completed, Canceled)

   - description (long text)

   - requestedAt, scheduledFor, completedAt (datetime)

   - assignedVendor (relation → Company or Person)

   - laborCost, materialsCost, totalCost (currency)

5) LeaseCharge

   - lease (relation → Lease)

   - property (relation → Property)

   - unit (relation → Unit)

   - chargeType (select: Rent, Deposit, Late Fee, Utility, Other)

   - amount (currency)

   - dueDate (date)

   - periodStart, periodEnd (date)

   - status (select: Open, Partially Paid, Paid, Waived)

6) Payment

   - lease (relation → Lease)

   - property (relation → Property)

   - unit (relation → Unit)

   - payer (relation → Person)

   - amount (currency)

   - paymentDate (date/datetime)

   - method (select: ACH, Card, Check, Money Order, Cash, Other)

   - status (select: Pending, Completed, Failed, Refunded)

   - externalReference (text)

Other objects (InventoryItem, Inspection, OwnershipStake, MessageThread, Document) exist but can be wired later.

APP STRUCTURE REQUIREMENTS

1) Big-App Switcher (CRM vs PM)

- Implement a top-level app switcher in the main shell (e.g., top nav).

- Two modes: "CRM" and "Property Management".

- When CRM is active:

  - Use the existing CRM navigation and routes.

  - CRM routes should live under /crm/** (we can alias existing routes where needed but must not break deep links).

- When Property Management is active:

  - Use a separate navigation for PM.

  - All PM routes must live under /pm/**.

Behavior:

- The switcher state should persist across refreshes (localStorage or equivalent is fine).

- Styling must match existing Twenty top-level nav / header patterns.

- When switching modes, the left sidebar and visible routes update accordingly, while the rest of the shell (user menu, theme, etc.) remains consistent.

2) CRM APP (keep intact)

- Preserve and reuse all existing screens for:

  - People (Contacts)

  - Companies (Accounts)

  - Pipelines

  - Activities and timelines

  - Tasks/Projects

- We may later add PM-related links from CRM records (e.g., from a Person record, link to active Lease), but this is additive.

3) PM APP NAVIGATION

Under the "Property Management" app mode, include navigation items for:

- PM Dashboard → /pm/dashboard

- Properties → /pm/properties (object list for Property)

- Units → /pm/units (object list for Unit)

- Leases → /pm/leases (object list for Lease)

- Work Orders → /pm/work-orders (object list for WorkOrder)

- Accounting → /pm/accounting (stub for now; later: Charges/Payments views)

- Inventory & Inspections → /pm/inventory and /pm/inspections (can initially be stubs)

Use the same generic object list / record view components used by Companies/People for Properties, Units, Leases, and WorkOrders, driven by metadata for fields, filters, sorting, and views.

BACKEND TASKS (packages/twenty-server)

Create a new NestJS PM domain module:

- Path: packages/twenty-server/src/app/property-management/

Files to scaffold:

1) property-management.module.ts

   - Import the services and resolvers below.

   - Import whatever shared modules are used to query custom objects (same modules used for generic object querying elsewhere).

   - Export the resolvers.

2) services/rent-roll.service.ts

   - Implement methods:

     - getPropertyRentRoll(propertyId: string, month: string): number

       - Sum LeaseCharges of type Rent for the given property and month.

     - getPropertyCollected(propertyId: string, month: string): number

       - Sum Payments for leases of that property in that month.

     - getPropertyDelinquent(propertyId: string, month: string): number

       - rentRoll - collected, floored at 0.

   - Must use the metadata/custom-object querying API, not raw TypeORM entities.

   - Before implementation, search the repo for how the server queries generic objects (e.g., Company, Person) and reuse patterns.

3) services/delinquency.service.ts

   - Implement methods:

     - getDelinquentLeases(month: string)

       - Return leases with unpaid LeaseCharges past due in that month.

     - getDelinquentByProperty(propertyId: string, month: string)

       - Aggregate open LeaseCharges minus Payments per property.

4) resolvers/property-portfolio.resolver.ts

   - Define GraphQL types:

     type PropertySummary {

       propertyId: ID!

       name: String!

       occupancyPercent: Float!

       openWorkOrderCount: Int!

       monthlyRentRoll: Float!

       monthlyCollected: Float!

       monthlyDelinquent: Float!

     }

     type PortfolioSummary {

       month: String!

       properties: [PropertySummary!]!

     }

   - Extend Query with:

     extend type Query {

       portfolioSummary(month: String!): PortfolioSummary!

       propertyDashboard(propertyId: ID!, month: String!): PropertySummary!

     }

   - Implement resolvers using rent-roll.service and delinquency.service plus generic object queries for:

     - Property → name, unitCount, active leases, work orders, etc.

     - WorkOrder → count open by property.

     - Lease, LeaseCharges, Payments → occupancy and financial numbers.

   - Ensure types are compatible with the existing GraphQL schema and codegen.

FRONTEND TASKS (packages/twenty-frontend)

1) App Switcher (CRM vs PM)

- Add a top-level app switcher in the main layout (header or app bar).

- Implementation:

  - Define a simple "activeApp" state: "CRM" | "PM".

  - Persist this state (localStorage).

  - When activeApp === "CRM":

    - Render existing CRM navigation and CRM route tree (likely under /crm/**).

  - When activeApp === "PM":

    - Render PM-specific navigation and PM route tree under /pm/**.

- Follow existing patterns for navigation configuration; do NOT hardcode styles; reuse existing components.

2) PM Navigation Component

- Under a new module folder:

  packages/twenty-frontend/src/modules/property-management/

- Create:

  - components/PMNavigation.tsx

    - Renders links for:

      - “PM Dashboard” → /pm/dashboard

      - “Properties” → /pm/properties

      - “Units” → /pm/units

      - “Leases” → /pm/leases

      - “Work Orders” → /pm/work-orders

      - “Accounting” → /pm/accounting (stub page)

      - “Inventory” → /pm/inventory (stub page)

      - “Inspections” → /pm/inspections (stub page)

  - Integrate PMNavigation into the main layout when activeApp === "PM".

3) PM Dashboard Page

- Path: /pm/dashboard

- File: src/modules/property-management/pages/PortfolioDashboardPage.tsx

Requirements:

- Use the portfolioSummary(month) GraphQL query.

- For initial implementation, month can default to current month; accept a selector later.

- Show:

  - Portfolio-level KPIs:

    - Total properties

    - Total units

    - Overall occupancy %

    - Total monthly rent roll

    - Total monthly collected

    - Total monthly delinquent

    - Total open work orders

  - A table of PropertySummary rows with:

    - Name

    - Occupancy %

    - Monthly rent roll

    - Monthly collected

    - Monthly delinquent

    - Open work orders

- Use existing card, grid, typography, and table components from other dashboards in the app.

4) Property Dashboard Page

- Path: /pm/property/:propertyId

- File: src/modules/property-management/pages/PropertyDashboardPage.tsx

Requirements:

- Call propertyDashboard(propertyId, month).

- Show:

  - Property name + address

  - Occupancy %

  - Monthly rent roll

  - Monthly collected

  - Monthly delinquent

  - Open work orders count

- Below the KPIs, embed:

  - Unit list: generic object table filtered to Units with property = propertyId.

  - Lease list: generic object table filtered to Leases with property = propertyId.

  - Work Order list: generic object table filtered to WorkOrders with property = propertyId.

- Reuse generic object list components (same as Companies/People) with filters passed via props or route context.

5) Generic Object Views for PM

- Add routes that use the generic object list for:

  - /pm/properties → Property object

  - /pm/units → Unit object

  - /pm/leases → Lease object

  - /pm/work-orders → WorkOrder object

- Ensure:

  - Columns show the most important fields by default (name, property, status, rent, etc.).

  - Filters and search work identically to standard objects.

6) GraphQL Codegen

- Update or extend existing GraphQL query/fragment files to include:

  - portfolioSummary

  - propertyDashboard

- Run the repo’s GraphQL codegen pipeline.

- Use the generated hooks/types in the frontend pages.

GENERAL GUIDELINES

- Before implementing custom-object queries, search the repo for how existing code queries Company/Person/etc using the metadata engine. Mirror those patterns for Property, Unit, Lease, WorkOrder, LeaseCharge, and Payment.

- Keep CRM and PM logically separated at the route and navigation level, but share underlying People/Companies/Activities data.

- Keep code style, folder structure, and component structure consistent with the rest of the project.

- After major changes, run tests and TypeScript builds and fix any errors.

START NOW:

1) Scaffold the backend PM module, services, and resolver with stub implementations.

2) Scaffold the app switcher and PM navigation & routes.

3) Implement the PM dashboard and property dashboard using real data via generic object queries.
```
