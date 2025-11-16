import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { AppPath } from 'twenty-shared/types';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const CreateApplicationFromShowingAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const recordId = useSelectedRecordIdOrThrow();

  const navigate = useNavigateApp();

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const handleClick = () => {
    if (!isDefined(selectedRecord)) {
      return;
    }

    // Extract data from showing
    const propertyId = selectedRecord?.property?.id;
    const unitId = selectedRecord?.unit?.id;
    const prospectId = selectedRecord?.prospect?.id;

    // Navigate to application creation with query params
    navigate(
      AppPath.PmRecordIndexPage,
      {
        objectNamePlural: 'applications',
      },
      {
        fromShowingId: recordId,
        ...(prospectId && { applicantId: prospectId }),
        ...(propertyId && { propertyId }),
        ...(unitId && { unitId }),
      },
    );
  };

  return <Action onClick={handleClick} />;
};

