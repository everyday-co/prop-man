import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordIndexContainerGater } from '@/object-record/record-index/components/RecordIndexContainerGater';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { isUndefined } from '@sniptt/guards';

export const PMTenantsPage = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  // Find People object metadata
  const peopleObjectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === 'person',
  );

  const setContextStoreCurrentObjectMetadataItemId =
    useSetRecoilComponentState(
      contextStoreCurrentObjectMetadataItemIdComponentState,
    );

  const setCurrentRecordFilters = useSetRecoilComponentState(
    currentRecordFiltersComponentState,
  );

  // Set the People object as current in context store
  useEffect(() => {
    if (peopleObjectMetadataItem) {
      setContextStoreCurrentObjectMetadataItemId(peopleObjectMetadataItem.id);
    }
  }, [peopleObjectMetadataItem, setContextStoreCurrentObjectMetadataItemId]);

  // Set filter to only show people who are tenants
  // This filters by a select field "personType" (or "role") with value "Tenant"
  // The field must be added to the Person object via the metadata UI
  useEffect(() => {
    if (!peopleObjectMetadataItem) return;

    // Find the personType or role field
    const personTypeField = peopleObjectMetadataItem.fields?.find(
      (field) =>
        (field.name === 'personType' || field.name === 'role') &&
        field.type === 'SELECT',
    );

    if (personTypeField) {
      // Create a filter that filters People by personType = "Tenant"
      const filter: RecordFilter = {
        id: uuidv4(),
        fieldMetadataId: personTypeField.id,
        operand: RecordFilterOperand.IS,
        value: 'Tenant', // The select option value for tenants
        displayValue: 'Tenant',
        type: 'SELECT',
        label: personTypeField.label,
      };

      setCurrentRecordFilters([filter]);
    } else {
      // If the field doesn't exist, show all people (no filter)
      // This allows the user to see all people until they add the field
      setCurrentRecordFilters([]);
    }
  }, [peopleObjectMetadataItem, setCurrentRecordFilters]);

  if (isUndefined(peopleObjectMetadataItem)) {
    return <></>;
  }

  return (
    <PageContainer>
      <ContextStoreComponentInstanceContext.Provider
        value={{
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }}
      >
        <RecordIndexContainerGater />
      </ContextStoreComponentInstanceContext.Provider>
    </PageContainer>
  );
};

