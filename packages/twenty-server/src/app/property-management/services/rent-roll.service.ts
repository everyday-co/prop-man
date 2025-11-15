import { Injectable, Logger, Scope } from '@nestjs/common';

import { PropertyManagementObjectService } from 'src/app/property-management/services/property-management-object.service';
import { extractCurrencyValue } from 'src/app/property-management/utils/currency.utils';
import { getMonthDateRange } from 'src/app/property-management/utils/month.utils';

const RENT_CHARGE_TYPE = 'Rent';
const RENT_CHARGE_STATUSES = ['Open', 'Partially Paid', 'Paid'];
const COMPLETED_PAYMENT_STATUS = 'Completed';

@Injectable({ scope: Scope.REQUEST })
export class RentRollService {
  private readonly logger = new Logger(RentRollService.name);

  constructor(
    private readonly objectService: PropertyManagementObjectService,
  ) {}

  async getPropertyRentRoll(
    propertyId: string,
    month: string,
  ): Promise<number> {
    const range = getMonthDateRange(month);
    const filter = {
      ...this.buildPropertyFilter(propertyId),
      chargeType: { eq: RENT_CHARGE_TYPE },
      status: { in: RENT_CHARGE_STATUSES },
      dueDate: {
        gte: range.start,
        lt: range.end,
      },
    } satisfies Record<string, unknown>;

    const charges = await this.objectService.fetchLeaseCharges(filter);

    return charges.reduce(
      (sum, charge) => sum + extractCurrencyValue(charge.amount),
      0,
    );
  }

  async getPropertyCollected(
    propertyId: string,
    month: string,
  ): Promise<number> {
    const range = getMonthDateRange(month);
    const filter = {
      ...this.buildPropertyFilter(propertyId),
      status: { eq: COMPLETED_PAYMENT_STATUS },
      paymentDate: {
        gte: range.start,
        lt: range.end,
      },
    } satisfies Record<string, unknown>;

    const payments = await this.objectService.fetchPayments(filter);

    return payments.reduce(
      (sum, payment) => sum + extractCurrencyValue(payment.amount),
      0,
    );
  }

  async getPropertyDelinquent(
    propertyId: string,
    month: string,
  ): Promise<number> {
    try {
      const [rentRoll, collected] = await Promise.all([
        this.getPropertyRentRoll(propertyId, month),
        this.getPropertyCollected(propertyId, month),
      ]);

      return Math.max(rentRoll - collected, 0);
    } catch (error) {
      this.logger.error(
        `Failed to compute delinquent balance for property ${propertyId}: ${error instanceof Error ? error.message : error}`,
      );

      throw error;
    }
  }

  private buildPropertyFilter(propertyId: string) {
    return {
      propertyId: {
        eq: propertyId,
      },
    } satisfies Record<string, unknown>;
  }
}
