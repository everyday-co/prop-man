import { useRecoilValue } from 'recoil';

import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { PropertyManagementNavigationDrawer } from '@/property-management/components/PropertyManagementNavigationDrawer';
import { activeAppState } from '@/navigation/states/activeAppState';

import { MainNavigationDrawer } from '@/navigation/components/MainNavigationDrawer';
import { SettingsNavigationDrawer } from '@/navigation/components/SettingsNavigationDrawer';

export type AppNavigationDrawerProps = {
  className?: string;
};

export const AppNavigationDrawer = ({
  className,
}: AppNavigationDrawerProps) => {
  const isSettingsDrawer = useIsSettingsDrawer();
  const activeApp = useRecoilValue(activeAppState);

  return isSettingsDrawer ? (
    <SettingsNavigationDrawer className={className} />
  ) : activeApp === 'PM' ? (
    <PropertyManagementNavigationDrawer className={className} />
  ) : (
    <MainNavigationDrawer className={className} />
  );
};
