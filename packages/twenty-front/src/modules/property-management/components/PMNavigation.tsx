import styled from '@emotion/styled';

import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import {
  IconBox,
  IconBuildingSkyscraper,
  IconCalendar,
  IconChartBar,
  IconCoins,
  IconCreditCard,
  IconFileText,
  IconGauge,
  IconHome,
  IconKey,
  IconLayoutDashboard,
  IconListCheck,
  IconMoneybag,
  IconNotes,
  IconTarget,
  IconTool,
  IconUsers,
  type IconComponent,
} from 'twenty-ui/display';

type NavItem = {
  label: string;
  Icon: IconComponent;
  to?: string;
  soon?: boolean;
};

// Dashboard Section
const dashboardItems: NavItem[] = [
  {
    label: 'Portfolio',
    to: getAppPath(AppPath.PmDashboard),
    Icon: IconLayoutDashboard,
  },
];

// Core Data Section
const coreDataItems: NavItem[] = [
  {
    label: 'Properties',
    to: getAppPath(AppPath.PmRecordIndexPage, {
      objectNamePlural: 'properties',
    }),
    Icon: IconBuildingSkyscraper,
  },
  {
    label: 'Units',
    to: getAppPath(AppPath.PmRecordIndexPage, {
      objectNamePlural: 'units',
    }),
    Icon: IconHome,
  },
  {
    label: 'Leases',
    to: getAppPath(AppPath.PmRecordIndexPage, {
      objectNamePlural: 'leases',
    }),
    Icon: IconFileText,
  },
];

// Financial Operations Section (Phase 1 - Immediate Priority)
const financialItems: NavItem[] = [
  {
    label: 'Rent Roll',
    to: getAppPath(AppPath.PmRentRoll),
    Icon: IconMoneybag,
  },
  {
    label: 'Payments',
    Icon: IconCreditCard,
    soon: true,
  },
  {
    label: 'Accounting',
    to: getAppPath(AppPath.PmAccounting),
    Icon: IconCoins,
  },
  {
    label: 'Reports',
    Icon: IconChartBar,
    soon: true,
  },
];

// Operations Section (Phase 2)
const operationsItems: NavItem[] = [
  {
    label: 'Work Orders',
    to: getAppPath(AppPath.PmRecordIndexPage, {
      objectNamePlural: 'workOrders',
    }),
    Icon: IconTool,
  },
  {
    label: 'Inspections',
    to: getAppPath(AppPath.PmInspections),
    Icon: IconListCheck,
  },
  {
    label: 'Maintenance',
    Icon: IconCalendar,
    soon: true,
  },
  {
    label: 'Inventory',
    to: getAppPath(AppPath.PmInventory),
    Icon: IconBox,
  },
];

// Tenant & Leasing Section (Phase 2)
const tenantItems: NavItem[] = [
  {
    label: 'Applications',
    to: getAppPath(AppPath.PmRecordIndexPage, {
      objectNamePlural: 'applications',
    }),
    Icon: IconNotes,
  },
  {
    label: 'Tenants',
    to: getAppPath(AppPath.PmRecordIndexPage, {
      objectNamePlural: 'people',
    }),
    Icon: IconUsers,
  },
  {
    label: 'Showings',
    to: getAppPath(AppPath.PmRecordIndexPage, {
      objectNamePlural: 'showings',
    }),
    Icon: IconKey,
  },
];

// Insights Section (Phase 3 - Future)
const insightsItems: NavItem[] = [
  {
    label: 'Performance',
    Icon: IconGauge,
    soon: true,
  },
  {
    label: 'Forecasting',
    Icon: IconTarget,
    soon: true,
  },
];

const StyledNavContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

const StyledNavItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const PMNavigation = () => {
  return (
    <StyledNavContainer>
      {/* Dashboard */}
      <NavigationDrawerSection>
        <StyledNavItems>
          {dashboardItems.map((item) => (
            <NavigationDrawerItem
              key={item.label}
              label={item.label}
              to={item.to}
              Icon={item.Icon}
            />
          ))}
        </StyledNavItems>
      </NavigationDrawerSection>

      {/* Core Data */}
      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label="Core Data" />
        <StyledNavItems>
          {coreDataItems.map((item) => (
            <NavigationDrawerItem
              key={item.label}
              label={item.label}
              to={item.to}
              Icon={item.Icon}
            />
          ))}
        </StyledNavItems>
      </NavigationDrawerSection>

      {/* Financial Operations - Phase 1 Priority */}
      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label="Financial" />
        <StyledNavItems>
          {financialItems.map((item) => (
            <NavigationDrawerItem
              key={item.label}
              label={item.label}
              to={item.to}
              Icon={item.Icon}
              soon={item.soon}
            />
          ))}
        </StyledNavItems>
      </NavigationDrawerSection>

      {/* Operations - Phase 2 */}
      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label="Operations" />
        <StyledNavItems>
          {operationsItems.map((item) => (
            <NavigationDrawerItem
              key={item.label}
              label={item.label}
              to={item.to}
              Icon={item.Icon}
              soon={item.soon}
            />
          ))}
        </StyledNavItems>
      </NavigationDrawerSection>

      {/* Tenant & Leasing - Phase 2 */}
      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label="Tenant & Leasing" />
        <StyledNavItems>
          {tenantItems.map((item) => (
            <NavigationDrawerItem
              key={item.label}
              label={item.label}
              to={item.to}
              Icon={item.Icon}
              soon={item.soon}
            />
          ))}
        </StyledNavItems>
      </NavigationDrawerSection>

      {/* Insights - Phase 3 Future */}
      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label="Insights" />
        <StyledNavItems>
          {insightsItems.map((item) => (
            <NavigationDrawerItem
              key={item.label}
              label={item.label}
              to={item.to}
              Icon={item.Icon}
              soon={item.soon}
            />
          ))}
        </StyledNavItems>
      </NavigationDrawerSection>
    </StyledNavContainer>
  );
};
