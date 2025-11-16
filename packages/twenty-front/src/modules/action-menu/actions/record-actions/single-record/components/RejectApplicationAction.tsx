import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const RejectApplicationAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const recordId = useSelectedRecordIdOrThrow();

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const handleClick = async () => {
    if (!isDefined(selectedRecord)) {
      return;
    }

    // Prompt for decision notes (for now, just set empty string - can be enhanced with a modal)
    const decisionNotes = prompt('Please provide reason for rejection:') || '';

    const today = new Date().toISOString().split('T')[0];

    await updateOneRecord?.({
      idToUpdate: recordId,
      updateOneRecordInput: {
        status: 'Rejected',
        decisionDate: today,
        decisionNotes: decisionNotes,
      },
    });
  };

  return <Action onClick={handleClick} />;
};

