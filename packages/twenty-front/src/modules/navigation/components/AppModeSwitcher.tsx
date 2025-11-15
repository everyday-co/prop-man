import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';

import {
  activeAppState,
  type ActiveApp,
} from '@/navigation/states/activeAppState';
import {
  lastVisitedAppRoutesState,
  type LastVisitedAppRoutes,
} from '@/navigation/states/lastVisitedAppRoutesState';

const StyledSwitcher = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledAppButton = styled.button<{ active: boolean }>`
  background: ${({ active, theme }) =>
    active ? theme.background.primary : 'transparent'};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ active, theme }) =>
    active ? theme.font.color.primary : theme.font.color.light};
  cursor: pointer;
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding: ${({ theme }) => theme.spacing(1)};
  transition: background ${({ theme }) => theme.animation.duration.fast}s;

  &:hover {
    background: ${({ active, theme }) =>
      active ? theme.background.primary : theme.background.tertiary};
  }
`;

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

export const AppModeSwitcher = () => {
  const navigate = useNavigate();
  const [activeApp, setActiveApp] = useRecoilState(activeAppState);
  const lastVisitedAppRoutes = useRecoilValue(lastVisitedAppRoutesState);

  const handleChange = (nextApp: ActiveApp) => {
    if (nextApp === activeApp) {
      return;
    }

    setActiveApp(nextApp);
    const target = getRouteForApp(nextApp, lastVisitedAppRoutes);
    navigate(target);
  };

  return (
    <StyledSwitcher>
      <StyledAppButton
        type="button"
        active={activeApp === 'CRM'}
        onClick={() => handleChange('CRM')}
      >
        CRM
      </StyledAppButton>
      <StyledAppButton
        type="button"
        active={activeApp === 'PM'}
        onClick={() => handleChange('PM')}
      >
        Property Mgmt
      </StyledAppButton>
    </StyledSwitcher>
  );
};
