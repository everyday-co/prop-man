import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { MainNavigationDrawerFixedItems } from '@/navigation/components/MainNavigationDrawerFixedItems';
import { PMNavigation } from '@/property-management/components/PMNavigation';
import { SupportDropdown } from '@/support/components/SupportDropdown';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';

export const PropertyManagementNavigationDrawer = ({
  className,
}: {
  className?: string;
}) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  return (
    <NavigationDrawer
      className={className}
      title={currentWorkspace?.displayName ?? ''}
    >
      <NavigationDrawerFixedContent>
        <MainNavigationDrawerFixedItems />
      </NavigationDrawerFixedContent>
      <NavigationDrawerScrollableContent>
        <PMNavigation />
      </NavigationDrawerScrollableContent>
      <NavigationDrawerFixedContent>
        <SupportDropdown />
      </NavigationDrawerFixedContent>
    </NavigationDrawer>
  );
};
