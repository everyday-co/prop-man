import { useState } from 'react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMutation } from '@apollo/client';
import { format } from 'date-fns';

import { Modal } from '@/ui/layout/modal/components/Modal';
import { Button } from 'twenty-ui/input';
import { H2Title } from 'twenty-ui/display';
import { TextInput } from '@/ui/input/components/internal/TextInput';
import { DateInput } from '@/ui/input/components/internal/date/DateInput';

import { RECORD_PAYMENT } from '../graphql/mutations/recordPayment';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';

const StyledModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(6)};
`;

const StyledFormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledChargeInfo = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledChargeRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledChargeLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledChargeValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledButtonRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledErrorMessage = styled.div`
  background: ${({ theme }) => theme.color.red10};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(2)};
`;

type RecordPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  charge: {
    id: string;
    lease: {
      id: string;
      property?: { name?: string };
      unit?: { name?: string };
    };
    tenant?: { name?: string };
    amount?: { amountMicros?: number; currencyCode?: string };
    balanceRemaining?: { amountMicros?: number };
    dueDate?: string;
  };
  onPaymentRecorded?: () => void;
};

export const RecordPaymentModal = ({
  isOpen,
  onClose,
  charge,
  onPaymentRecorded,
}: RecordPaymentModalProps) => {
  const { t } = useLingui();
  const apolloCoreClient = useApolloCoreClient();

  const balanceRemaining =
    charge.balanceRemaining?.amountMicros
      ? charge.balanceRemaining.amountMicros / 1000000
      : 0;

  const [paymentAmount, setPaymentAmount] = useState(
    balanceRemaining.toFixed(2),
  );
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [referenceNumber, setReferenceNumber] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [recordPayment, { loading }] = useMutation(RECORD_PAYMENT, {
    client: apolloCoreClient,
    onCompleted: () => {
      onPaymentRecorded?.();
      onClose();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = async () => {
    const amount = parseFloat(paymentAmount);

    if (Number.isNaN(amount) || amount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    if (amount > balanceRemaining) {
      setError(
        `Payment amount cannot exceed balance remaining ($${balanceRemaining.toFixed(2)})`,
      );
      return;
    }

    setError(null);

    await recordPayment({
      variables: {
        leaseChargeId: charge.id,
        leaseId: charge.lease.id,
        amount: amount * 1000000, // Convert to micros
        paymentDate: format(paymentDate, 'yyyy-MM-dd'),
        referenceNumber: referenceNumber || undefined,
        memo: memo || undefined,
      },
    });
  };

  const formatCurrency = (amountMicros?: number) => {
    if (!amountMicros) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amountMicros / 1000000);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      modalId="record-payment-modal"
      isClosable={!loading}
      onClose={onClose}
      size="medium"
      padding="none"
    >
      <StyledModalContent>
        <H2Title title={t`Record payment`} />

        <StyledChargeInfo>
          <StyledChargeRow>
            <StyledChargeLabel>{t`Tenant`}</StyledChargeLabel>
            <StyledChargeValue>
              {charge.tenant?.name ?? 'Unknown'}
            </StyledChargeValue>
          </StyledChargeRow>
          <StyledChargeRow>
            <StyledChargeLabel>{t`Property`}</StyledChargeLabel>
            <StyledChargeValue>
              {charge.lease.property?.name ?? 'Unknown'}
            </StyledChargeValue>
          </StyledChargeRow>
          <StyledChargeRow>
            <StyledChargeLabel>{t`Unit`}</StyledChargeLabel>
            <StyledChargeValue>
              {charge.lease.unit?.name ?? 'N/A'}
            </StyledChargeValue>
          </StyledChargeRow>
          <StyledChargeRow>
            <StyledChargeLabel>{t`Total charge`}</StyledChargeLabel>
            <StyledChargeValue>
              {formatCurrency(charge.amount?.amountMicros)}
            </StyledChargeValue>
          </StyledChargeRow>
          <StyledChargeRow>
            <StyledChargeLabel>{t`Balance remaining`}</StyledChargeLabel>
            <StyledChargeValue>
              {formatCurrency(charge.balanceRemaining?.amountMicros)}
            </StyledChargeValue>
          </StyledChargeRow>
        </StyledChargeInfo>

        <StyledFormRow>
          <StyledLabel htmlFor="payment-amount">{t`Payment amount`}</StyledLabel>
          <TextInput
            placeholder={t`0.00`}
            value={paymentAmount}
            onChange={(value) => setPaymentAmount(value)}
            fullWidth
          />
        </StyledFormRow>

        <StyledFormRow>
          <StyledLabel htmlFor="payment-date">{t`Payment date`}</StyledLabel>
          <DateInput
            value={paymentDate}
            onEnter={() => {}}
            onEscape={() => {}}
            onClickOutside={() => {}}
            onClear={() => setPaymentDate(new Date())}
            onChange={(date) => setPaymentDate(date)}
          />
        </StyledFormRow>

        <StyledFormRow>
          <StyledLabel htmlFor="reference-number">
            {t`Reference number`} ({t`optional`})
          </StyledLabel>
          <TextInput
            placeholder={t`Check number, confirmation #, etc.`}
            value={referenceNumber}
            onChange={(value) => setReferenceNumber(value)}
            fullWidth
          />
        </StyledFormRow>

        <StyledFormRow>
          <StyledLabel htmlFor="memo">{t`Memo`} ({t`optional`})</StyledLabel>
          <TextInput
            placeholder={t`Internal notes about this payment`}
            value={memo}
            onChange={(value) => setMemo(value)}
            fullWidth
          />
        </StyledFormRow>

        {error && <StyledErrorMessage>{error}</StyledErrorMessage>}

        <StyledButtonRow>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            title={t`Cancel`}
          />
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading}
            title={loading ? t`Recording...` : t`Record payment`}
          />
        </StyledButtonRow>
      </StyledModalContent>
    </Modal>
  );
};
