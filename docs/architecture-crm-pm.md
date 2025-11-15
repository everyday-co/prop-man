# Everyday CRM + PM Architecture

## 1. Platform Topology
- **Single Nx monorepo** with shared tooling, linting, testing, and GraphQL schema.
- Two application experiences live in the same React + NestJS runtime:
  - **CRM App** (existing) for relationships, deals, pipelines, communications.
  - **Property Management (PM) App** (new) for properties, units, leases, maintenance, accounting, and future portals.
- Core metadata objects (People, Companies, Activities, custom objects) remain global and reusable.

## 2. Route Namespaces & Navigation
- **CRM namespace:** existing routes continue to function, and every page is mirrored under `/crm/**` to support deep links and future redirect strategy.
- **PM namespace:** all property-management pages live under `/pm/**` (dashboard, properties, units, leases, work orders, accounting, inventory, inspections).
- **Top-level app switcher:**
  - Lives in the shared shell header.
  - Toggles `activeApp = 'CRM' | 'PM'` which drives which navigation tree and route set render.
  - State is persisted (localStorage today, user preference service later) and auto-inferrable from URL segments.
- **Sidebar composition:**
  - CRM mode renders existing CRM nav groups.
  - PM mode mounts `PMNavigation` with the dedicated destinations listed above.

## 3. Frontend Module Boundaries
- New code lives in `packages/twenty-front/src/modules/property-management/`:
  - `components/` (navigation, shared KPIs, charts, filters).
  - `pages/` (PortfolioDashboardPage, PropertyDashboardPage, stubbed Accounting/Inventory/Inspections pages).
  - `routes.tsx` extends the global router with `/pm/**` entries.
- Shared primitives (cards, tables, metadata-driven object views) remain in shared UI libs; PM pages pass metadata keys (Property, Unit, Lease, WorkOrder) plus default column configurations.
- GraphQL hooks for PM live alongside existing generated hooks; documents sit near other gql definitions and reuse fragments for property/lease summaries.

## 4. Backend Module Boundaries
- New NestJS module at `packages/twenty-server/src/app/property-management/`:
  - `property-management.module.ts` wires services and resolvers.
  - `services/rent-roll.service.ts` encapsulates rent roll, collection, delinquency math using metadata querying clients.
  - `services/delinquency.service.ts` surfaces delinquent leases and per-property aggregations.
  - `resolvers/property-portfolio.resolver.ts` exposes GraphQL queries `portfolioSummary` and `propertyDashboard` plus supporting types.
- Module imports the existing metadata/object-record services so no new ORM entities are introduced; all access respects workspace/tenant context and role guards.

## 5. Data Flow Overview
1. **Frontend:** PM dashboards invoke typed GraphQL hooks (e.g., `useGetPortfolioSummaryQuery`).
2. **GraphQL Resolver:** `portfolioSummary` validates month input, resolves the current workspace, and orchestrates service calls.
3. **Services:**
   - Fetch object records via metadata APIs (Properties, Units, Leases, LeaseCharges, Payments, WorkOrders).
   - Compute KPIs (occupancy %, rent roll, collected, delinquent, open work orders) per property.
4. **Response:** Aggregated `PortfolioSummary` and `PropertySummary` objects feed dashboards, tables, and charts.

## 6. Extensibility Considerations
- **Period handling:** Month string in `YYYY-MM` today; services designed to accept start/end dates for future quarters/custom ranges.
- **Role-aware UX:** Active app default and navigation visibility will later be tied to roles/permissions to support PM-only or CRM-only users.
- **Portals:** Same services can power upcoming resident/owner portals by reusing the property summaries and delinquency aggregates.
- **Reporting:** Rent-roll and delinquency services are intentionally domain-centric for reuse in CSV/PDF export jobs, webhook automation, and owner statements.

## 7. Key Guardrails
- Do not refactor or break existing CRM experiences; wrap additions in feature flags if necessary.
- Always respect workspace (tenant) boundaries when querying data.
- Prefer metadata-driven object lists and forms rather than bespoke pages; PM objects should look and behave like first-class metadata objects.
- Keep new files under 500 LOC and favor reusable hooks/components for shared PM UI patterns.
