import styled from '@emotion/styled';

import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import {
  IconBox,
  IconCoins,
  IconFileText,
  IconHome,
  IconLayoutDashboard,
  IconTool,
  IconBuildingSkyscraper,
  IconListCheck,
} from 'twenty-ui/display';

const navItems = [
  {
    label: 'PM Dashboard',
    to: getAppPath(AppPath.PmDashboard),
    Icon: IconLayoutDashboard,
  },
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
  {
    label: 'Work Orders',
    to: getAppPath(AppPath.PmRecordIndexPage, {
      objectNamePlural: 'workOrders',
    }),
    Icon: IconTool,
  },
  {
    label: 'Accounting',
    to: getAppPath(AppPath.PmAccounting),
    Icon: IconCoins,
  },
  {
    label: 'Inventory',
    to: getAppPath(AppPath.PmInventory),
    Icon: IconBox,
  },
  {
    label: 'Inspections',
    to: getAppPath(AppPath.PmInspections),
    Icon: IconListCheck,
  },
];

const StyledNavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const PMNavigation = () => {
  return (
    <StyledNavList>
      {navItems.map((item) => (
        <NavigationDrawerItem
          key={item.label}
          label={item.label}
          to={item.to}
          Icon={item.Icon}
        />
      ))}
    </StyledNavList>
  );
};
