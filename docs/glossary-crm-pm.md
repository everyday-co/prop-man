# CRM + PM Glossary

| Term | Definition |
| --- | --- |
| **Big App Switcher** | Global control in the header that toggles between the CRM and PM experiences, swapping navigation and routes while sharing the same shell. |
| **Rent Roll** | Total rent charges (LeaseCharges with `chargeType = Rent`) due within a reporting period. Used to forecast expected income. |
| **Collected** | Sum of completed Payments applied to leases during a given period. |
| **Delinquency** | The difference between rent roll and collected amounts (floored at zero). Indicates unpaid balances. |
| **Occupancy Percent** | Ratio of active leases to total rentable units for a property or portfolio. |
| **Unit Turn** | Time window between a tenant moving out and the next tenant moving in, including maintenance and readiness tasks. |
| **Work Order** | Maintenance ticket linked to a property/unit, with lifecycle statuses (New, Scheduled, In Progress, etc.). |
| **Owner Statement** | Periodic report summarizing income, expenses, distributions, and key metrics for a property's ownership entity. |
| **Resident Portal** | Future-facing web experience for tenants to view leases, pay rent, and submit maintenance requests. |
| **Owner Portal** | Planned experience for investors/owners to monitor property performance, distributions, and statements. |
| **Lease Charge** | Individual billable item tied to a lease (rent, utility, late fee, deposit, etc.). |
| **Payment Status** | Business rule stating that only `Completed` payments contribute to collected totals. |
| **Workspace** | Tenant-level context that scopes all queries and data in the Twenty platform. |
| **Metadata Object** | Custom object defined through Twenty's data model UI (e.g., Property, Unit). Accessed through shared metadata APIs rather than direct ORM entities. |
