import { atom } from 'recoil';

import { localStorageEffect } from '~/utils/recoil-effects';

export type ActiveApp = 'CRM' | 'PM';

export const activeAppState = atom<ActiveApp>({
  key: 'activeAppState',
  default: 'CRM',
  effects: [localStorageEffect()],
});
