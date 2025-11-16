import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { AppModeSwitcher } from '@/navigation/components/AppModeSwitcher';
import { MainNavigationDrawerFixedItems } from '@/navigation/components/MainNavigationDrawerFixedItems';
import { PMNavigation } from '@/property-management/components/PMNavigation';
import { SupportDropdown } from '@/support/components/SupportDropdown';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';

const StyledAppModeSwitcher = styled(AppModeSwitcher)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  max-width: 100%;
`;

export const PropertyManagementNavigationDrawer = ({
  className,
}: {
  className?: string;
}) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );

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
        {!isMobile && isNavigationDrawerExpanded && (
          <StyledAppModeSwitcher />
        )}
        <SupportDropdown />
      </NavigationDrawerFixedContent>
    </NavigationDrawer>
  );
};
