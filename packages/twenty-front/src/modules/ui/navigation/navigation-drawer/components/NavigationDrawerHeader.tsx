import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { AppModeSwitcher } from '@/navigation/components/AppModeSwitcher';
import { MultiWorkspaceDropdownButton } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/MultiWorkspaceDropdownButton';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { PAGE_BAR_MIN_HEIGHT } from '@/ui/layout/page/constants/PageBarMinHeight';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { NavigationDrawerCollapseButton } from './NavigationDrawerCollapseButton';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  user-select: none;
  padding-right: ${({ theme }) => theme.spacing(2)};
  min-height: ${PAGE_BAR_MIN_HEIGHT}px;
`;

const StyledNavigationDrawerCollapseButton = styled(
  NavigationDrawerCollapseButton,
)<{ show?: boolean }>`
  height: ${({ theme }) => theme.spacing(4)};
  margin-left: auto;
  opacity: ${({ show }) => (show ? 1 : 0)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  transition: opacity ${({ theme }) => theme.animation.duration.normal}s;
  width: ${({ theme }) => theme.spacing(4)};
`;

const StyledAppModeSwitcher = styled(AppModeSwitcher)`
  flex: 1;
  margin-left: ${({ theme }) => theme.spacing(1)};
  max-width: 220px;
`;

type NavigationDrawerHeaderProps = {
  showCollapseButton: boolean;
};

export const NavigationDrawerHeader = ({
  showCollapseButton,
}: NavigationDrawerHeaderProps) => {
  const isMobile = useIsMobile();

  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );

  return (
    <StyledContainer>
      <MultiWorkspaceDropdownButton />
      {!isMobile && isNavigationDrawerExpanded && <StyledAppModeSwitcher />}
      {!isMobile && isNavigationDrawerExpanded && (
        <StyledNavigationDrawerCollapseButton
          direction="left"
          show={showCollapseButton}
        />
      )}
    </StyledContainer>
  );
};
