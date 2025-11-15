import { Injectable, Logger, Scope } from '@nestjs/common';

import { PropertyManagementObjectService } from 'src/app/property-management/services/property-management-object.service';
import {
  type DelinquentLease,
  type LeaseChargeRecord,
  type PaymentRecord,
} from 'src/app/property-management/types/property-management.types';
import { extractCurrencyValue } from 'src/app/property-management/utils/currency.utils';
import { getMonthDateRange } from 'src/app/property-management/utils/month.utils';

const RENT_CHARGE_TYPE = 'Rent';
const OPEN_CHARGE_STATUSES = ['Open', 'Partially Paid'];
const COMPLETED_PAYMENT_STATUS = 'Completed';

@Injectable({ scope: Scope.REQUEST })
export class DelinquencyService {
  private readonly logger = new Logger(DelinquencyService.name);

  constructor(
    private readonly objectService: PropertyManagementObjectService,
  ) {}

  async getDelinquentLeases(
    month: string,
    propertyId?: string,
  ): Promise<DelinquentLease[]> {
    const range = getMonthDateRange(month);
    const [charges, payments] = await Promise.all([
      this.objectService.fetchLeaseCharges(
        this.buildChargeFilter(range.start, range.end, propertyId),
      ),
      this.objectService.fetchPayments(
        this.buildPaymentFilter(range.start, range.end, propertyId),
      ),
    ]);

    const chargeTotals = this.aggregateCharges(charges);
    const paymentTotals = this.aggregatePayments(payments);
    const delinquencies: DelinquentLease[] = [];

    for (const [
      leaseId,
      { amount, propertyId: recordPropertyId },
    ] of chargeTotals) {
      const paid = paymentTotals.get(leaseId) ?? 0;
      const outstanding = Math.max(amount - paid, 0);

      if (outstanding > 0.01) {
        delinquencies.push({
          leaseId,
          propertyId: recordPropertyId,
          outstandingAmount: Number(outstanding.toFixed(2)),
        });
      }
    }

    return delinquencies;
  }

  async getDelinquentByProperty(
    propertyId: string,
    month: string,
  ): Promise<number> {
    const delinquents = await this.getDelinquentLeases(month, propertyId);

    return delinquents.reduce((sum, lease) => sum + lease.outstandingAmount, 0);
  }

  private aggregateCharges(
    charges: LeaseChargeRecord[],
  ): Map<string, { amount: number; propertyId: string | null }> {
    const totals = new Map<
      string,
      { amount: number; propertyId: string | null }
    >();

    charges.forEach((charge) => {
      const leaseId = String(charge.leaseId ?? '');

      if (!leaseId) {
        return;
      }

      const previous = totals.get(leaseId);
      const amount = extractCurrencyValue(charge.amount);
      const propertyId = (charge.propertyId as string | undefined) ?? null;

      totals.set(leaseId, {
        amount: (previous?.amount ?? 0) + amount,
        propertyId: propertyId ?? previous?.propertyId ?? null,
      });
    });

    return totals;
  }

  private aggregatePayments(payments: PaymentRecord[]): Map<string, number> {
    const totals = new Map<string, number>();

    payments.forEach((payment) => {
      const leaseId = String(payment.leaseId ?? '');

      if (!leaseId) {
        return;
      }

      const amount = extractCurrencyValue(payment.amount);

      totals.set(leaseId, (totals.get(leaseId) ?? 0) + amount);
    });

    return totals;
  }

  private buildChargeFilter(
    start: string,
    end: string,
    propertyId?: string,
  ): Record<string, unknown> {
    const filter: Record<string, unknown> = {
      chargeType: { eq: RENT_CHARGE_TYPE },
      status: { in: OPEN_CHARGE_STATUSES },
      dueDate: {
        gte: start,
        lt: end,
      },
    };

    if (propertyId) {
      filter.propertyId = { eq: propertyId };
    }

    return filter;
  }

  private buildPaymentFilter(
    start: string,
    end: string,
    propertyId?: string,
  ): Record<string, unknown> {
    const filter: Record<string, unknown> = {
      status: { eq: COMPLETED_PAYMENT_STATUS },
      paymentDate: {
        gte: start,
        lt: end,
      },
    };

    if (propertyId) {
      filter.propertyId = { eq: propertyId };
    }

    return filter;
  }
}
