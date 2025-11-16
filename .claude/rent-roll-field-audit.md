# Rent Roll Field Audit - Existing vs. Needed

## Summary

You already have **Lease Charges** (14 fields, 1 instance) and **Payments** (14 fields, 1 instance) objects created!

This document compares what currently exists vs. what we need for the full rent roll feature.

---

## Lease Charges Object

### Existing Fields (from docs/setup-pm-objects.md)

Based on the setup documentation, your Lease Charges object should have:

✅ **name** - Text (Label Identifier)
✅ **lease** - Relation → Lease (Many-to-One)
✅ **property** - Relation → Property (Many-to-One)
✅ **unit** - Relation → Unit (Many-to-One)
✅ **chargeType** - Select (Rent, Deposit, Late Fee, Utility, Pet Fee, Parking, Other)
✅ **amount** - Currency
✅ **dueDate** - Date
✅ **periodStart** - Date
✅ **periodEnd** - Date
✅ **status** - Select (Open, Partially Paid, Paid, Waived)

### Additional Fields Needed for Rent Roll

To support the full rent roll feature, we need to add:

❌ **tenant** - Relation → Person (denormalized for quick reporting)
   - Type: Relation (Many-to-One)
   - Target: Person
   - Description: Primary tenant for this charge

❌ **chargeDate** - Date (separate from dueDate)
   - Type: Date
   - Description: When the charge was created/scheduled
   - Use case: Track when rent was billed vs. when it's due

❌ **balanceRemaining** - Currency
   - Type: Currency
   - Description: Amount still owed after payments
   - Default: (same as amount)
   - Note: This will be auto-updated by backend when payments are applied

❌ **memo** - Text (Long)
   - Type: Text (Long)
   - Description: Internal notes about this charge
   - Optional

❌ **description** - Text (Long)
   - Type: Text (Long)
   - Description: Public description shown to tenant
   - Optional

### Status Field Updates Needed

Current status options: Open, Partially Paid, Paid, Waived

Suggested rent roll status options:
- **Scheduled** (gray) - Charge created but not yet due
- **Billed** (blue) - Charge is due but unpaid
- **Partial** (yellow) - Partially paid
- **Paid** (green) - Fully paid
- **Overdue** (red) - Past due date and unpaid
- **Waived** (gray) - Charge waived/forgiven

**Action:** Add "Scheduled", "Billed", and "Overdue" to the status select options

### ChargeType Updates Needed

Current options: Rent, Deposit, Late Fee, Utility, Pet Fee, Parking, Other

For rent roll, consider adding:
- **Pet Rent** (separate from Pet Fee)

**Action:** Verify "Late Fee" can be auto-generated (or add this as enhancement)

---

## Payments Object

### Existing Fields (from docs/setup-pm-objects.md)

✅ **name** - Text (Label Identifier)
✅ **lease** - Relation → Lease (Many-to-One)
✅ **property** - Relation → Property (Many-to-One)
✅ **unit** - Relation → Unit (Many-to-One)
✅ **payer** - Relation → Person (Many-to-One)
✅ **amount** - Currency
✅ **paymentDate** - DateTime
✅ **method** - Select (ACH, Card, Check, Money Order, Cash, Wire Transfer, Other)
✅ **status** - Select (Pending, Completed, Failed, Refunded)
✅ **externalReference** - Text (transaction IDs)

### Additional Fields Needed for Rent Roll

❌ **rentCharge** - Relation → Lease Charge (Many-to-One)
   - Type: Relation
   - Target: Lease Charge
   - Description: Which charge this payment applies to
   - **CRITICAL for rent roll**: This links payments to charges

❌ **referenceNumber** - Text (Short)
   - Type: Text
   - Description: Check number, confirmation number, etc.
   - Note: You have "externalReference" which might serve the same purpose
   - **Action:** Consider if externalReference is sufficient or if we need both

❌ **memo** - Text (Long)
   - Type: Text (Long)
   - Description: Internal notes about this payment
   - Optional

### Field Naming Differences

**payer** vs. **tenant**
- You have: `payer` (Person relation)
- Spec suggests: `tenant` (Person relation)
- **Action:** Keep `payer` - it's more accurate (could be guarantor, parent, etc.)

**method** vs. **paymentMethod**
- You have: `method`
- Spec suggests: `paymentMethod`
- **Action:** Keep `method` - shorter is fine

**externalReference** vs. **referenceNumber**
- You have: `externalReference`
- Spec suggests: `referenceNumber`
- **Action:** Keep `externalReference` OR add `referenceNumber` for manual check numbers

### Status Field Updates Needed

Current status options: Pending, Completed, Failed, Refunded

Suggested rent roll status options:
- **Pending** (yellow) - Payment received but not cleared
- **Cleared** (green) - Payment cleared/deposited
- **Bounced** (red) - Check bounced or payment failed
- **Reversed** (red) - Payment refunded/reversed

**Action:** Update status options:
- Rename "Completed" → "Cleared"
- Rename "Failed" → "Bounced"
- Keep "Refunded" or rename to "Reversed"

---

## Lease Object Updates

To support automated rent charge generation, the Lease object needs these fields:

**Check if these exist:**
✅ **rentAmount** - Currency (monthly rent)
❓ **rentDueDay** - Number (day of month, 1-31)

If **rentDueDay** doesn't exist, add it:
- Type: Number
- Label: Rent Due Day
- Description: Day of month rent is due (1-31)
- Default: 1
- Min: 1
- Max: 31

---

## Critical Missing Relation

### ⚠️ Lease Charge ← Payments

**Most Important Addition:**

The Payment object MUST have a relation to Lease Charge:
- **Field:** rentCharge (or leaseCharge)
- **Type:** Relation (Many-to-One)
- **Target:** Lease Charge
- **Description:** The charge this payment applies to

**Why this is critical:**
- Without this relation, we can't apply payments to specific charges
- Can't calculate `balanceRemaining` on charges
- Can't show payment history for a charge
- Rent roll feature won't work

**This is the #1 field to add immediately.**

---

## Implementation Checklist

### Phase 1: Add Critical Fields (Do This First)

#### Lease Charges Object
- [ ] Add **tenant** relation (Person)
- [ ] Add **balanceRemaining** currency field
- [ ] Add **chargeDate** date field
- [ ] Update **status** select options (add Scheduled, Billed, Overdue)

#### Payments Object
- [ ] Add **rentCharge** relation (Lease Charge) ← **CRITICAL**
- [ ] Update **status** select options (rename to Cleared, Bounced, Reversed)

#### Lease Object
- [ ] Verify **rentAmount** exists (or add it)
- [ ] Add **rentDueDay** number field (1-31)

### Phase 2: Add Nice-to-Have Fields

#### Lease Charges
- [ ] Add **memo** text field
- [ ] Add **description** text field

#### Payments
- [ ] Add **referenceNumber** text field (if externalReference isn't sufficient)
- [ ] Add **memo** text field

### Phase 3: Test Relations

- [ ] Create a test Lease Charge
- [ ] Create a test Payment linked to that charge
- [ ] Verify the relation shows correctly both ways
- [ ] Test that you can query: LeaseCharge → Payments (reverse relation)

---

## What You Can Skip

Based on your existing objects, you can **skip creating new objects** entirely!

Just add the missing fields listed above, and you'll be ready to build the rent roll feature.

---

## Next Steps After Field Updates

Once fields are added:

1. ✅ Create 3-5 test lease charges with different statuses
2. ✅ Create 1-2 test payments linked to those charges
3. ✅ Verify data integrity (relations work, calculations possible)
4. → Build backend GraphQL resolvers for rent roll queries
5. → Build frontend RentRollPage component
6. → Implement payment recording workflow
7. → Build charge generation automation

---

## GraphQL Query Examples (After Fields Added)

### Get Rent Roll with Payments

```graphql
query GetRentRoll {
  leaseCharges(
    filter: {
      chargeDate: { gte: "2025-12-01" }
      chargeDate: { lte: "2025-12-31" }
    }
    orderBy: { dueDate: AscNullsFirst }
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
        chargeType
        amount
        balanceRemaining
        status
        payments {
          edges {
            node {
              id
              paymentDate
              amount
              method
              status
            }
          }
        }
      }
    }
  }
}
```

### Apply Payment to Charge

```graphql
mutation RecordPayment {
  createPayment(
    input: {
      rentChargeId: "lease-charge-id-here"
      leaseId: "lease-id-here"
      propertyId: "property-id-here"
      payerId: "person-id-here"
      amount: 2500
      paymentDate: "2025-12-05T10:30:00Z"
      method: "Check"
      referenceNumber: "1234"
      status: "Cleared"
    }
  ) {
    id
    amount
    rentCharge {
      id
      balanceRemaining
      status
    }
  }
}
```

(Then update the charge's balanceRemaining via backend logic)
