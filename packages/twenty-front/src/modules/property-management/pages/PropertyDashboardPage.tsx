import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { format, subMonths } from 'date-fns';
import { useLingui } from '@lingui/react/macro';

import { AppPath, type RecordGqlOperationFilter } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { Select } from '@/ui/input/components/Select';
import { Loader } from 'twenty-ui/feedback';
import { Card } from 'twenty-ui/layout';

import { StyledPMParagraph } from '../components/PMParagraph';
import { useGetPropertyDashboardQuery } from '~/generated/graphql';

import { PropertyManagementObjectPreview } from '@/property-management/components/PropertyManagementObjectPreview';

const StyledKPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${({ theme }) => theme.spacing(2)};
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

const StyledSectionGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
`;

const buildMonthOptions = () =>
  Array.from({ length: 12 }).map((_, index) => {
    const date = subMonths(new Date(), index);
    return {
      label: format(date, 'MMMM yyyy'),
      value: format(date, 'yyyy-MM'),
    };
  });

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

const normalizeCurrencyValue = (value: unknown): number => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (
    value !== null &&
    typeof value === 'object' &&
    'amountMicros' in value &&
    typeof (value as { amountMicros?: unknown }).amountMicros === 'number'
  ) {
    return ((value as { amountMicros: number }).amountMicros ?? 0) / 1_000_000;
  }

  return 0;
};

const getCurrentMonth = () => format(new Date(), 'yyyy-MM');

export const PropertyDashboardPage = () => {
  const { t } = useLingui();
  const { propertyId = '' } = useParams();
  const monthOptions = useMemo(buildMonthOptions, []);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const { data, loading, refetch } = useGetPropertyDashboardQuery({
    variables: { propertyId, month: selectedMonth },
    skip: !propertyId,
  });

  const summary = data?.propertyDashboard;

  const kpis = [
    {
      label: t`Occupancy`,
      value: summary?.occupancyPercent ?? 0,
      formatter: formatPercent,
    },
    {
      label: t`Units`,
      value: summary?.totalUnits ?? 0,
      formatter: (value: number) => value.toString(),
    },
    {
      label: t`Rent roll`,
      value: summary?.monthlyRentRoll ?? 0,
      formatter: formatCurrency,
    },
    {
      label: t`Collected`,
      value: summary?.monthlyCollected ?? 0,
      formatter: formatCurrency,
    },
    {
      label: t`Delinquent`,
      value: summary?.monthlyDelinquent ?? 0,
      formatter: formatCurrency,
    },
    {
      label: t`Open work orders`,
      value: summary?.openWorkOrderCount ?? 0,
      formatter: (value: number) => value.toString(),
    },
  ];

  const propertyFilter: RecordGqlOperationFilter | undefined = propertyId
    ? {
        propertyId: {
          eq: propertyId,
        },
      }
    : undefined;

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    refetch({ propertyId, month: value });
  };

  return (
    <PageContainer>
      <PageHeader title={summary?.name ?? t`Property dashboard`}>
        <Select
          dropdownId="pm-property-month-select"
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
        ) : !summary ? (
          <StyledPMParagraph>
            {t`We could not find this property.`}
          </StyledPMParagraph>
        ) : (
          <>
            {summary.address && (
              <StyledPMParagraph>{summary.address}</StyledPMParagraph>
            )}
            <StyledKPIGrid>
              {kpis.map((kpi) => (
                <StyledKPICard key={kpi.label}>
                  <StyledKPIValue>{kpi.formatter(kpi.value)}</StyledKPIValue>
                  <StyledKPILabel>{kpi.label}</StyledKPILabel>
                </StyledKPICard>
              ))}
            </StyledKPIGrid>

            <StyledSectionGrid>
              <PropertyManagementObjectPreview
                objectNameSingular="unit"
                title={t`Units`}
                description={t`Units tied to this property.`}
                columns={[
                  {
                    title: t`Unit`,
                    key: 'unitNumber',
                    render: (record) => record['unitNumber'] ?? '-',
                  },
                  {
                    title: t`Status`,
                    key: 'status',
                    render: (record) => record['status'] ?? '-',
                  },
                  {
                    title: t`Rent`,
                    key: 'rent',
                    render: (record) =>
                      formatCurrency(
                        normalizeCurrencyValue(record['currentRent']),
                      ),
                  },
                ]}
                filter={propertyFilter}
                viewAllHref={`${getAppPath(AppPath.PmRecordIndexPage, {
                  objectNamePlural: 'units',
                })}?propertyId=${propertyId}`}
              />

              <PropertyManagementObjectPreview
                objectNameSingular="lease"
                title={t`Leases`}
                description={t`Active and upcoming leases for this property.`}
                columns={[
                  {
                    title: t`Lease`,
                    key: 'lease',
                    render: (record) => record['name'] ?? record['id'],
                  },
                  {
                    title: t`Status`,
                    key: 'status',
                    render: (record) => record['leaseStatus'] ?? '-',
                  },
                  {
                    title: t`Rent`,
                    key: 'rent',
                    render: (record) =>
                      formatCurrency(
                        normalizeCurrencyValue(record['rentAmount']),
                      ),
                  },
                ]}
                filter={propertyFilter}
                viewAllHref={`${getAppPath(AppPath.PmRecordIndexPage, {
                  objectNamePlural: 'leases',
                })}?propertyId=${propertyId}`}
              />

              <PropertyManagementObjectPreview
                objectNameSingular="workOrder"
                title={t`Work orders`}
                description={t`Maintenance items tied to this property.`}
                columns={[
                  {
                    title: t`Title`,
                    key: 'title',
                    render: (record) => record['title'] ?? '-',
                  },
                  {
                    title: t`Status`,
                    key: 'status',
                    render: (record) => record['status'] ?? '-',
                  },
                  {
                    title: t`Priority`,
                    key: 'priority',
                    render: (record) => record['priority'] ?? '-',
                  },
                ]}
                filter={propertyFilter}
                viewAllHref={`${getAppPath(AppPath.PmRecordIndexPage, {
                  objectNamePlural: 'workOrders',
                })}?propertyId=${propertyId}`}
              />
            </StyledSectionGrid>
          </>
        )}
      </PageBody>
    </PageContainer>
  );
};
