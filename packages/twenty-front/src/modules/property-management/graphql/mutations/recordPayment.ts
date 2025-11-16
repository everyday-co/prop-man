import { gql } from '@apollo/client';

export const RECORD_PAYMENT = gql`
  mutation RecordPayment(
    $leaseChargeId: ID!
    $leaseId: ID!
    $amount: Float!
    $paymentDate: String!
    $referenceNumber: String
    $memo: String
  ) {
    recordPayment(
      leaseChargeId: $leaseChargeId
      leaseId: $leaseId
      amount: $amount
      paymentDate: $paymentDate
      referenceNumber: $referenceNumber
      memo: $memo
    ) {
      payment {
        id
        amount
        paymentDate
        referenceNumber
        memo
        status
      }
      updatedCharge {
        id
        balanceRemaining
        status
      }
    }
  }
`;
