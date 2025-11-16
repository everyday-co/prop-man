import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { AppPath } from 'twenty-shared/types';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const ConvertApplicationToLeaseAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const recordId = useSelectedRecordIdOrThrow();

  const navigate = useNavigateApp();

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const handleClick = () => {
    if (!isDefined(selectedRecord)) {
      return;
    }

    // Extract data from application
    const propertyId = selectedRecord?.property?.id;
    const unitId = selectedRecord?.unit?.id;
    const applicantId = selectedRecord?.applicant?.id;
    const desiredMoveInDate = selectedRecord?.desiredMoveInDate;

    // Navigate to lease creation with query params
    navigate(
      AppPath.PmRecordIndexPage,
      {
        objectNamePlural: 'leases',
      },
      {
        fromApplicationId: recordId,
        ...(propertyId && { propertyId }),
        ...(unitId && { unitId }),
        ...(applicantId && { tenantIds: applicantId }),
        ...(desiredMoveInDate && { startDate: desiredMoveInDate }),
      },
    );
  };

  return <Action onClick={handleClick} />;
};

