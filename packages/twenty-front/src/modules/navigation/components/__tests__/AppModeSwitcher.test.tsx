import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { type MutableSnapshot, RecoilRoot } from 'recoil';

import { AppModeSwitcher } from '../AppModeSwitcher';
import { activeAppState } from '@/navigation/states/activeAppState';
import { lastVisitedAppRoutesState } from '@/navigation/states/lastVisitedAppRoutesState';
import { BaseThemeProvider } from '@/ui/theme/components/BaseThemeProvider';

const navigateMock = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigateMock,
}));

const renderSwitcher = (
  initializeState?: (snapshot: MutableSnapshot) => void,
) =>
  render(
    <MemoryRouter>
      <RecoilRoot initializeState={initializeState}>
        <BaseThemeProvider>
          <AppModeSwitcher />
        </BaseThemeProvider>
      </RecoilRoot>
    </MemoryRouter>,
  );

describe('AppModeSwitcher', () => {
  beforeEach(() => {
    navigateMock.mockClear();
  });

  it('navigates to the PM default route when switching from CRM', () => {
    renderSwitcher(({ set }) => {
      set(activeAppState, 'CRM');
      set(lastVisitedAppRoutesState, {
        crm: '/crm/opportunities',
        pm: '/pm/dashboard',
      });
    });

    fireEvent.click(screen.getByRole('button', { name: /Property Mgmt/i }));

    expect(navigateMock).toHaveBeenCalledWith('/pm/dashboard');
  });

  it('does not navigate when selecting the already active app', () => {
    renderSwitcher(({ set }) => {
      set(activeAppState, 'PM');
      set(lastVisitedAppRoutesState, {
        crm: '/crm/people',
        pm: '/pm/dashboard',
      });
    });

    fireEvent.click(screen.getByRole('button', { name: /Property Mgmt/i }));

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
