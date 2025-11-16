# Property Management Scripts

## add-rent-roll-fields-guide.md

**Recommended Approach:** Step-by-step UI guide to manually add the required fields.

**When to use:**
- You want full control and visibility
- You want to learn how Twenty's data model works
- First time setting up rent roll

**Time:** ~10-15 minutes

**Location:** `/.claude/add-rent-roll-fields-guide.md`

---

## Quick Add via UI (Fastest)

If you want to add the fields manually via the UI (recommended), follow this condensed checklist:

### Lease Charges Object - Add These Fields:

1. **tenant** - Relation → Person (Many-to-One)
2. **chargeDate** - Date
3. **balanceRemaining** - Currency (default: 0)
4. **memo** - Long Text
5. **description** - Long Text
6. **status** - Update options: Scheduled, Billed, Partial, Paid, Overdue, Waived

### Payments Object - Add These Fields:

1. **rentCharge** - Relation → Lease Charge (Many-to-One) ⚠️ CRITICAL
2. **referenceNumber** - Short Text
3. **memo** - Long Text
4. **status** - Update options: Pending, Cleared, Bounced, Reversed

### Lease Object - Add This Field:

1. **rentDueDay** - Number (1-31, default: 1)

---

## After Adding Fields

Run this command to sync the metadata:

```bash
npx nx run twenty-server:command workspace:sync-metadata
```

Then verify the fields appear in:
- Settings → Data Model → Objects
- GraphQL schema (query fields exist)
- Object create/edit forms

---

## Next: Build the Rent Roll Feature

Once fields are added, continue with:

1. Backend rent roll service (`src/app/property-management/services/rent-roll.service.ts`)
2. GraphQL resolvers (`src/app/property-management/resolvers/rent-roll.resolver.ts`)
3. Frontend page (`packages/twenty-front/src/modules/property-management/pages/RentRollPage.tsx`)
