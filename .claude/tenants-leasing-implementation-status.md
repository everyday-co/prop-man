# Tenants & Leasing Section - Implementation Status

## Completed ✅

1. **Extended `scripts/create-pm-objects.ts`**
   - Added Applications object creation with all fields and relations
   - Added Showings object creation with all fields and relations
   - Added support for relation field creation with `relationCreationPayload`
   - Added `getObjectMetadataId()` helper to query existing objects
   - Script now creates: Property, Applications, Showings

2. **Updated Navigation (`PMNavigation.tsx`)**
   - Removed `soon: true` from Applications, Tenants, Showings nav items
   - Added routes using `PmRecordIndexPage` with appropriate `objectNamePlural`
   - Tenants routes to `/pm/objects/people`
   - Applications routes to `/pm/objects/applications`
   - Showings routes to `/pm/objects/showings`

3. **Added Routes (`useCreateAppRouter.tsx`)**
   - Added redirect routes for `/pm/tenants` → `/pm/objects/people`
   - Added redirect routes for `/pm/applications` → `/pm/objects/applications`
   - Added redirect routes for `/pm/showings` → `/pm/objects/showings`
   - Created custom `PMTenantsPage` component for tenant filtering

4. **Added AppPath Enums (`AppPath.ts`)**
   - Added `PmTenants = '/pm/tenants'`
   - Added `PmApplications = '/pm/applications'`
   - Added `PmShowings = '/pm/showings'`

5. **Created PMTenantsPage (`PMTenantsPage.tsx`)**
   - Custom page component that filters People by `personType = "Tenant"`
   - Automatically detects `personType` or `role` SELECT field
   - Uses standard RecordFilter system for reliable filtering
   - Gracefully handles missing field (shows all people)

6. **Added Person Type Field (Manual UI - Completed)**
   - Added SELECT field to People object via metadata UI
   - Field options: Tenant, Vendor, Investor, Owner, Other
   - Set all tenant records to `personType = "Tenant"`

7. **Updated Documentation (`docs/epics-everyday-crm-pm.md`)**
   - Updated EPIC 3 with complete workflow details
   - Added "Showing to Application to Lease" workflow
   - Added "Tenant Directory" workflow
   - Documented data model objects (Application, Showing, Tenants)

## Remaining Work 🔨

### 1. Test Tenants Page ✅
- Navigate to `/pm/tenants` or click "Tenants" in PM navigation
- Verify that only people with `personType = "Tenant"` are shown
- Verify that the filter is applied correctly
- Test that non-tenants are excluded from the view

**Applications Views:**
- Navigate to `/pm/objects/applications`
- Create saved views:
  - "All Applications" (default)
  - "Pending Review" (status = Submitted OR Under Review)
  - "Approved" (status = Approved)
  - "Rejected" (status = Rejected)

**Showings Views:**
- Navigate to `/pm/objects/showings`
- Create saved views:
  - "All Showings" (default)
  - "Upcoming" (scheduledDate >= today AND status = Scheduled)
  - "Today's Showings" (scheduledDate = today AND status = Scheduled)
  - "Completed" (status = Completed)

### 2. Custom Action Buttons (Code Implementation) ✅

**Application Detail Page Actions:**
- ✅ Created `ApplicationActionsConfig.tsx` in `packages/twenty-front/src/modules/action-menu/actions/record-actions/constants/`
- ✅ Added actions:
  - **Approve**: Update status to "Approved", set decisionDate ✅
  - **Reject**: Update status to "Rejected", set decisionDate, prompt for decisionNotes ✅
  - **Convert to Lease**: Navigate to lease creation with query params ✅
- ✅ Registered in `getActionConfig.ts` for `objectMetadataItem.nameSingular === 'application'`

**Showing Detail Page Actions:**
- ✅ Created `ShowingActionsConfig.tsx` in same location
- ✅ Added actions:
  - **Mark Complete**: Update status to "Completed", prompt for notes and prospectInterest ✅
  - **Cancel**: Update status to "Cancelled" ✅
  - **Reschedule**: Update scheduledDate, set status to "Rescheduled" ✅
  - **Create Application**: Navigate to application creation with query params ✅
- ✅ Registered in `getActionConfig.ts` for `objectMetadataItem.nameSingular === 'showing'`

### 3. Workflow Implementations (Navigation Complete, Form Pre-population Pending)

**Convert Application to Lease Workflow:**
- ✅ Created action component: `ConvertApplicationToLeaseAction.tsx`
- ✅ On click, navigates to `/pm/objects/leases` with query params:
  - `fromApplicationId=<applicationId>`
  - `propertyId=<application.property.id>`
  - `unitId=<application.unit.id>` (if exists)
  - `tenantIds=<application.applicant.id>`
  - `startDate=<application.desiredMoveInDate>`
- ⏳ **Pending**: Lease creation form should read query params and pre-populate fields
- ⏳ **Pending**: On lease save, update Application:
  - Set `relatedLease` relation to new lease
  - Set `status` to "Approved" (if not already)
- Uses `useUpdateOneRecord` hook with multi-tenant awareness

**Create Application from Showing Workflow:**
- ✅ Created action component: `CreateApplicationFromShowingAction.tsx`
- ✅ On click, navigates to `/pm/objects/applications` with query params:
  - `fromShowingId=<showingId>`
  - `applicantId=<showing.prospect.id>`
  - `propertyId=<showing.property.id>`
  - `unitId=<showing.unit.id>` (if exists)
- ⏳ **Pending**: Application creation form should read query params and pre-populate fields
- ⏳ **Pending**: On application save, update Showing:
  - Set `relatedApplication` relation to new application
  - Optionally set `prospectInterest` to "High" if not already set

### 4. Form Pre-population

**Lease Creation Form:**
- Update lease creation form to read query params
- Pre-populate: property, unit, tenants, startDate from query params
- Handle `fromApplicationId` to show context

**Application Creation Form:**
- Update application creation form to read query params
- Pre-populate: applicant, property, unit, desiredMoveInDate from query params
- Handle `fromShowingId` to show context

### 5. GraphQL Type Generation

After running `scripts/create-pm-objects.ts`:
```bash
npx nx run twenty-front:graphql:generate
```

Verify new objects appear in generated types.

### 6. Testing

**Unit Tests:**
- Test relation-aware filters for tenant filtering
- Test application status transition mutations
- Test showing status updates
- Test query param parsing for workflow pre-population

**Integration Tests:**
- Test "Create Application from Showing" workflow
- Test "Convert Application to Lease" workflow
- Test tenant filtering queries with relation filters

**UI Tests:**
- Test PMNavigation renders Applications/Tenants/Showings without "Soon" badges
- Test navigation links route correctly
- Test detail page action buttons

**Backend Tests:**
- Test application status mutation resolvers
- Test showing status mutation resolvers
- Test relation updates (application → lease, showing → application)
- Test multi-tenant isolation

## Next Steps

1. Run `scripts/create-pm-objects.ts` to create Applications and Showings objects
2. Create saved views via UI (see section 1 above)
3. Implement custom action buttons (see section 2 above)
4. Implement workflows (see section 3 above)
5. Update forms to handle query params (see section 4 above)
6. Run GraphQL codegen
7. Add tests

## Notes

- **Tenants Filtering**: We use a `personType` select field on the People object to filter tenants. This is simpler than relation-based filtering and allows for future expansion (vendors, investors, etc.). The field must be added via the metadata UI before the Tenants page will filter correctly.
- Custom action buttons require creating action configs and registering them in `getActionConfig.ts`
- Workflows use query params to pass data between forms, which is a standard pattern in Twenty
- Relation updates should use existing `useUpdateOneRecord` hooks with proper workspace scoping
- The People object can be used for both CRM contacts and PM tenants/vendors/investors by categorizing them with the `personType` field

