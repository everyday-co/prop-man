import { gql } from '@apollo/client';

export const GET_PROPERTY_DASHBOARD = gql`
  query GetPropertyDashboard($propertyId: ID!, $month: String!) {
    propertyDashboard(propertyId: $propertyId, month: $month) {
      propertyId
      name
      address
      totalUnits
      occupiedUnits
      occupancyPercent
      monthlyRentRoll
      monthlyCollected
      monthlyDelinquent
      openWorkOrderCount
    }
  }
`;
