import { CancelShowingAction } from '@/action-menu/actions/record-actions/single-record/components/CancelShowingAction';
import { CreateApplicationFromShowingAction } from '@/action-menu/actions/record-actions/single-record/components/CreateApplicationFromShowingAction';
import { MarkCompleteShowingAction } from '@/action-menu/actions/record-actions/single-record/components/MarkCompleteShowingAction';
import { RescheduleShowingAction } from '@/action-menu/actions/record-actions/single-record/components/RescheduleShowingAction';
import { inheritActionsFromDefaultConfig } from '@/action-menu/actions/record-actions/utils/inheritActionsFromDefaultConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCalendar,
  IconCheck,
  IconFileText,
  IconX,
} from 'twenty-ui/display';

export enum ShowingActionKeys {
  MARK_COMPLETE = 'mark-complete-showing',
  CANCEL = 'cancel-showing',
  RESCHEDULE = 'reschedule-showing',
  CREATE_APPLICATION = 'create-application-from-showing',
}

export const SHOWING_ACTIONS_CONFIG = inheritActionsFromDefaultConfig({
  config: {
    [ShowingActionKeys.MARK_COMPLETE]: {
      key: ShowingActionKeys.MARK_COMPLETE,
      label: msg`Mark Complete`,
      shortLabel: msg`Complete`,
      isPinned: true,
      position: 10,
      Icon: IconCheck,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord }) =>
        isDefined(selectedRecord) &&
        !selectedRecord?.isRemote &&
        !isDefined(selectedRecord?.deletedAt) &&
        selectedRecord?.status !== 'Completed' &&
        selectedRecord?.status !== 'Cancelled',
      availableOn: [ActionViewType.SHOW_PAGE],
      component: <MarkCompleteShowingAction />,
    },
    [ShowingActionKeys.CANCEL]: {
      key: ShowingActionKeys.CANCEL,
      label: msg`Cancel Showing`,
      shortLabel: msg`Cancel`,
      isPinned: true,
      position: 11,
      Icon: IconX,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord }) =>
        isDefined(selectedRecord) &&
        !selectedRecord?.isRemote &&
        !isDefined(selectedRecord?.deletedAt) &&
        selectedRecord?.status !== 'Completed' &&
        selectedRecord?.status !== 'Cancelled',
      availableOn: [ActionViewType.SHOW_PAGE],
      component: <CancelShowingAction />,
    },
    [ShowingActionKeys.RESCHEDULE]: {
      key: ShowingActionKeys.RESCHEDULE,
      label: msg`Reschedule Showing`,
      shortLabel: msg`Reschedule`,
      isPinned: true,
      position: 12,
      Icon: IconCalendar,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord }) =>
        isDefined(selectedRecord) &&
        !selectedRecord?.isRemote &&
        !isDefined(selectedRecord?.deletedAt) &&
        selectedRecord?.status !== 'Completed' &&
        selectedRecord?.status !== 'Cancelled',
      availableOn: [ActionViewType.SHOW_PAGE],
      component: <RescheduleShowingAction />,
    },
    [ShowingActionKeys.CREATE_APPLICATION]: {
      key: ShowingActionKeys.CREATE_APPLICATION,
      label: msg`Create Application`,
      shortLabel: msg`Create App`,
      isPinned: true,
      position: 13,
      Icon: IconFileText,
      type: ActionType.Standard,
      scope: ActionScope.RecordSelection,
      shouldBeRegistered: ({ selectedRecord }) =>
        isDefined(selectedRecord) &&
        !selectedRecord?.isRemote &&
        !isDefined(selectedRecord?.deletedAt) &&
        selectedRecord?.status === 'Completed',
      availableOn: [ActionViewType.SHOW_PAGE],
      component: <CreateApplicationFromShowingAction />,
    },
  },
  actionKeys: [],
  propertiesToOverwrite: {},
});

