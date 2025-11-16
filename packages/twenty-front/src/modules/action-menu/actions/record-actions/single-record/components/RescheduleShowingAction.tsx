import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const RescheduleShowingAction = () => {
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

    // Prompt for new scheduled date (for now, just set status - can be enhanced with a date picker modal)
    const newDate = prompt('Enter new scheduled date (YYYY-MM-DD):');

    if (!newDate) {
      return;
    }

    // Convert date to ISO datetime format
    const scheduledDateTime = `${newDate}T10:00:00.000Z`;

    await updateOneRecord?.({
      idToUpdate: recordId,
      updateOneRecordInput: {
        status: 'Rescheduled',
        scheduledDate: scheduledDateTime,
      },
    });
  };

  return <Action onClick={handleClick} />;
};

