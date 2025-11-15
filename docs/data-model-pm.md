# Property Management Data Model

This document summarizes the custom objects that power the Everyday Property Management app. All objects are configured through Twenty's metadata engine; no new raw ORM entities are introduced.

## Workspace & Ownership
- Every object record is scoped to a **workspace (tenant)**. All queries must include the current workspace identifier.
- People and Companies remain shared across CRM and PM modules; a Person can simultaneously be a tenant, owner, vendor, or lead.

## Core Objects

### Property
- Represents a physical asset (single-family home, duplex, multifamily building, etc.).
- Key fields: `name`, `street`, `city`, `state`, `postalCode`, `propertyType`, `unitCount`, `status`, `acquisitionDate`, `acquisitionPrice`.
- Relationships:
  - `ownerCompany` -> Company (ownership entity).
  - One-to-many with Units, Leases, WorkOrders, LeaseCharges, Payments.

### Unit
- Represents an individual rentable space tied to a Property.
- Key fields: `unitNumber`, `bedrooms`, `bathrooms`, `squareFeet`, `marketRent`, `currentRent`, `status`, `readyDate`, `marketingNotes`.
- Relationships:
  - `property` -> Property (parent asset).
  - `leases` -> Lease (historical and active agreements).
  - `workOrders` -> WorkOrder (maintenance tickets).

### Lease
- Agreement between tenants and ownership for a specific property/unit.
- Key fields: `startDate`, `endDate`, `rentAmount`, `depositAmount`, `billingDayOfMonth`, `leaseStatus`.
- Relationships:
  - `property` -> Property.
  - `unit` -> Unit.
  - `tenants` -> Person (multi-relation, one or more residents).
  - `leaseCharges` -> LeaseCharge (financial obligations).
  - `payments` -> Payment (collected funds).

### WorkOrder
- Maintenance or service request tied to a property/unit.
- Key fields: `title`, `category`, `priority`, `status`, `description`, `requestedAt`, `scheduledFor`, `completedAt`, `laborCost`, `materialsCost`, `totalCost`.
- Relationships:
  - `property` -> Property.
  - `unit` -> Unit (optional for common-area work).
  - `tenant` -> Person (requester or affected resident).
  - `assignedVendor` -> Company or Person (provider handling the job).

### LeaseCharge
- Financial line item billed to a lease (rent, deposit, fees, utilities).
- Key fields: `chargeType`, `amount`, `dueDate`, `periodStart`, `periodEnd`, `status` (Open, Partially Paid, Paid, Waived).
- Relationships:
  - `lease` -> Lease (source agreement).
  - `property` -> Property (reporting context).
  - `unit` -> Unit (optional; derived from lease when omitted).

### Payment
- Recorded payment applied toward open LeaseCharges.
- Key fields: `amount`, `paymentDate`, `method` (ACH, Card, Check, etc.), `status` (Pending, Completed, Failed, Refunded), `externalReference`.
- Relationships:
  - `lease` -> Lease (which balance it reduces).
  - `property` -> Property and `unit` -> Unit for reporting alignment.
  - `payer` -> Person (tenant, guarantor, or owner).

## Supporting Objects (Future Wiring)
- **InventoryItem:** tracks appliances and consumables at the property/unit level for turns and inspections.
- **Inspection:** captures move-in/out and periodic inspection reports.
- **OwnershipStake:** links Companies to Properties with ownership percentages and distribution settings.
- **MessageThread / Document:** facilitate communication and document storage tied to PM workflows.

## Derived Metrics
- **Rent Roll:** Sum of LeaseCharges where `chargeType = 'Rent'` and `status` in (Open, Partially Paid, Paid) for a given period.
- **Collected:** Sum of Payments with `status = 'Completed'` within the same period.
- **Delinquent:** `max(rentRoll - collected, 0)`.
- **Occupancy Percent:** `activeLeases / unitCount` for the selected timeframe.
- **Open Work Orders:** Count of WorkOrders where `status` not in (Completed, Canceled).

## Implementation Notes
- Stick to metadata APIs (object-record services) for querying; avoid bespoke repositories.
- Always include workspace filters in queries and GraphQL resolvers.
- Maintain consistent currency handling (default workspace currency) when aggregating LeaseCharges and Payments.
- Keep custom field keys (e.g., `marketRent`) aligned between frontend and backend to leverage generated types and table configs.
