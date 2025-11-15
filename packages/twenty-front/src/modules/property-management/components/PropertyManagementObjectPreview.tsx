import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Loader } from 'twenty-ui/feedback';
import { Card } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/display';

import { StyledPMParagraph } from './PMParagraph';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

const StyledCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  width: 100%;
`;

const StyledHeaderCell = styled.th`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.light};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(1)};
  text-align: left;
`;

const StyledCell = styled.td`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledFooter = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledViewAllLink = styled(Link)`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export type PropertyManagementObjectPreviewColumn = {
  title: string;
  key: string;
  render: (record: ObjectRecord) => React.ReactNode;
};

export type PropertyManagementObjectPreviewProps = {
  objectNameSingular: string;
  title: string;
  description: string;
  columns: PropertyManagementObjectPreviewColumn[];
  filter?: RecordGqlOperationFilter;
  limit?: number;
  viewAllHref: string;
  emptyState?: string;
};

export const PropertyManagementObjectPreview = ({
  objectNameSingular,
  title,
  description,
  columns,
  filter,
  limit = 5,
  viewAllHref,
  emptyState = 'No records available yet.',
}: PropertyManagementObjectPreviewProps) => {
  const { recordGqlFields } = useGenerateDepthRecordGqlFieldsFromObject({
    objectNameSingular,
    depth: 0,
    shouldOnlyLoadRelationIdentifiers: false,
  });

  const { records, loading } = useFindManyRecords({
    objectNameSingular,
    filter,
    limit,
    recordGqlFields,
  });

  const hasRecords = records.length > 0;

  return (
    <StyledCard>
      <H2Title title={title} description={description} />
      {loading ? (
        <Loader />
      ) : hasRecords ? (
        <StyledTable>
          <thead>
            <tr>
              {columns.map((column) => (
                <StyledHeaderCell key={column.key}>
                  {column.title}
                </StyledHeaderCell>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                {columns.map((column) => (
                  <StyledCell key={column.key}>
                    {column.render(record)}
                  </StyledCell>
                ))}
              </tr>
            ))}
          </tbody>
        </StyledTable>
      ) : (
        <StyledPMParagraph>{emptyState}</StyledPMParagraph>
      )}
      <StyledFooter>
        <span>{hasRecords ? `${records.length} results` : '0 results'}</span>
        <StyledViewAllLink to={viewAllHref}>View all</StyledViewAllLink>
      </StyledFooter>
    </StyledCard>
  );
};
