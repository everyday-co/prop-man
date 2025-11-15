import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';

import {
  activeAppState,
  type ActiveApp,
} from '@/navigation/states/activeAppState';
import { lastVisitedAppRoutesState } from '@/navigation/states/lastVisitedAppRoutesState';

const buildFullPath = (pathname: string, search: string, hash: string) =>
  `${pathname}${search}${hash}`;

const deriveAppFromPath = (pathname: string): ActiveApp =>
  pathname.startsWith('/pm') ? 'PM' : 'CRM';

export const AppModeSyncEffect = () => {
  const location = useLocation();
  const [activeApp, setActiveApp] = useRecoilState(activeAppState);
  const setLastVisitedRoutes = useSetRecoilState(lastVisitedAppRoutesState);

  useEffect(() => {
    const nextApp = deriveAppFromPath(location.pathname);
    const fullPath = buildFullPath(
      location.pathname,
      location.search,
      location.hash,
    );

    setLastVisitedRoutes((previous) =>
      nextApp === 'CRM'
        ? { ...previous, crm: fullPath }
        : { ...previous, pm: fullPath },
    );

    if (nextApp !== activeApp) {
      setActiveApp(nextApp);
    }
  }, [
    activeApp,
    location.hash,
    location.pathname,
    location.search,
    setActiveApp,
    setLastVisitedRoutes,
  ]);

  return null;
};
