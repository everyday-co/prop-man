import { atom } from 'recoil';

import indexAppPath from '@/navigation/utils/indexAppPath';
import { localStorageEffect } from '~/utils/recoil-effects';

const PM_DEFAULT_ROUTE = '/pm/dashboard';

export type LastVisitedAppRoutes = {
  crm: string;
  pm: string;
};

export const lastVisitedAppRoutesState = atom<LastVisitedAppRoutes>({
  key: 'lastVisitedAppRoutesState',
  default: {
    crm: indexAppPath.getIndexAppPath(),
    pm: PM_DEFAULT_ROUTE,
  },
  effects: [localStorageEffect()],
});
