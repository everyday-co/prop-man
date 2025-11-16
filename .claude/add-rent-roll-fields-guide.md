# Step-by-Step Guide: Adding Rent Roll Fields via UI

## Overview

This guide will walk you through adding the missing fields to your existing **Lease Charges** and **Payments** objects via the Twenty UI. This should take about 10-15 minutes.

**What you'll add:**
- 5 fields to Lease Charges
- 3 fields to Payments
- 1 field to Lease (optional)
- Update status options for both objects

---

## Part 1: Update Lease Charges Object

### Navigate to Lease Charges

1. Go to **Settings** → **Data Model** → **Objects**
2. Find and click on **"Lease Charges"** in the list

### Add Field 1: tenant (Relation)

1. Click **"+ Add Field"** button
2. Fill in:
   - **Type:** Relation
   - **Relation type:** Many Lease Charges to One Person
   - **Field name:** `tenant`
   - **Label:** `Tenant`
   - **Description:** `Primary tenant for this charge (denormalized for reporting)`
3. Click **"Save"**

### Add Field 2: chargeDate (Date)

1. Click **"+ Add Field"**
2. Fill in:
   - **Type:** Date
   - **Field name:** `chargeDate`
   - **Label:** `Charge Date`
   - **Description:** `When the charge was created/scheduled`
3. Click **"Save"**

### Add Field 3: balanceRemaining (Currency)

1. Click **"+ Add Field"**
2. Fill in:
   - **Type:** Currency
   - **Field name:** `balanceRemaining`
   - **Label:** `Balance Remaining`
   - **Description:** `Amount still owed after payments (auto-calculated by backend)`
   - **Default value:** 0
3. Click **"Save"**

### Add Field 4: memo (Text)

1. Click **"+ Add Field"**
2. Fill in:
   - **Type:** Text
   - **Field type:** Long Text
   - **Field name:** `memo`
   - **Label:** `Memo`
   - **Description:** `Internal notes about this charge`
   - **Required:** No
3. Click **"Save"**

### Add Field 5: description (Text)

1. Click **"+ Add Field"**
2. Fill in:
   - **Type:** Text
   - **Field type:** Long Text
   - **Field name:** `description`
   - **Label:** `Description`
   - **Description:** `Public description shown to tenant`
   - **Required:** No
3. Click **"Save"**

### Update Existing Field: status (Select)

1. Find the existing **"status"** field in the list
2. Click the field to edit it
3. Update the **Options** to include:
   - Scheduled (color: gray)
   - Billed (color: blue)
   - Partial (color: yellow)
   - Paid (color: green)
   - Overdue (color: red)
   - Waived (color: gray)
4. Click **"Save"**

✅ **Lease Charges object is now ready!**

---

## Part 2: Update Payments Object

### Navigate to Payments

1. Go to **Settings** → **Data Model** → **Objects**
2. Find and click on **"Payments"** in the list

### Add Field 1: rentCharge (Relation) ⚠️ CRITICAL

1. Click **"+ Add Field"**
2. Fill in:
   - **Type:** Relation
   - **Relation type:** Many Payments to One Lease Charge
   - **Field name:** `rentCharge`
   - **Label:** `Rent Charge`
   - **Description:** `The charge this payment applies to (CRITICAL for rent roll)`
3. Click **"Save"**

**Note:** This is the most important field! It links payments to charges.

### Add Field 2: referenceNumber (Text)

1. Click **"+ Add Field"**
2. Fill in:
   - **Type:** Text
   - **Field type:** Short Text
   - **Field name:** `referenceNumber`
   - **Label:** `Reference Number`
   - **Description:** `Check number, confirmation number, transaction ID, etc.`
   - **Required:** No
3. Click **"Save"**

### Add Field 3: memo (Text)

1. Click **"+ Add Field"**
2. Fill in:
   - **Type:** Text
   - **Field type:** Long Text
   - **Field name:** `memo`
   - **Label:** `Memo`
   - **Description:** `Internal notes about this payment`
   - **Required:** No
3. Click **"Save"**

### Update Existing Field: status (Select)

1. Find the existing **"status"** field
2. Click the field to edit it
3. Update the **Options** to:
   - Pending (color: yellow)
   - Cleared (color: green)
   - Bounced (color: red)
   - Reversed (color: red)
4. Click **"Save"**

✅ **Payments object is now ready!**

---

## Part 3: Update Lease Object (Optional but Recommended)

### Navigate to Lease

1. Go to **Settings** → **Data Model** → **Objects**
2. Find and click on **"Leases"** in the list

### Check if rentAmount exists

1. Look through the fields list for **"rentAmount"** or **"monthlyRent"** (Currency field)
2. If it exists, great! If not, add it:
   - **Type:** Currency
   - **Field name:** `rentAmount`
   - **Label:** `Monthly Rent`
   - **Description:** `Monthly rent amount`
   - **Required:** Yes

### Add Field: rentDueDay (Number)

1. Click **"+ Add Field"**
2. Fill in:
   - **Type:** Number
   - **Field name:** `rentDueDay`
   - **Label:** `Rent Due Day`
   - **Description:** `Day of month rent is due (1-31)`
   - **Default value:** 1
   - **Required:** No
3. Click **"Save"**

✅ **Lease object is now ready!**

---

## Part 4: Verify the Changes

### Test Lease Charges

1. Navigate to **Objects** → **Lease Charges**
2. Click **"+ New"** to create a test record
3. Verify you can see all the new fields:
   - Tenant (relation picker)
   - Charge Date (date picker)
   - Balance Remaining (currency input)
   - Memo (text area)
   - Description (text area)
4. Verify the status dropdown shows all 6 options
5. Cancel (don't save)

### Test Payments

1. Navigate to **Objects** → **Payments**
2. Click **"+ New"**
3. Verify you can see:
   - Rent Charge (relation picker) ← **Most important!**
   - Reference Number (text input)
   - Memo (text area)
4. Verify the status dropdown shows: Pending, Cleared, Bounced, Reversed
5. Cancel (don't save)

### Test the Relation

1. Create a real test Lease Charge:
   - Link to an existing Lease
   - Set chargeDate to today
   - Set dueDate to next week
   - Set amount to $1000
   - Set balanceRemaining to $1000
   - Set status to "Billed"
2. Save it

3. Create a test Payment:
   - Link the **Rent Charge** you just created ← Test the critical relation!
   - Link the same Lease
   - Set amount to $500
   - Set paymentDate to today
   - Set status to "Cleared"
4. Save it

5. Go back to the Lease Charge
6. Verify you can see the Payment in a related list/section

✅ **If you can see the payment linked to the charge, the relation works!**

---

## Part 5: Sync Metadata (Important!)

After adding fields via UI, Twenty should auto-sync metadata. But to be safe:

```bash
# In your terminal, run:
npx nx run twenty-server:command workspace:sync-metadata
```

This ensures the GraphQL schema is updated with the new fields.

---

## Verification Checklist

Before proceeding to build the rent roll feature, verify:

- [ ] Lease Charges has **tenant** field (relation to Person)
- [ ] Lease Charges has **chargeDate** field (date)
- [ ] Lease Charges has **balanceRemaining** field (currency)
- [ ] Lease Charges has **memo** field (long text)
- [ ] Lease Charges has **description** field (long text)
- [ ] Lease Charges **status** has 6 options (Scheduled, Billed, Partial, Paid, Overdue, Waived)
- [ ] Payments has **rentCharge** field (relation to Lease Charge) ⚠️ CRITICAL
- [ ] Payments has **referenceNumber** field (short text)
- [ ] Payments has **memo** field (long text)
- [ ] Payments **status** has 4 options (Pending, Cleared, Bounced, Reversed)
- [ ] Lease has **rentDueDay** field (number, 1-31)
- [ ] Test Lease Charge created successfully
- [ ] Test Payment created and linked to Charge successfully
- [ ] Relation between Payment and Lease Charge works both ways

---

## Troubleshooting

### "Relation type not showing Lease Charge"
- Make sure you saved the Lease Charges object first
- Refresh the page
- The relation picker should show "Lease Charge" in the object dropdown

### "Fields not appearing in GraphQL"
- Run: `npx nx run twenty-server:command workspace:sync-metadata`
- Restart the dev server: `yarn start`
- Clear your browser cache

### "Can't save new record"
- Check if any required fields are missing
- Make sure relations point to valid records
- Check browser console for errors

---

## Next Steps

Once all fields are added and verified:

1. ✅ Data model is ready
2. → Build backend rent roll service
3. → Build frontend rent roll page
4. → Implement payment recording workflow
5. → Build automated charge generation

**Ready to continue? Let me know when you've added the fields and we'll build the backend service!**
