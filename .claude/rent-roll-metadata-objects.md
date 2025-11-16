# Rent Roll Data Model - Metadata Object Definitions

This document contains the exact object and field definitions to create via Twenty's Data Model UI (Settings → Data Model → Objects).

## Object 1: Rent Charge

**Object Settings:**
- **Name (Singular):** Rent Charge
- **Name (Plural):** Rent Charges
- **Label Singular:** Rent Charge
- **Label Plural:** Rent Charges
- **Description:** Scheduled rent charges for lease periods
- **Icon:** IconCurrencyDollar (or IconReceipt)

### Fields to Create

1. **lease** (Relation)
   - Type: Relation
   - Related Object: Lease
   - Relation Type: Many Rent Charges to One Lease
   - Description: The lease this charge applies to

2. **property** (Relation)
   - Type: Relation
   - Related Object: Property
   - Relation Type: Many Rent Charges to One Property
   - Description: Property (denormalized for reporting)

3. **unit** (Relation)
   - Type: Relation
   - Related Object: Unit
   - Relation Type: Many Rent Charges to One Unit
   - Description: Unit (denormalized for reporting)

4. **tenant** (Relation)
   - Type: Relation
   - Related Object: Person
   - Relation Type: Many Rent Charges to One Person
   - Description: Primary tenant

5. **chargeDate** (Date)
   - Type: Date
   - Label: Charge Date
   - Description: When the charge is due
   - Required: Yes
   - Default: (none)

6. **dueDate** (Date)
   - Type: Date
   - Label: Due Date
   - Description: Payment due date
   - Required: Yes
   - Default: (none)

7. **chargeType** (Select)
   - Type: Select
   - Label: Charge Type
   - Description: Type of charge
   - Options:
     - Rent (default)
     - Late Fee
     - Utility
     - Pet Rent
     - Parking
     - Other
   - Required: Yes
   - Default: Rent

8. **amount** (Currency)
   - Type: Currency
   - Label: Amount
   - Description: Charge amount
   - Required: Yes
   - Default: 0

9. **balanceRemaining** (Currency)
   - Type: Currency
   - Label: Balance Remaining
   - Description: Amount still owed (updated by payments)
   - Required: Yes
   - Default: 0
   - Note: This will be auto-calculated by backend logic

10. **status** (Select)
    - Type: Select
    - Label: Status
    - Description: Payment status
    - Options:
      - Scheduled (gray)
      - Billed (blue)
      - Partial (yellow)
      - Paid (green)
      - Overdue (red)
      - Waived (gray)
    - Required: Yes
    - Default: Scheduled
    - Color coding:
      - Scheduled: Gray
      - Billed: Blue
      - Partial: Yellow
      - Paid: Green
      - Overdue: Red
      - Waived: Gray

11. **description** (Text)
    - Type: Text (Long)
    - Label: Description
    - Description: Optional description
    - Required: No

12. **memo** (Text)
    - Type: Text (Long)
    - Label: Memo
    - Description: Internal notes
    - Required: No

### Default View Settings

**Columns to show (in order):**
1. Name (auto-generated)
2. Property
3. Unit
4. Tenant
5. Charge Date
6. Due Date
7. Amount
8. Balance Remaining
9. Status
10. Created At

**Filters:**
- Status
- Property
- Charge Date (this month, this quarter, custom range)

**Sort:**
- Default: Due Date (ascending)

---

## Object 2: Payment

**Object Settings:**
- **Name (Singular):** Payment
- **Name (Plural):** Payments
- **Label Singular:** Payment
- **Label Plural:** Payments
- **Description:** Payments received from tenants
- **Icon:** IconCreditCard

### Fields to Create

1. **rentCharge** (Relation)
   - Type: Relation
   - Related Object: Rent Charge
   - Relation Type: Many Payments to One Rent Charge
   - Description: The charge this payment applies to

2. **lease** (Relation)
   - Type: Relation
   - Related Object: Lease
   - Relation Type: Many Payments to One Lease
   - Description: Lease (denormalized for reporting)

3. **property** (Relation)
   - Type: Relation
   - Related Object: Property
   - Relation Type: Many Payments to One Property
   - Description: Property (denormalized for reporting)

4. **tenant** (Relation)
   - Type: Relation
   - Related Object: Person
   - Relation Type: Many Payments to One Person
   - Description: Who paid

5. **paymentDate** (Date)
   - Type: Date & Time
   - Label: Payment Date
   - Description: When payment was received
   - Required: Yes
   - Default: Now

6. **amount** (Currency)
   - Type: Currency
   - Label: Amount
   - Description: Payment amount
   - Required: Yes
   - Default: 0

7. **paymentMethod** (Select)
   - Type: Select
   - Label: Payment Method
   - Description: How payment was made
   - Options:
     - Check
     - ACH
     - Credit Card
     - Debit Card
     - Cash
     - Money Order
     - Wire Transfer
     - Other
   - Required: Yes
   - Default: Check

8. **referenceNumber** (Text)
   - Type: Text (Short)
   - Label: Reference Number
   - Description: Check number, transaction ID, etc.
   - Required: No

9. **status** (Select)
   - Type: Select
   - Label: Status
   - Description: Payment status
   - Options:
     - Pending (yellow)
     - Cleared (green)
     - Bounced (red)
     - Reversed (red)
   - Required: Yes
   - Default: Cleared
   - Color coding:
     - Pending: Yellow
     - Cleared: Green
     - Bounced: Red
     - Reversed: Red

10. **memo** (Text)
    - Type: Text (Long)
    - Label: Memo
    - Description: Internal notes
    - Required: No

### Default View Settings

**Columns to show (in order):**
1. Name (auto-generated)
2. Tenant
3. Property
4. Payment Date
5. Amount
6. Payment Method
7. Reference Number
8. Status
9. Created At

**Filters:**
- Status
- Property
- Payment Date (this month, this quarter, custom range)
- Payment Method

**Sort:**
- Default: Payment Date (descending)

---

## Implementation Steps

### Step 1: Create Objects via Twenty UI

1. Navigate to Settings → Data Model → Objects
2. Click "+ New Object"
3. Create "Rent Charge" with settings above
4. Add all fields listed for Rent Charge
5. Repeat for "Payment" object

### Step 2: Set Up Relations

Relations should auto-create the reverse side:
- Lease ← Rent Charges (one-to-many)
- Lease ← Payments (one-to-many)
- Property ← Rent Charges (one-to-many)
- Property ← Payments (one-to-many)
- Unit ← Rent Charges (one-to-many)
- Person (Tenant) ← Rent Charges (one-to-many)
- Person (Tenant) ← Payments (one-to-many)
- Rent Charge ← Payments (one-to-many)

### Step 3: Update Lease Object

Add helpful fields to Lease object for rent charge generation:

**New fields to add to Lease:**

1. **rentDueDay** (Number)
   - Type: Number
   - Label: Rent Due Day
   - Description: Day of month rent is due (1-31)
   - Required: Yes
   - Default: 1
   - Min: 1
   - Max: 31

2. **rentAmount** (Currency)
   - Type: Currency
   - Label: Monthly Rent
   - Description: Monthly rent amount
   - Required: Yes
   - Default: 0

Note: These fields might already exist. If so, skip this step.

### Step 4: Verify Object Creation

1. Go to Objects → Rent Charges
2. Try creating a manual rent charge
3. Verify all fields appear correctly
4. Verify relations work (can link to Lease, Property, Unit, Tenant)
5. Repeat for Payments

### Step 5: Test Data

Create test data:
1. Create 3-5 rent charges for existing leases
2. Create 1-2 payments linked to those charges
3. Verify data appears in object views
4. Test filtering and sorting

---

## Notes for Backend Implementation

Once objects are created via metadata UI:

1. **Query rent charges:**
   ```graphql
   query {
     rentCharges(
       filter: { chargeDate: { gte: "2025-12-01" } }
       orderBy: { dueDate: AscNullsLast }
     ) {
       edges {
         node {
           id
           lease { id name }
           property { id name }
           unit { id unitNumber }
           tenant { id firstName lastName }
           chargeDate
           dueDate
           amount
           balanceRemaining
           status
         }
       }
     }
   }
   ```

2. **Create rent charge:**
   ```graphql
   mutation {
     createRentCharge(
       input: {
         leaseId: "..."
         propertyId: "..."
         unitId: "..."
         tenantId: "..."
         chargeDate: "2025-12-01"
         dueDate: "2025-12-01"
         chargeType: "Rent"
         amount: 2500
         balanceRemaining: 2500
         status: "Scheduled"
       }
     ) {
       id
     }
   }
   ```

3. **Record payment:**
   ```graphql
   mutation {
     createPayment(
       input: {
         rentChargeId: "..."
         leaseId: "..."
         propertyId: "..."
         tenantId: "..."
         paymentDate: "2025-12-05"
         amount: 2500
         paymentMethod: "Check"
         referenceNumber: "1234"
         status: "Cleared"
       }
     ) {
       id
     }
   }
   ```

4. **Update rent charge after payment:**
   ```graphql
   mutation {
     updateRentCharge(
       id: "..."
       input: {
         balanceRemaining: 0
         status: "Paid"
       }
     ) {
       id
       balanceRemaining
       status
     }
   }
   ```

---

## Ready for Next Phase

Once objects are created and verified:
1. ✅ Data model exists
2. ✅ Can query via GraphQL
3. ✅ Can create/update via GraphQL
4. → Ready to build backend services
5. → Ready to build frontend UI
