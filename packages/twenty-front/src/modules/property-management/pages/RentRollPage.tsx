import { useMemo, useState } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { Select } from '@/ui/input/components/Select';
import { Loader } from 'twenty-ui/feedback';
import { Card } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/display';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';

import { StyledPMParagraph } from '../components/PMParagraph';
import { GET_RENT_ROLL } from '../graphql/queries/getRentRoll';
import { type GetRentRollQuery } from '~/generated/graphql';

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

const StyledFiltersRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledChargeTable = styled.table`
  border-collapse: collapse;
  width: 100%;
`;

const StyledChargeTableHeader = styled.th`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(1)};
  text-align: left;
`;

const StyledChargeTableCell = styled.td`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledStatusBadge = styled.span<{ status: string }>`
  background-color: ${({ status, theme }) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return theme.color.green10;
      case 'partial':
        return theme.color.yellow10;
      case 'overdue':
        return theme.color.red10;
      case 'billed':
        return theme.color.blue10;
      default:
        return theme.color.gray10;
    }
  }};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ status, theme }) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return theme.color.green;
      case 'partial':
        return theme.color.yellow;
      case 'overdue':
        return theme.color.red;
      case 'billed':
        return theme.color.blue;
      default:
        return theme.font.color.secondary;
    }
  }};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(0.5)}
    ${({ theme }) => theme.spacing(1)};
`;

const NUM_MONTHS = 12;

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
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) {
    return '-';
  }

  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch {
    return '-';
  }
};

const getCurrentMonth = () => format(new Date(), 'yyyy-MM');

const statusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Scheduled', value: 'Scheduled' },
  { label: 'Billed', value: 'Billed' },
  { label: 'Partial', value: 'Partial' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Overdue', value: 'Overdue' },
  { label: 'Waived', value: 'Waived' },
];

export const RentRollPage = () => {
  const { t } = useLingui();
  const monthOptions = useMemo(buildMonthOptions, []);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedStatus, setSelectedStatus] = useState('all');

  const apolloCoreClient = useApolloCoreClient();

  // Build date range from selected month
  const { startDate, endDate } = useMemo(() => {
    const monthDate = new Date(selectedMonth + '-01');
    return {
      startDate: format(startOfMonth(monthDate), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(monthDate), 'yyyy-MM-dd'),
    };
  }, [selectedMonth]);

  const { data, loading } = useQuery<GetRentRollQuery>(GET_RENT_ROLL, {
    variables: {
      startDate,
      endDate,
      status: selectedStatus === 'all' ? undefined : [selectedStatus],
    },
    client: apolloCoreClient,
  });

  const rentRoll = data?.rentRoll;
  const charges = rentRoll?.charges ?? [];
  const summary = rentRoll?.summary;

  const kpis = [
    {
      label: t`Total charges`,
      value: summary?.totalCharges ?? 0,
      formatter: formatCurrency,
    },
    {
      label: t`Total paid`,
      value: summary?.totalPaid ?? 0,
      formatter: formatCurrency,
    },
    {
      label: t`Outstanding`,
      value: summary?.totalOutstanding ?? 0,
      formatter: formatCurrency,
    },
    {
      label: t`Charges count`,
      value: summary?.chargesCount ?? 0,
      formatter: (v: number) => v.toString(),
    },
    {
      label: t`Paid count`,
      value: summary?.paidCount ?? 0,
      formatter: (v: number) => v.toString(),
    },
    {
      label: t`Overdue count`,
      value: summary?.overdueCount ?? 0,
      formatter: (v: number) => v.toString(),
    },
  ];

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  return (
    <PageContainer>
      <PageHeader title={t`Rent roll`} Icon={undefined}>
        <Select
          dropdownId="pm-rent-roll-month-select"
          label={t`Month`}
          options={monthOptions}
          value={selectedMonth}
          onChange={(value) => handleMonthChange(String(value))}
          dropdownWidthAuto
        />
      </PageHeader>
      <PageBody>
        {loading && !rentRoll ? (
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

            <StyledSectionCard>
              <H2Title
                title={t`Charges`}
                description={t`All lease charges for the selected period.`}
              />

              <StyledFiltersRow>
                <Select
                  dropdownId="pm-rent-roll-status-filter"
                  label={t`Status`}
                  options={statusOptions}
                  value={selectedStatus}
                  onChange={(value) => handleStatusChange(String(value))}
                  dropdownWidthAuto
                />
              </StyledFiltersRow>

              {loading ? (
                <Loader />
              ) : charges.length === 0 ? (
                <StyledPMParagraph>
                  {t`No charges found for this period.`}
                </StyledPMParagraph>
              ) : (
                <StyledChargeTable>
                  <thead>
                    <tr>
                      <StyledChargeTableHeader>
                        {t`Charge date`}
                      </StyledChargeTableHeader>
                      <StyledChargeTableHeader>
                        {t`Due date`}
                      </StyledChargeTableHeader>
                      <StyledChargeTableHeader>
                        {t`Tenant`}
                      </StyledChargeTableHeader>
                      <StyledChargeTableHeader>
                        {t`Property`}
                      </StyledChargeTableHeader>
                      <StyledChargeTableHeader>
                        {t`Unit`}
                      </StyledChargeTableHeader>
                      <StyledChargeTableHeader>
                        {t`Amount`}
                      </StyledChargeTableHeader>
                      <StyledChargeTableHeader>
                        {t`Balance`}
                      </StyledChargeTableHeader>
                      <StyledChargeTableHeader>
                        {t`Status`}
                      </StyledChargeTableHeader>
                      <StyledChargeTableHeader>
                        {t`Days overdue`}
                      </StyledChargeTableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {charges.map((charge: any) => (
                      <tr key={charge.id}>
                        <StyledChargeTableCell>
                          {formatDate(charge.chargeDate)}
                        </StyledChargeTableCell>
                        <StyledChargeTableCell>
                          {formatDate(charge.dueDate)}
                        </StyledChargeTableCell>
                        <StyledChargeTableCell>
                          {charge.tenant?.name ?? '-'}
                        </StyledChargeTableCell>
                        <StyledChargeTableCell>
                          {charge.lease?.property?.name ? (
                            <Link
                              to={getAppPath(AppPath.PmPropertyDashboard, {
                                propertyId: charge.lease.property.id,
                              })}
                            >
                              {charge.lease.property.name}
                            </Link>
                          ) : (
                            '-'
                          )}
                        </StyledChargeTableCell>
                        <StyledChargeTableCell>
                          {charge.lease?.unit?.name ?? '-'}
                        </StyledChargeTableCell>
                        <StyledChargeTableCell>
                          {formatCurrency(
                            charge.amount?.amountMicros
                              ? charge.amount.amountMicros / 1000000
                              : 0,
                          )}
                        </StyledChargeTableCell>
                        <StyledChargeTableCell>
                          {formatCurrency(
                            charge.balanceRemaining?.amountMicros
                              ? charge.balanceRemaining.amountMicros / 1000000
                              : 0,
                          )}
                        </StyledChargeTableCell>
                        <StyledChargeTableCell>
                          <StyledStatusBadge status={charge.status ?? ''}>
                            {charge.status ?? 'Unknown'}
                          </StyledStatusBadge>
                        </StyledChargeTableCell>
                        <StyledChargeTableCell>
                          {charge.daysOverdue ?? '-'}
                        </StyledChargeTableCell>
                      </tr>
                    ))}
                  </tbody>
                </StyledChargeTable>
              )}
            </StyledSectionCard>
          </>
        )}
      </PageBody>
    </PageContainer>
  );
};
