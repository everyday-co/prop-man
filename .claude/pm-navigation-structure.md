# Property Management Navigation Structure

## Overview

The PM navigation sidebar has been redesigned with a categorized, phased approach that aligns with the [PM Operating System Roadmap](pm-operating-system-roadmap.md). This structure provides clear visual hierarchy and communicates the implementation roadmap to users.

## Navigation Categories

### 1. **Dashboard** (Standalone)
- **Portfolio** - Main PM dashboard with portfolio-level metrics
  - Route: `/pm/dashboard`
  - Status: ✅ Implemented

### 2. **Core Data** (Foundation - Already Built)
These are the fundamental objects that drive the entire PM system:

- **Properties** - Building/property records
  - Route: `/objects/properties`
  - Icon: IconBuildingSkyscraper
  - Status: ✅ Implemented

- **Units** - Individual rental units within properties
  - Route: `/objects/units`
  - Icon: IconHome
  - Status: ✅ Implemented

- **Leases** - Tenant lease agreements
  - Route: `/objects/leases`
  - Icon: IconFileText
  - Status: ✅ Implemented

### 3. **Financial** (Phase 1 - Immediate Priority)
Financial operations are the #1 priority for property managers:

- **Rent Roll** 🔜 Soon
  - Automated rent collection tracking
  - Delinquency workflows with escalation
  - Icon: IconMoneybag

- **Payments** 🔜 Soon
  - Payment processing and tracking
  - ACH/credit card integration
  - Icon: IconCreditCard

- **Accounting** ✅ Implemented
  - Route: `/pm/accounting`
  - Chart of accounts, P&L, balance sheet
  - Icon: IconCoins

- **Reports** 🔜 Soon
  - Financial reports (rent roll, P&L, cash flow)
  - Investor-ready statements
  - Icon: IconChartBar

### 4. **Operations** (Phase 2)
Day-to-day property operations:

- **Work Orders** ✅ Implemented
  - Route: `/objects/workOrders`
  - Maintenance request tracking
  - Icon: IconTool

- **Inspections** ✅ Implemented
  - Route: `/pm/inspections`
  - Move-in/move-out inspections
  - Icon: IconListCheck

- **Maintenance** 🔜 Soon
  - Preventive maintenance scheduling
  - Recurring maintenance tasks
  - Icon: IconCalendar

- **Inventory** ✅ Implemented
  - Route: `/pm/inventory`
  - Property inventory management
  - Icon: IconBox

### 5. **Tenant & Leasing** (Phase 2)
Tenant lifecycle management:

- **Applications** 🔜 Soon
  - Tenant applications
  - Screening and approval workflows
  - Icon: IconNotes

- **Tenants** 🔜 Soon
  - Tenant directory (links to People filtered by tenant role)
  - Tenant communication hub
  - Icon: IconUsers

- **Showings** 🔜 Soon
  - Property showing scheduling
  - Prospect tracking
  - Icon: IconKey

### 6. **Insights** (Phase 3 - Future)
AI-powered intelligence and analytics:

- **Performance** 🔜 Soon
  - Portfolio performance metrics
  - Property-level KPIs
  - Icon: IconGauge

- **Forecasting** 🔜 Soon
  - Cash flow projections
  - Vacancy predictions
  - Market rent analysis
  - Icon: IconTarget

## Technical Implementation

### File Location
- [packages/twenty-front/src/modules/property-management/components/PMNavigation.tsx](../../packages/twenty-front/src/modules/property-management/components/PMNavigation.tsx)

### Component Structure

```typescript
type NavItem = {
  label: string;
  Icon: IconComponent;
  to?: string;      // Optional - missing for "soon" items
  soon?: boolean;   // Renders "Soon" pill and disables interaction
};
```

### Navigation Sections

Each section uses Twenty's built-in components:

- `NavigationDrawerSection` - Provides spacing and structure
- `NavigationDrawerSectionTitle` - Category headers ("Core Data", "Financial", etc.)
- `NavigationDrawerItem` - Individual navigation links

### Route Mapping

- **Generic Object Routes**: `/objects/:objectNamePlural` (Properties, Units, Leases, Work Orders)
- **Custom PM Routes**: `/pm/:pageName` (Dashboard, Accounting, Inventory, Inspections)
- **Soon Items**: No route defined, rendered with `soon` prop

### Icons Used

All icons from `twenty-ui/display`:

- **Data**: IconBuildingSkyscraper, IconHome, IconFileText
- **Financial**: IconMoneybag, IconCreditCard, IconCoins, IconChartBar
- **Operations**: IconTool, IconListCheck, IconCalendar, IconBox
- **Tenancy**: IconNotes, IconUsers, IconKey
- **Analytics**: IconGauge, IconTarget
- **Dashboard**: IconLayoutDashboard

## Alignment with Roadmap

This navigation structure directly maps to the phased rollout plan:

### Phase 1 (Months 1-2): Financial Core
Focus on **Financial** section:
1. Rent Roll automation ← Priority #1
2. Payment tracking
3. Financial reporting
4. Lease charge templates

### Phase 2 (Months 3-4): Operations
Complete **Operations** and **Tenant & Leasing** sections:
1. Work order workflows
2. Maintenance scheduling
3. Lease lifecycle management
4. Tenant applications and screening

### Phase 3 (Months 5-6): Intelligence
Build out **Insights** section:
1. Performance dashboards
2. Financial forecasting
3. Vacancy predictions
4. Market analysis

## User Experience

### Visual Hierarchy

1. **Dashboard** stands alone at the top (most frequently accessed)
2. **Core Data** grouped together (foundation objects)
3. **Financial** emphasized as Phase 1 priority
4. **Operations** and **Tenant & Leasing** for day-to-day work
5. **Insights** for strategic decision-making

### "Soon" Indicator

Items marked with `soon: true` display:
- Grayed out text
- "Soon" pill badge
- No hover effect
- Non-clickable (disabled)

This communicates the roadmap to users while showing the vision for the complete system.

### Responsive Design

- Collapsed state (desktop): Icons only with tooltips
- Expanded state (desktop): Full labels with section headers
- Mobile: Full labels, auto-collapse after navigation

## Next Steps

To implement a "Soon" feature, update the navigation:

1. Remove `soon: true` from the item definition
2. Add `to: getAppPath(...)` with the appropriate route
3. Implement the corresponding page component
4. Add the route to `useCreateAppRouter.tsx`

Example:

```typescript
// Before
{
  label: 'Rent Roll',
  Icon: IconMoneybag,
  soon: true,
}

// After
{
  label: 'Rent Roll',
  to: getAppPath(AppPath.PmRentRoll),
  Icon: IconMoneybag,
}
```

Then add the route constant and page:
1. Add `PmRentRoll = '/pm/rent-roll'` to `AppPath` enum
2. Create `RentRollPage.tsx` in `modules/property-management/pages/`
3. Register route in `useCreateAppRouter.tsx`
