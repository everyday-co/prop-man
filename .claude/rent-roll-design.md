# Rent Roll Feature Design

## Overview

The Rent Roll is the central financial tracking system for property management. It shows all active leases, expected rent charges, actual payments received, and outstanding balances. This is the #1 requested feature by property managers.

## User Stories

1. **As a property manager**, I want to see all my rent charges for the current month so I can track expected income
2. **As a property manager**, I want to record tenant payments so I can update balances
3. **As a property manager**, I want to see which tenants are delinquent so I can follow up
4. **As a property manager**, I want to automatically generate monthly rent charges so I don't have to manually create them
5. **As a property manager**, I want to see payment history for each lease so I can audit tenant accounts

## Data Model

### RentCharge Object
Represents a scheduled rent charge for a lease period.

**Fields:**
- `lease` (Relation → Lease) - The lease this charge applies to
- `property` (Relation → Property) - Denormalized for reporting
- `unit` (Relation → Unit) - Denormalized for reporting
- `tenant` (Relation → Person) - Primary tenant (denormalized)
- `chargeDate` (Date) - When the charge is due
- `chargeType` (Select) - "Rent", "Late Fee", "Utility", "Other"
- `amount` (Currency) - Charge amount
- `dueDate` (Date) - Payment due date
- `description` (Text) - Optional description
- `status` (Select) - "Scheduled", "Billed", "Paid", "Partial", "Overdue", "Waived"
- `balanceRemaining` (Currency) - Amount still owed (calculated)
- `memo` (Text) - Internal notes

**Relations:**
- `lease` → Lease (Many-to-One)
- `property` → Property (Many-to-One)
- `unit` → Unit (Many-to-One)
- `tenant` → Person (Many-to-One)
- `payments` → Payment (One-to-Many)

**Calculated Fields:**
- `balanceRemaining` = `amount` - SUM(payments.amount)
- `status` = Auto-updated based on payments and dates

### Payment Object
Represents an actual payment received from a tenant.

**Fields:**
- `rentCharge` (Relation → RentCharge) - The charge this payment applies to
- `lease` (Relation → Lease) - Denormalized for reporting
- `property` (Relation → Property) - Denormalized for reporting
- `tenant` (Relation → Person) - Who paid
- `paymentDate` (Date) - When payment was received
- `amount` (Currency) - Payment amount
- `paymentMethod` (Select) - "Check", "ACH", "Credit Card", "Cash", "Money Order", "Wire", "Other"
- `referenceNumber` (Text) - Check number, transaction ID, etc.
- `memo` (Text) - Internal notes
- `status` (Select) - "Pending", "Cleared", "Bounced", "Reversed"

**Relations:**
- `rentCharge` → RentCharge (Many-to-One)
- `lease` → Lease (Many-to-One)
- `property` → Property (Many-to-One)
- `tenant` → Person (Many-to-One)

## Backend Implementation

### GraphQL Schema Extension

**Custom Queries:**
```graphql
type Query {
  # Get rent roll for a date range (default: current month)
  pmRentRoll(
    startDate: DateTime
    endDate: DateTime
    propertyId: ID
    status: [String!]
  ): PMRentRollResponse!

  # Get detailed payment history for a lease
  pmLeasePaymentHistory(
    leaseId: ID!
  ): PMLeasePaymentHistoryResponse!

  # Get delinquency report
  pmDelinquencyReport(
    daysOverdue: Int
  ): PMDelinquencyReportResponse!
}

type PMRentRollResponse {
  charges: [RentChargeWithPayments!]!
  summary: RentRollSummary!
}

type RentChargeWithPayments {
  id: ID!
  lease: Lease!
  property: Property!
  unit: Unit!
  tenant: Person!
  chargeDate: DateTime!
  dueDate: DateTime!
  amount: Float!
  balanceRemaining: Float!
  status: String!
  payments: [Payment!]!
  daysOverdue: Int
}

type RentRollSummary {
  totalCharges: Float!
  totalPaid: Float!
  totalOutstanding: Float!
  chargesCount: Int!
  paidCount: Int!
  overdueCount: Int!
}

type PMLeasePaymentHistoryResponse {
  charges: [RentChargeWithPayments!]!
  totalCharged: Float!
  totalPaid: Float!
  currentBalance: Float!
}

type PMDelinquencyReportResponse {
  delinquentCharges: [RentChargeWithPayments!]!
  totalOverdue: Float!
  affectedTenants: Int!
  affectedProperties: Int!
}
```

**Custom Mutations:**
```graphql
type Mutation {
  # Generate rent charges for a month (bulk operation)
  pmGenerateMonthlyRentCharges(
    month: String! # "2025-12"
    propertyIds: [ID!] # Optional filter
  ): PMGenerateRentChargesResponse!

  # Record a payment
  pmRecordPayment(
    input: PMRecordPaymentInput!
  ): Payment!

  # Apply payment to multiple charges (partial payments)
  pmApplyPaymentToCharges(
    paymentId: ID!
    allocations: [PaymentAllocation!]!
  ): [RentCharge!]!
}

type PMGenerateRentChargesResponse {
  chargesCreated: Int!
  charges: [RentCharge!]!
  errors: [String!]!
}

input PMRecordPaymentInput {
  rentChargeId: ID!
  amount: Float!
  paymentDate: DateTime!
  paymentMethod: String!
  referenceNumber: String
  memo: String
}

input PaymentAllocation {
  rentChargeId: ID!
  amount: Float!
}
```

### Backend Services

**Location:** `packages/twenty-server/src/app/property-management/services/`

1. **rent-roll.service.ts** - Business logic for rent roll queries
   - `getRentRoll(filters)` - Get rent roll data
   - `getLeasePaymentHistory(leaseId)` - Get payment history
   - `getDelinquencyReport(daysOverdue)` - Get overdue charges

2. **rent-charge-generator.service.ts** - Charge generation logic
   - `generateMonthlyCharges(month, propertyIds)` - Bulk generate charges
   - `calculateNextChargeDate(lease)` - Calculate next charge
   - `getActiveLeases(propertyIds)` - Get leases that need charges

3. **payment-processor.service.ts** - Payment processing
   - `recordPayment(input)` - Record a payment
   - `applyPaymentToCharges(paymentId, allocations)` - Split payment
   - `updateChargeStatus(rentChargeId)` - Auto-update status

**Location:** `packages/twenty-server/src/app/property-management/resolvers/`

1. **rent-roll.resolver.ts** - GraphQL resolver
2. **payment.resolver.ts** - Payment mutations resolver

## Frontend Implementation

### Rent Roll Page

**Location:** `packages/twenty-front/src/modules/property-management/pages/RentRollPage.tsx`

**Components:**
- Main table with rent charges
- Filters (date range, property, status)
- Summary cards (total charges, paid, outstanding, overdue)
- Quick actions (generate charges, record payment)

**Table Columns:**
1. Property
2. Unit
3. Tenant
4. Charge Date
5. Due Date
6. Amount
7. Paid
8. Balance
9. Status
10. Days Overdue (if applicable)
11. Actions (record payment, view details)

**Features:**
- Sort by any column
- Filter by property, status, date range
- Color coding:
  - 🟢 Green: Paid in full
  - 🟡 Yellow: Partial payment
  - 🔴 Red: Overdue (past due date)
  - ⚪ Gray: Scheduled (not yet due)
- Bulk actions:
  - Generate monthly charges
  - Export to CSV
  - Mark as paid (batch)

### Payment Recording Modal

**Component:** `RecordPaymentModal.tsx`

**Fields:**
- Tenant (read-only from charge)
- Amount (default: balance remaining)
- Payment Date (default: today)
- Payment Method (dropdown)
- Reference Number (optional)
- Memo (optional)

**Validation:**
- Amount must be > 0
- Amount cannot exceed balance remaining (warning if overpayment)
- Payment date cannot be in future (warning only)

### Generate Charges Modal

**Component:** `GenerateMonthlyChargesModal.tsx`

**Fields:**
- Month/Year selector (default: next month)
- Property filter (optional, default: all)
- Preview: Shows how many charges will be created

**Process:**
1. User selects month
2. System queries active leases
3. Shows preview of charges to be created
4. User confirms
5. Charges are created in background
6. Success notification with count

## Business Logic

### Charge Generation Rules

**When to generate a charge:**
1. Lease must be active
2. Lease start date ≤ charge month
3. Lease end date ≥ charge month (or no end date)
4. No existing charge for this lease + month combo

**Charge calculation:**
- Amount = `lease.rentAmount`
- Charge Date = 1st of the month
- Due Date = `lease.rentDueDay` of the month (default: 1st)

**Auto-generated fields:**
- `property` = lease.property
- `unit` = lease.unit
- `tenant` = lease.primaryTenant
- `chargeType` = "Rent"
- `status` = "Scheduled"

### Status Auto-Update Rules

**Status transitions:**
- `Scheduled` → `Billed` when charge date arrives
- `Billed` → `Paid` when balanceRemaining = 0
- `Billed` → `Partial` when 0 < balanceRemaining < amount
- `Billed` → `Overdue` when current date > due date AND balanceRemaining > 0
- `Partial` → `Paid` when final payment received
- `Partial` → `Overdue` when current date > due date AND balanceRemaining > 0

**Trigger:** Background job runs daily to update statuses

### Payment Application Rules

**Payment allocation priority:**
1. Always apply to oldest charges first
2. If payment > balance, create overpayment credit
3. If payment < balance, mark as partial
4. Update charge status after payment applied

### Delinquency Rules

**Delinquency tiers:**
- 1-15 days: Early delinquency (yellow warning)
- 16-30 days: Late delinquency (orange alert)
- 31+ days: Severe delinquency (red critical)

**Delinquency report includes:**
- Tenant name
- Property + Unit
- Days overdue
- Amount overdue
- Total tenant balance
- Last payment date
- Suggested action (reminder, late fee, eviction notice)

## UI/UX Design

### Color Coding

**Status colors:**
- Paid: `theme.color.green` (success)
- Partial: `theme.color.yellow` (warning)
- Overdue: `theme.color.red` (danger)
- Scheduled: `theme.font.color.light` (neutral)
- Waived: `theme.font.color.tertiary` (muted)

**Amount display:**
- Positive (owed): Normal text
- Negative (credit): Green text with "-" prefix
- Zero: Gray text

### Responsive Design

**Desktop:**
- Full table with all columns
- Side-by-side filters and summary cards
- Inline payment recording

**Tablet:**
- Horizontal scroll for table
- Stacked summary cards
- Modal for payment recording

**Mobile:**
- Card-based layout (not table)
- Collapsible filters
- Full-screen payment modal

## Implementation Phases

### Phase 1A: Data Model (Week 1, Days 1-2)
- ✅ Define RentCharge object via metadata UI
- ✅ Define Payment object via metadata UI
- ✅ Set up relations (Lease → RentCharge, RentCharge → Payment)
- ✅ Test object creation via Twenty UI

### Phase 1B: Backend Foundation (Week 1, Days 3-5)
- ✅ Create rent-roll.service.ts
- ✅ Create rent-charge-generator.service.ts
- ✅ Create payment-processor.service.ts
- ✅ Create GraphQL resolvers
- ✅ Write unit tests for services

### Phase 2: Frontend UI (Week 2, Days 1-3)
- ✅ Create RentRollPage component
- ✅ Build rent roll table
- ✅ Add summary cards
- ✅ Implement filters
- ✅ Add status color coding

### Phase 3: Payment Recording (Week 2, Days 4-5)
- ✅ Create RecordPaymentModal
- ✅ Implement payment mutation
- ✅ Update charge status on payment
- ✅ Add payment validation

### Phase 4: Charge Generation (Week 3, Days 1-2)
- ✅ Create GenerateMonthlyChargesModal
- ✅ Implement charge generation mutation
- ✅ Add charge preview
- ✅ Handle bulk creation

### Phase 5: Delinquency & Alerts (Week 3, Days 3-5)
- ✅ Build delinquency report
- ✅ Add automated status updates (background job)
- ✅ Implement alert system
- ✅ Add late fee auto-generation (optional)

### Phase 6: Polish & Testing (Week 4)
- ✅ Add export to CSV
- ✅ Implement bulk actions
- ✅ Add loading states and error handling
- ✅ Write integration tests
- ✅ User acceptance testing
- ✅ Documentation

## Success Metrics

**Feature complete when:**
1. ✅ Property manager can generate rent charges for all active leases in one click
2. ✅ Property manager can record a payment and see balance update immediately
3. ✅ System automatically shows overdue charges in red
4. ✅ Rent roll page loads in < 2 seconds with 100+ charges
5. ✅ Payment history is accurate and auditable
6. ✅ Delinquency report shows actionable data

## Future Enhancements (Post-MVP)

1. **Automated Reminders**
   - Email tenants 5 days before due date
   - SMS notifications for overdue payments

2. **Payment Portal**
   - Tenant self-service payment
   - Credit card / ACH processing
   - Auto-pay enrollment

3. **Late Fees**
   - Auto-generate late fees after X days
   - Configurable late fee rules per property

4. **Recurring Charges**
   - Utilities, parking, pet rent
   - Charge templates

5. **Cash Flow Forecasting**
   - Predict future income based on rent roll
   - Identify seasonal trends

6. **Payment Plans**
   - Set up installment payments for overdue balances
   - Track payment plan compliance
