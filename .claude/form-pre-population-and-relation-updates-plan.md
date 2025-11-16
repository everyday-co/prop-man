# Form Pre-population and Relation Updates Implementation Plan

## Overview
Complete the workflow implementations for "Convert Application to Lease" and "Create Application from Showing" by:
1. Reading query params and pre-populating forms when creating records
2. Updating related records after successful creation
3. Handling edge cases and error scenarios

## Implementation Steps

### 1. Create Query Params Hook for Record Input

**File**: `packages/twenty-front/src/modules/object-record/record-table/hooks/useBuildRecordInputFromQueryParams.ts`

Create a new hook that:
- Reads query params using `useSearchParams` from react-router-dom
- Maps query param names to field names (e.g., `propertyId` → `propertyId`, `applicantId` → `applicantId`)
- Handles relation fields (MANY_TO_ONE) by setting the foreign key field (`{fieldName}Id`)
- Handles date fields (converts string dates to proper format)
- Returns a `Partial<ObjectRecord>` that can be merged with filter-based input

**Key mappings needed**:
- For Lease creation: `propertyId`, `unitId`, `tenantIds` (array), `startDate`, `fromApplicationId`
- For Application creation: `applicantId`, `propertyId`, `unitId`, `desiredMoveInDate`, `fromShowingId`

### 2. Extend useCreateNewIndexRecord Hook

**File**: `packages/twenty-front/src/modules/object-record/record-table/hooks/useCreateNewIndexRecord.ts`

Modify to:
- Import and use `useBuildRecordInputFromQueryParams`
- Merge query param input with filter-based input: `{...recordInputFromFilters, ...recordInputFromQueryParams, ...recordInput}`
- Ensure query params take precedence over filters, and explicit `recordInput` takes precedence over both

### 3. Create Post-Creation Relation Update Hook

**File**: `packages/twenty-front/src/modules/property-management/hooks/useUpdateRelatedRecordAfterCreation.ts`

Create a hook that:
- Takes the created record ID, object name, and query params
- Checks for `fromApplicationId` or `fromShowingId` in query params
- Updates the related record using `useUpdateOneRecord`:
  - For Lease: Update Application with `relatedLease` relation and set `status` to "Approved"
  - For Application: Update Showing with `relatedApplication` relation and optionally set `prospectInterest` to "High"

### 4. Integrate Relation Updates into Record Creation

**File**: `packages/twenty-front/src/modules/object-record/record-table/hooks/useCreateNewIndexRecord.ts`

Add:
- Call to `useUpdateRelatedRecordAfterCreation` after successful record creation
- Handle errors gracefully (log but don't fail the creation)
- Use async/await pattern

### 5. Handle Query Params in RecordIndexPage

**File**: `packages/twenty-front/src/pages/object-record/RecordIndexPage.tsx`

Ensure query params are available when creating records:
- Query params are already accessible via `useSearchParams` in child components
- No changes needed if `useCreateNewIndexRecord` is used from RecordTable context

### 6. Update Action Components (Optional Enhancement)

**Files**:
- `packages/twenty-front/src/modules/action-menu/actions/record-actions/single-record/components/ConvertApplicationToLeaseAction.tsx`
- `packages/twenty-front/src/modules/action-menu/actions/record-actions/single-record/components/CreateApplicationFromShowingAction.tsx`

Consider:
- Adding a loading state while navigation happens
- Showing a toast notification after successful creation and relation update
- This is optional and can be done later

## Technical Details

### Query Param Format
- Single IDs: `propertyId=123`, `unitId=456`
- Array IDs: `tenantIds=789` (single value, but could be comma-separated for multiple)
- Dates: `startDate=2024-01-15` (ISO date string)
- Source tracking: `fromApplicationId=abc`, `fromShowingId=xyz`

### Field Name Mappings
- Lease: `propertyId` → `propertyId`, `unitId` → `unitId`, `tenantIds` → `tenants` (MANY_TO_MANY, handled differently)
- Application: `applicantId` → `applicantId`, `propertyId` → `propertyId`, `unitId` → `unitId`

### Relation Update Logic
- For MANY_TO_ONE relations: Set `{fieldName}Id` field
- For MANY_TO_MANY relations (tenants on lease): Use `useRecordOneToManyFieldAttachTargetRecord` or direct mutation
- Status updates: Use `useUpdateOneRecord` with status field

## Testing Considerations

1. **Unit Tests**:
   - Test `useBuildRecordInputFromQueryParams` with various query param combinations
   - Test relation update hook with valid/invalid IDs
   - Test error handling

2. **Integration Tests**:
   - Test full workflow: Click action → Navigate → Create record → Update relation
   - Test with missing query params (should still work)
   - Test with invalid IDs (should handle gracefully)

3. **Manual Testing**:
   - Verify forms pre-populate correctly
   - Verify relations are updated after creation
   - Test error scenarios (network failures, invalid IDs)

## Files to Create/Modify

**New Files**:
1. `packages/twenty-front/src/modules/object-record/record-table/hooks/useBuildRecordInputFromQueryParams.ts`
2. `packages/twenty-front/src/modules/property-management/hooks/useUpdateRelatedRecordAfterCreation.ts`

**Modified Files**:
1. `packages/twenty-front/src/modules/object-record/record-table/hooks/useCreateNewIndexRecord.ts`
2. Potentially action components for enhanced UX (optional)

## Dependencies

- `react-router-dom` for `useSearchParams`
- `useUpdateOneRecord` hook for relation updates
- `useCreateOneRecord` hook (already used)
- Object metadata items for field name resolution

