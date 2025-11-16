import { gql } from '@apollo/client';

export const GET_RENT_ROLL = gql`
  query GetRentRoll(
    $startDate: String
    $endDate: String
    $propertyId: ID
    $status: [String!]
  ) {
    rentRoll(
      startDate: $startDate
      endDate: $endDate
      propertyId: $propertyId
      status: $status
    ) {
      charges
      summary {
        totalCharges
        totalPaid
        totalOutstanding
        chargesCount
        paidCount
        overdueCount
      }
    }
  }
`;
