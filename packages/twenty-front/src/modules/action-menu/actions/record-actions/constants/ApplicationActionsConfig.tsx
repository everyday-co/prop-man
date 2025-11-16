import { ApproveApplicationAction } from '@/action-menu/actions/record-actions/single-record/components/ApproveApplicationAction';
import { ConvertApplicationToLeaseAction } from '@/action-menu/actions/record-actions/single-record/components/ConvertApplicationToLeaseAction';
import { RejectApplicationAction } from '@/action-menu/actions/record-actions/single-record/components/RejectApplicationAction';
import { inheritActionsFromDefaultConfig } from '@/action-menu/actions/record-actions/utils/inheritActionsFromDefaultConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCheck,
  IconFileText,
  IconX,
} from 'twenty-ui/display';

export enum ApplicationActionKeys {
  APPROVE = 'approve-application',
  REJECT = 'reject-application',
  CONVERT_TO_LEASE = 'convert-application-to-lease',
}

export const APPLICATION_ACTIONS_CONFIG = inheritActionsFromDefaultConfig({
  config: {
    [ApplicationActionKeys.APPROVE]: {
      key: ApplicationActionKeys.APPROVE,
      label: msg`Approve Application`,
      shortLabel: msg`Approve`,
      isPinned: true,
      position: 10,
      Icon: IconCheck,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord }) =>
        isDefined(selectedRecord) &&
        !selectedRecord?.isRemote &&
        !isDefined(selectedRecord?.deletedAt) &&
        selectedRecord?.status !== 'Approved' &&
        selectedRecord?.status !== 'Rejected',
      availableOn: [ActionViewType.SHOW_PAGE],
      component: <ApproveApplicationAction />,
    },
    [ApplicationActionKeys.REJECT]: {
      key: ApplicationActionKeys.REJECT,
      label: msg`Reject Application`,
      shortLabel: msg`Reject`,
      isPinned: true,
      position: 11,
      Icon: IconX,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord }) =>
        isDefined(selectedRecord) &&
        !selectedRecord?.isRemote &&
        !isDefined(selectedRecord?.deletedAt) &&
        selectedRecord?.status !== 'Approved' &&
        selectedRecord?.status !== 'Rejected',
      availableOn: [ActionViewType.SHOW_PAGE],
      component: <RejectApplicationAction />,
    },
    [ApplicationActionKeys.CONVERT_TO_LEASE]: {
      key: ApplicationActionKeys.CONVERT_TO_LEASE,
      label: msg`Convert to Lease`,
      shortLabel: msg`Convert`,
      isPinned: true,
      position: 12,
      Icon: IconFileText,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord }) =>
        isDefined(selectedRecord) &&
        !selectedRecord?.isRemote &&
        !isDefined(selectedRecord?.deletedAt) &&
        selectedRecord?.status === 'Approved',
      availableOn: [ActionViewType.SHOW_PAGE],
      component: <ConvertApplicationToLeaseAction />,
    },
  },
  actionKeys: [],
  propertiesToOverwrite: {},
});

