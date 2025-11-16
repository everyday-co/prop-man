import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const MarkCompleteShowingAction = () => {
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

    // Prompt for notes and prospect interest (for now, just set defaults - can be enhanced with a modal)
    const notes = prompt('Add notes about the showing:') || '';
    const prospectInterest = prompt('Prospect interest level (High/Medium/Low/Not_Interested):') || 'Medium';

    await updateOneRecord?.({
      idToUpdate: recordId,
      updateOneRecordInput: {
        status: 'Completed',
        ...(notes && { notes }),
        ...(prospectInterest && { prospectInterest }),
      },
    });
  };

  return <Action onClick={handleClick} />;
};

