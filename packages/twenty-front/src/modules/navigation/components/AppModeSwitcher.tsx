import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { msg } from '@lingui/core/macro';

import {
  activeAppState,
  type ActiveApp,
} from '@/navigation/states/activeAppState';
import {
  lastVisitedAppRoutesState,
  type LastVisitedAppRoutes,
} from '@/navigation/states/lastVisitedAppRoutesState';
import { MenuItemHotKeys } from 'twenty-ui/navigation/menu/menu-item/components/MenuItemHotKeys';
import { IconArrowUpRight } from 'twenty-ui/display';

const DEFAULT_ROUTES: LastVisitedAppRoutes = {
  crm: '/',
  pm: '/pm/dashboard',
};

const getRouteForApp = (
  app: ActiveApp,
  routes: LastVisitedAppRoutes,
): string => {
  if (app === 'CRM') {
    return routes.crm || DEFAULT_ROUTES.crm;
  }

  return routes.pm || DEFAULT_ROUTES.pm;
};

const StyledSwitcher = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1)};
  width: 100%;
  transition: background ${({ theme }) => theme.animation.duration.fast}s;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledIconContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-shrink: 0;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(0.5)};
  width: ${({ theme }) => theme.spacing(4)};
  box-sizing: border-box;
`;

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  text-align: left;
  white-space: nowrap;
`;

export const AppModeSwitcher = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeApp, setActiveApp] = useRecoilState(activeAppState);
  const lastVisitedAppRoutes = useRecoilValue(lastVisitedAppRoutesState);

  const handleClick = () => {
    const nextApp: ActiveApp = activeApp === 'CRM' ? 'PM' : 'CRM';
    setActiveApp(nextApp);
    const target = getRouteForApp(nextApp, lastVisitedAppRoutes);
    navigate(target);
  };

  const label = activeApp === 'CRM' ? msg`Go to Property Mgmt` : msg`Go to CRM`;
  const hotKeys = activeApp === 'CRM' ? ['G', 'P'] : ['G', 'C'];

  return (
    <StyledSwitcher type="button" onClick={handleClick}>
      <StyledIconContainer>
        <IconArrowUpRight
          size={16}
          color={theme.font.color.tertiary}
          stroke={theme.icon.stroke.sm}
        />
      </StyledIconContainer>
      <StyledContent>
        <StyledLabel>{label}</StyledLabel>
        <MenuItemHotKeys hotKeys={hotKeys} />
      </StyledContent>
    </StyledSwitcher>
  );
};
