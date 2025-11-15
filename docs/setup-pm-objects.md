# Setting Up Property Management Custom Objects

## Overview
This guide walks you through creating the 6 custom objects needed for the Property Management module in Twenty.

**Important:** Create these objects in the order listed below, as some objects have relations to others.

---

## Access the Data Model UI

1. Open your browser and navigate to: `http://localhost:3001`
2. Click on "Continue with Email" and use the prefilled credentials
3. Navigate to: **Settings** → **Data Model** → **Objects**
4. You'll see existing objects like "Company", "Person", "Opportunity"

---

## Object 1: Property

### Step 1: Create the Object
1. Click **"New Object"** button (top right)
2. Fill in the form:
   - **Name (Singular):** `property`
   - **Name (Plural):** `properties`
   - **Label (Singular):** `Property`
   - **Label (Plural):** `Properties`
   - **Icon:** Select `IconBuilding` or similar building icon
   - **Description:** `Physical real estate assets managed by the company`
3. Click **"Create"**

### Step 2: Add Fields
After creating the object, you'll be on the object detail page. Click **"New Field"** for each field below:

| Field Name | Label | Type | Required | Notes |
|------------|-------|------|----------|-------|
| `name` | Name | Text | ✅ | Set as **Label Identifier** |
| `street` | Street Address | Text | | |
| `city` | City | Text | | |
| `state` | State | Text | | |
| `postalCode` | Postal Code | Text | | |
| `propertyType` | Property Type | Select | | Options: `SF`, `Duplex`, `MF 2-4`, `MF 5-49`, `MF 50+` |
| `unitCount` | Unit Count | Number | | Format: Integer |
| `status` | Status | Select | | Options: `Active`, `Under Contract`, `Sold` |
| `acquisitionDate` | Acquisition Date | Date | | |
| `acquisitionPrice` | Acquisition Price | Currency | | Default: USD |
| `ownerCompany` | Owner Company | Relation | | Type: Many-to-One, Target: Company |

**Important for Select Fields:**
- When creating `propertyType`, add each option (SF, Duplex, etc.) as separate values
- When creating `status`, add each option (Active, Under Contract, Sold)

---

## Object 2: Unit

### Step 1: Create the Object
1. Click **"New Object"** button
2. Fill in:
   - **Name (Singular):** `unit`
   - **Name (Plural):** `units`
   - **Label (Singular):** `Unit`
   - **Label (Plural):** `Units`
   - **Icon:** `IconDoor` or similar
   - **Description:** `Individual rentable spaces within properties`
3. Click **"Create"**

### Step 2: Add Fields

| Field Name | Label | Type | Required | Notes |
|------------|-------|------|----------|-------|
| `unitNumber` | Unit Number | Text | ✅ | Set as **Label Identifier** |
| `property` | Property | Relation | ✅ | Type: Many-to-One, Target: Property |
| `bedrooms` | Bedrooms | Number | | Format: Integer |
| `bathrooms` | Bathrooms | Number | | Format: Decimal (allows 1.5, 2.5) |
| `squareFeet` | Square Feet | Number | | Format: Integer |
| `marketRent` | Market Rent | Currency | | |
| `currentRent` | Current Rent | Currency | | |
| `status` | Status | Select | | Options: `Vacant`, `Vacant-Ready`, `Occupied`, `Notice`, `Turn`, `Down` |
| `readyDate` | Ready Date | Date | | |
| `marketingNotes` | Marketing Notes | Long Text | | |

---

## Object 3: Lease

### Step 1: Create the Object
1. Click **"New Object"** button
2. Fill in:
   - **Name (Singular):** `lease`
   - **Name (Plural):** `leases`
   - **Label (Singular):** `Lease`
   - **Label (Plural):** `Leases`
   - **Icon:** `IconFileText` or similar
   - **Description:** `Rental agreements for units`
3. Click **"Create"**

### Step 2: Add Fields

| Field Name | Label | Type | Required | Notes |
|------------|-------|------|----------|-------|
| `name` | Name | Text | | Set as **Label Identifier** (will auto-generate) |
| `property` | Property | Relation | ✅ | Type: Many-to-One, Target: Property |
| `unit` | Unit | Relation | ✅ | Type: Many-to-One, Target: Unit |
| `tenants` | Tenants | Relation | | Type: Many-to-Many, Target: Person |
| `startDate` | Start Date | Date | ✅ | |
| `endDate` | End Date | Date | | |
| `rentAmount` | Rent Amount | Currency | ✅ | |
| `depositAmount` | Deposit Amount | Currency | | |
| `billingDayOfMonth` | Billing Day | Number | | Format: Integer (1-31) |
| `leaseStatus` | Lease Status | Select | | Options: `Application`, `Approved`, `Active`, `Renewal Offered`, `Renewal Signed`, `Notice`, `Ended` |

---

## Object 4: WorkOrder

### Step 1: Create the Object
1. Click **"New Object"** button
2. Fill in:
   - **Name (Singular):** `workOrder`
   - **Name (Plural):** `workOrders`
   - **Label (Singular):** `Work Order`
   - **Label (Plural):** `Work Orders`
   - **Icon:** `IconTool` or similar
   - **Description:** `Maintenance and service requests`
3. Click **"Create"**

### Step 2: Add Fields

| Field Name | Label | Type | Required | Notes |
|------------|-------|------|----------|-------|
| `title` | Title | Text | ✅ | Set as **Label Identifier** |
| `property` | Property | Relation | ✅ | Type: Many-to-One, Target: Property |
| `unit` | Unit | Relation | | Type: Many-to-One, Target: Unit |
| `tenant` | Tenant | Relation | | Type: Many-to-One, Target: Person |
| `category` | Category | Select | | Options: `Plumbing`, `Electrical`, `HVAC`, `Appliance`, `Structural`, `Grounds`, `Other` |
| `priority` | Priority | Select | | Options: `Low`, `Normal`, `High`, `Emergency` |
| `status` | Status | Select | | Options: `New`, `In Review`, `Scheduled`, `In Progress`, `Waiting on Resident`, `Completed`, `Canceled` |
| `description` | Description | Long Text | | |
| `requestedAt` | Requested At | DateTime | | |
| `scheduledFor` | Scheduled For | DateTime | | |
| `completedAt` | Completed At | DateTime | | |
| `assignedVendor` | Assigned Vendor | Relation | | Type: Many-to-One, Target: Company |
| `laborCost` | Labor Cost | Currency | | |
| `materialsCost` | Materials Cost | Currency | | |
| `totalCost` | Total Cost | Currency | | |

---

## Object 5: LeaseCharge

### Step 1: Create the Object
1. Click **"New Object"** button
2. Fill in:
   - **Name (Singular):** `leaseCharge`
   - **Name (Plural):** `leaseCharges`
   - **Label (Singular):** `Lease Charge`
   - **Label (Plural):** `Lease Charges`
   - **Icon:** `IconReceipt` or similar
   - **Description:** `Financial line items billed to leases`
3. Click **"Create"**

### Step 2: Add Fields

| Field Name | Label | Type | Required | Notes |
|------------|-------|------|----------|-------|
| `name` | Name | Text | | Set as **Label Identifier** (auto-generate from charge type + date) |
| `lease` | Lease | Relation | ✅ | Type: Many-to-One, Target: Lease |
| `property` | Property | Relation | | Type: Many-to-One, Target: Property |
| `unit` | Unit | Relation | | Type: Many-to-One, Target: Unit |
| `chargeType` | Charge Type | Select | ✅ | Options: `Rent`, `Deposit`, `Late Fee`, `Utility`, `Pet Fee`, `Parking`, `Other` |
| `amount` | Amount | Currency | ✅ | |
| `dueDate` | Due Date | Date | ✅ | |
| `periodStart` | Period Start | Date | | For recurring charges (e.g., monthly rent) |
| `periodEnd` | Period End | Date | | |
| `status` | Status | Select | | Options: `Open`, `Partially Paid`, `Paid`, `Waived` |

---

## Object 6: Payment

### Step 1: Create the Object
1. Click **"New Object"** button
2. Fill in:
   - **Name (Singular):** `payment`
   - **Name (Plural):** `payments`
   - **Label (Singular):** `Payment`
   - **Label (Plural):** `Payments`
   - **Icon:** `IconCash` or similar
   - **Description:** `Recorded payments against lease charges`
3. Click **"Create"**

### Step 2: Add Fields

| Field Name | Label | Type | Required | Notes |
|------------|-------|------|----------|-------|
| `name` | Name | Text | | Set as **Label Identifier** (auto-generate) |
| `lease` | Lease | Relation | ✅ | Type: Many-to-One, Target: Lease |
| `property` | Property | Relation | | Type: Many-to-One, Target: Property |
| `unit` | Unit | Relation | | Type: Many-to-One, Target: Unit |
| `payer` | Payer | Relation | | Type: Many-to-One, Target: Person |
| `amount` | Amount | Currency | ✅ | |
| `paymentDate` | Payment Date | DateTime | ✅ | |
| `method` | Payment Method | Select | | Options: `ACH`, `Card`, `Check`, `Money Order`, `Cash`, `Wire Transfer`, `Other` |
| `status` | Status | Select | | Options: `Pending`, `Completed`, `Failed`, `Refunded` |
| `externalReference` | External Reference | Text | | For payment processor transaction IDs |

---

## Tips for Creating Objects

### Label Identifiers
- Each object needs exactly ONE field marked as "Label Identifier"
- This field is used as the display name in lists and relations
- For most objects, use `name` or `title`
- You can auto-generate this field (e.g., "Lease - Unit 101")

### Relations
- **Many-to-One**: Unit → Property (many units belong to one property)
- **One-to-Many**: Property → Units (one property has many units)
- **Many-to-Many**: Lease → Tenants (lease can have multiple tenants, person can have multiple leases)

### Field Naming
- Use **camelCase** for field names: `unitNumber`, not `unit_number`
- Use descriptive labels: "Unit Number" not "UnitNumber"
- Keep field names short and clear

### Required Fields
- Mark critical fields as required (✅ in tables above)
- This ensures data integrity and prevents incomplete records

---

## Verifying Object Creation

After creating all 6 objects:

1. **Check Objects List:** Go to Settings → Data Model → Objects
   - You should see all 6 new objects listed

2. **Test Object Access:**
   - Switch to PM mode using the app switcher (top of page)
   - Navigate to `/pm/properties`
   - You should see an empty list with "Add Property" button

3. **Check Relations:**
   - Create a test Property
   - Create a test Unit and link it to the Property
   - Verify the relation works correctly

---

## Creating Test Data

Once objects are created, add some test data:

### Example: 123 Main Street Property
1. Create Property:
   - Name: "123 Main Street Apartments"
   - Street: "123 Main Street"
   - City: "Austin"
   - State: "TX"
   - Postal Code: "78701"
   - Property Type: "MF 5-49"
   - Unit Count: 12
   - Status: "Active"

2. Create Units for the property:
   - Unit 101: 1 bed, 1 bath, Occupied
   - Unit 102: 2 bed, 2 bath, Vacant-Ready
   - Unit 103: 2 bed, 2 bath, Occupied

3. Create Active Leases:
   - Lease for Unit 101: Start date (6 months ago), End date (6 months from now), $1,200/month
   - Lease for Unit 103: Start date (3 months ago), End date (9 months from now), $1,400/month

4. Create Lease Charges:
   - For each active lease, create monthly rent charges with due date on the 1st

5. Create Payments:
   - For each charge, create a payment (mark some as completed, some as pending)

6. Create Work Orders:
   - Add a few open work orders for the property
   - Assign to different statuses (New, In Progress, etc.)

---

## Troubleshooting

### Can't find icon
- If the suggested icon doesn't exist, pick any similar icon from the selector
- Icons are just visual aids and don't affect functionality

### Relation not showing target object
- Make sure you created the target object first
- For example, create Property before creating Unit (which has Property relation)

### Field creation fails
- Check that field name is camelCase with no spaces or special characters
- Verify field type matches the data you want to store
- For Select fields, make sure you added at least one option

### Objects not appearing in PM navigation
- The PM navigation links to `/pm/properties`, `/pm/units`, etc.
- These routes automatically use the generic object list view
- As long as the objects exist with the correct plural names, they'll work

---

## Next Steps

After creating all objects and test data:
1. Regenerate GraphQL types: `npx nx run twenty-front:graphql:generate`
2. View the PM Dashboard: Navigate to `/pm/dashboard`
3. Verify calculations are correct (occupancy, rent roll, etc.)
4. Start building additional PM features!
