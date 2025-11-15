import { gql } from '@apollo/client';

export const GET_PORTFOLIO_SUMMARY = gql`
  query GetPortfolioSummary($month: String!) {
    portfolioSummary(month: $month) {
      month
      totalProperties
      totalUnits
      overallOccupancyPercent
      portfolioRentRoll
      portfolioCollected
      portfolioDelinquent
      totalOpenWorkOrders
      properties {
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
  }
`;
