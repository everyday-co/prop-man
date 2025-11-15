import { useMemo, useState } from 'react';
import { format, subMonths } from 'date-fns';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';

import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { Select } from '@/ui/input/components/Select';
import { Loader } from 'twenty-ui/feedback';
import { Card } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/display';

import { StyledPMParagraph } from '../components/PMParagraph';
import {
  useGetPortfolioSummaryQuery,
  type GetPortfolioSummaryQuery,
} from '~/generated/graphql';

const StyledKPIGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

const StyledKPICard = styled(Card)`
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledKPIValue = styled.div`
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledKPILabel = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledSectionCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledPlaceholderCard = styled(Card)`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  justify-content: center;
  min-height: 200px;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledPropertyTable = styled.table`
  border-collapse: collapse;
  width: 100%;
`;

const StyledPropertyTableHeader = styled.th`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  padding: ${({ theme }) => theme.spacing(0.5)}
    ${({ theme }) => theme.spacing(1)};
  text-align: left;
`;

const StyledSortableHeaderButton = styled.button<{ active: boolean }>`
  align-items: center;
  background: transparent;
  border: none;
  color: ${({ active, theme }) =>
    active ? theme.font.color.primary : theme.font.color.light};
  cursor: pointer;
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
  font: inherit;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(0.5)} 0;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledSortIndicator = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledPropertyTableCell = styled.td`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledPropertyLink = styled(Link)`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const NUM_MONTHS = 12;

type PropertySortKey =
  | 'name'
  | 'occupancyPercent'
  | 'monthlyRentRoll'
  | 'monthlyCollected'
  | 'monthlyDelinquent'
  | 'openWorkOrderCount';

type SortDirection = 'asc' | 'desc';

const SORT_INDICATORS: Record<SortDirection, string> = {
  asc: '\u2191',
  desc: '\u2193',
};

type PropertySummaryRow = NonNullable<
  GetPortfolioSummaryQuery['portfolioSummary']
>['properties'][number];

const buildMonthOptions = () => {
  return Array.from({ length: NUM_MONTHS }).map((_, index) => {
    const date = subMonths(new Date(), index);
    const value = format(date, 'yyyy-MM');

    return {
      label: format(date, 'MMMM yyyy'),
      value,
    };
  });
};

const formatCurrency = (value?: number | null) => {
  if (!value || Number.isNaN(value)) {
    return '$0';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value?: number | null) => {
  if (!value || Number.isNaN(value)) {
    return '0%';
  }

  return `${value.toFixed(1)}%`;
};

const getCurrentMonth = () => format(new Date(), 'yyyy-MM');

export const PortfolioDashboardPage = () => {
  const { t } = useLingui();
  const monthOptions = useMemo(buildMonthOptions, []);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [sortKey, setSortKey] = useState<PropertySortKey>('monthlyDelinquent');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const { data, loading, refetch } = useGetPortfolioSummaryQuery({
    variables: { month: selectedMonth },
  });

  const summary = data?.portfolioSummary;
  const propertyRows = useMemo(
    () => summary?.properties ?? [],
    [summary?.properties],
  );

  const sortedProperties = useMemo(() => {
    if (propertyRows.length === 0) {
      return [];
    }

    const accessor: Record<
      PropertySortKey,
      (property: PropertySummaryRow) => number | string
    > = {
      name: (property) => property.name ?? '',
      occupancyPercent: (property) => property.occupancyPercent ?? 0,
      monthlyRentRoll: (property) => property.monthlyRentRoll ?? 0,
      monthlyCollected: (property) => property.monthlyCollected ?? 0,
      monthlyDelinquent: (property) => property.monthlyDelinquent ?? 0,
      openWorkOrderCount: (property) => property.openWorkOrderCount ?? 0,
    };

    const sorted = [...propertyRows].sort((a, b) => {
      const aValue = accessor[sortKey](a);
      const bValue = accessor[sortKey](b);

      if (typeof aValue === 'string' || typeof bValue === 'string') {
        const comparator = String(aValue).localeCompare(String(bValue));

        return sortDirection === 'asc' ? comparator : -comparator;
      }

      const comparator = Number(aValue) - Number(bValue);

      return sortDirection === 'asc' ? comparator : -comparator;
    });

    return sorted;
  }, [propertyRows, sortDirection, sortKey]);

  const kpis = [
    {
      label: t`Properties`,
      value: summary?.totalProperties ?? 0,
      formatter: (v: number) => v.toLocaleString(),
    },
    {
      label: t`Units`,
      value: summary?.totalUnits ?? 0,
      formatter: (v: number) => v.toLocaleString(),
    },
    {
      label: t`Occupancy`,
      value: summary?.overallOccupancyPercent ?? 0,
      formatter: formatPercent,
    },
    {
      label: t`Rent roll`,
      value: summary?.portfolioRentRoll ?? 0,
      formatter: formatCurrency,
    },
    {
      label: t`Collected`,
      value: summary?.portfolioCollected ?? 0,
      formatter: formatCurrency,
    },
    {
      label: t`Delinquent`,
      value: summary?.portfolioDelinquent ?? 0,
      formatter: formatCurrency,
    },
    {
      label: t`Open work orders`,
      value: summary?.totalOpenWorkOrders ?? 0,
      formatter: (v: number) => v.toString(),
    },
  ];

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    refetch({ month: value });
  };

  const handleSortChange = (key: PropertySortKey) => {
    setSortKey((previousKey) => {
      if (previousKey === key) {
        setSortDirection((previousDirection) =>
          previousDirection === 'asc' ? 'desc' : 'asc',
        );

        return previousKey;
      }

      setSortDirection('desc');

      return key;
    });
  };

  const renderSortIndicator = (key: PropertySortKey) =>
    sortKey === key ? (
      <StyledSortIndicator>
        {SORT_INDICATORS[sortDirection]}
      </StyledSortIndicator>
    ) : null;

  return (
    <PageContainer>
      <PageHeader
        title={t`Portfolio dashboard`}
        Icon={undefined}
        className="pm-dashboard-header"
      >
        <Select
          dropdownId="pm-portfolio-month-select"
          label={t`Month`}
          options={monthOptions}
          value={selectedMonth}
          onChange={(value) => handleMonthChange(String(value))}
          dropdownWidthAuto
        />
      </PageHeader>
      <PageBody>
        {loading && !summary ? (
          <Loader />
        ) : (
          <>
            <StyledKPIGrid>
              {kpis.map((kpi) => (
                <StyledKPICard key={kpi.label}>
                  <StyledKPIValue>{kpi.formatter(kpi.value)}</StyledKPIValue>
                  <StyledKPILabel>{kpi.label}</StyledKPILabel>
                </StyledKPICard>
              ))}
            </StyledKPIGrid>

            <StyledPlaceholderCard>
              {t`Rent roll vs collected trend coming soon.`}
            </StyledPlaceholderCard>

            <StyledSectionCard>
              <H2Title
                title={t`Properties`}
                description={t`Top-level metrics for each property.`}
              />
              {loading && propertyRows.length === 0 ? (
                <Loader />
              ) : propertyRows.length === 0 ? (
                <StyledPMParagraph>{t`No properties found yet.`}</StyledPMParagraph>
              ) : (
                <StyledPropertyTable>
                  <thead>
                    <tr>
                      <StyledPropertyTableHeader>
                        <StyledSortableHeaderButton
                          type="button"
                          onClick={() => handleSortChange('name')}
                          active={sortKey === 'name'}
                        >
                          {t`Property`}
                          {renderSortIndicator('name')}
                        </StyledSortableHeaderButton>
                      </StyledPropertyTableHeader>
                      <StyledPropertyTableHeader>
                        <StyledSortableHeaderButton
                          type="button"
                          onClick={() => handleSortChange('occupancyPercent')}
                          active={sortKey === 'occupancyPercent'}
                        >
                          {t`Occupancy`}
                          {renderSortIndicator('occupancyPercent')}
                        </StyledSortableHeaderButton>
                      </StyledPropertyTableHeader>
                      <StyledPropertyTableHeader>
                        <StyledSortableHeaderButton
                          type="button"
                          onClick={() => handleSortChange('monthlyRentRoll')}
                          active={sortKey === 'monthlyRentRoll'}
                        >
                          {t`Rent roll`}
                          {renderSortIndicator('monthlyRentRoll')}
                        </StyledSortableHeaderButton>
                      </StyledPropertyTableHeader>
                      <StyledPropertyTableHeader>
                        <StyledSortableHeaderButton
                          type="button"
                          onClick={() => handleSortChange('monthlyCollected')}
                          active={sortKey === 'monthlyCollected'}
                        >
                          {t`Collected`}
                          {renderSortIndicator('monthlyCollected')}
                        </StyledSortableHeaderButton>
                      </StyledPropertyTableHeader>
                      <StyledPropertyTableHeader>
                        <StyledSortableHeaderButton
                          type="button"
                          onClick={() => handleSortChange('monthlyDelinquent')}
                          active={sortKey === 'monthlyDelinquent'}
                        >
                          {t`Delinquent`}
                          {renderSortIndicator('monthlyDelinquent')}
                        </StyledSortableHeaderButton>
                      </StyledPropertyTableHeader>
                      <StyledPropertyTableHeader>
                        <StyledSortableHeaderButton
                          type="button"
                          onClick={() => handleSortChange('openWorkOrderCount')}
                          active={sortKey === 'openWorkOrderCount'}
                        >
                          {t`Open WOs`}
                          {renderSortIndicator('openWorkOrderCount')}
                        </StyledSortableHeaderButton>
                      </StyledPropertyTableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProperties.map((property) => (
                      <tr key={property.propertyId}>
                        <StyledPropertyTableCell>
                          <StyledPropertyLink
                            to={getAppPath(AppPath.PmPropertyDashboard, {
                              propertyId: property.propertyId,
                            })}
                          >
                            {property.name}
                          </StyledPropertyLink>
                          {property.address && (
                            <StyledPMParagraph>
                              {property.address}
                            </StyledPMParagraph>
                          )}
                        </StyledPropertyTableCell>
                        <StyledPropertyTableCell>
                          {formatPercent(property.occupancyPercent)}
                        </StyledPropertyTableCell>
                        <StyledPropertyTableCell>
                          {formatCurrency(property.monthlyRentRoll)}
                        </StyledPropertyTableCell>
                        <StyledPropertyTableCell>
                          {formatCurrency(property.monthlyCollected)}
                        </StyledPropertyTableCell>
                        <StyledPropertyTableCell>
                          {formatCurrency(property.monthlyDelinquent)}
                        </StyledPropertyTableCell>
                        <StyledPropertyTableCell>
                          {property.openWorkOrderCount}
                        </StyledPropertyTableCell>
                      </tr>
                    ))}
                  </tbody>
                </StyledPropertyTable>
              )}
            </StyledSectionCard>
          </>
        )}
      </PageBody>
    </PageContainer>
  );
};
