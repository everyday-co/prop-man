import { Injectable, Logger, Scope } from '@nestjs/common';

import { PropertyManagementObjectService } from 'src/app/property-management/services/property-management-object.service';
import {
  type LeaseChargeRecord,
  type PaymentRecord,
} from 'src/app/property-management/types/property-management.types';
import { extractCurrencyValue } from 'src/app/property-management/utils/currency.utils';
import { getMonthDateRange } from 'src/app/property-management/utils/month.utils';

const RENT_CHARGE_TYPE = 'Rent';
const RENT_CHARGE_STATUSES = ['Open', 'Partially Paid', 'Paid'];
const COMPLETED_PAYMENT_STATUS = 'Completed';

// Types for rent roll feature
export type RentChargeWithPayments = LeaseChargeRecord & {
  payments?: PaymentRecord[];
  daysOverdue?: number;
};

export type RentRollSummary = {
  totalCharges: number;
  totalPaid: number;
  totalOutstanding: number;
  chargesCount: number;
  paidCount: number;
  overdueCount: number;
};

export type RentRollResponse = {
  charges: RentChargeWithPayments[];
  summary: RentRollSummary;
};

export type DelinquencyReportResponse = {
  delinquentCharges: RentChargeWithPayments[];
  totalOverdue: number;
  affectedTenants: number;
  affectedProperties: number;
};

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

  // NEW: Get full rent roll with charges and payments
  async getRentRoll(filters: {
    startDate?: string;
    endDate?: string;
    propertyId?: string;
    status?: string[];
  } = {}): Promise<RentRollResponse> {
    // Build filter for lease charges
    const chargeFilter: Record<string, unknown> = {};

    // Date range filter (charge date)
    if (filters.startDate || filters.endDate) {
      const dateFilter: Record<string, unknown> = {};
      if (filters.startDate) {
        dateFilter.gte = filters.startDate;
      }
      if (filters.endDate) {
        dateFilter.lte = filters.endDate;
      }
      chargeFilter.chargeDate = dateFilter;
    }

    // Property filter
    if (filters.propertyId) {
      chargeFilter.propertyId = { eq: filters.propertyId };
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      chargeFilter.status = { in: filters.status };
    }

    // Fetch lease charges
    const charges = await this.objectService.fetchLeaseCharges(chargeFilter);

    // Fetch related payments for each charge
    const chargesWithPayments: RentChargeWithPayments[] = await Promise.all(
      charges.map(async (charge) => {
        const payments = await this.objectService.fetchPayments({
          rentChargeId: { eq: charge.id },
        });

        // Calculate days overdue if applicable
        let daysOverdue = 0;
        if (
          charge.dueDate &&
          charge.status !== 'Paid' &&
          charge.status !== 'Waived'
        ) {
          const dueDate = new Date(charge.dueDate);
          const today = new Date();
          const diffTime = today.getTime() - dueDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 0) {
            daysOverdue = diffDays;
          }
        }

        return {
          ...charge,
          payments,
          daysOverdue,
        };
      }),
    );

    // Calculate summary
    const summary = this.calculateRentRollSummary(chargesWithPayments);

    return {
      charges: chargesWithPayments,
      summary,
    };
  }

  // NEW: Get payment history for a specific lease
  async getLeasePaymentHistory(leaseId: string): Promise<{
    charges: RentChargeWithPayments[];
    totalCharged: number;
    totalPaid: number;
    currentBalance: number;
  }> {
    // Fetch all charges for this lease
    const charges = await this.objectService.fetchLeaseCharges({
      leaseId: { eq: leaseId },
    });

    // Fetch payments for each charge
    const chargesWithPayments: RentChargeWithPayments[] = await Promise.all(
      charges.map(async (charge) => {
        const payments = await this.objectService.fetchPayments({
          rentChargeId: { eq: charge.id },
        });

        return {
          ...charge,
          payments,
        };
      }),
    );

    // Calculate totals
    const totalCharged = chargesWithPayments.reduce((sum, charge) => {
      return sum + extractCurrencyValue(charge.amount);
    }, 0);

    const totalPaid = chargesWithPayments.reduce((sum, charge) => {
      const paidAmount =
        charge.payments?.reduce((paySum, payment) => {
          return paySum + extractCurrencyValue(payment.amount);
        }, 0) || 0;
      return sum + paidAmount;
    }, 0);

    const currentBalance = totalCharged - totalPaid;

    return {
      charges: chargesWithPayments.sort((a, b) => {
        const dateA = new Date(a.dueDate || 0).getTime();
        const dateB = new Date(b.dueDate || 0).getTime();
        return dateB - dateA; // Most recent first
      }),
      totalCharged,
      totalPaid,
      currentBalance,
    };
  }

  async recordPayment(
    input: {
      leaseChargeId: string;
      leaseId: string;
      amount: number;
      paymentDate: string;
      referenceNumber?: string;
      memo?: string;
    },
    workspaceId: string,
  ): Promise<{
    payment: PaymentRecord;
    updatedCharge: LeaseChargeRecord;
  }> {
    // Fetch the charge to get current balance
    const charges = await this.objectService.fetchLeaseCharges({
      id: { eq: input.leaseChargeId },
    });

    if (charges.length === 0) {
      throw new Error(`Lease charge ${input.leaseChargeId} not found`);
    }

    const charge = charges[0];
    const currentBalance = extractCurrencyValue(charge.balanceRemaining);
    const chargeAmount = extractCurrencyValue(charge.amount);

    // Convert payment amount from dollars to micros
    const paymentAmountMicros = Math.round(input.amount * 1000000);

    if (paymentAmountMicros > currentBalance * 1000000) {
      throw new Error(
        `Payment amount ($${input.amount}) exceeds balance remaining ($${currentBalance})`,
      );
    }

    // Create the payment
    const currencyCode =
      typeof charge.amount === 'object' && charge.amount !== null
        ? charge.amount.currencyCode || 'USD'
        : 'USD';

    const payment = await this.objectService.createPayment({
      leaseId: input.leaseId,
      rentChargeId: input.leaseChargeId,
      amount: {
        amountMicros: paymentAmountMicros,
        currencyCode,
      },
      paymentDate: input.paymentDate,
      referenceNumber: input.referenceNumber,
      memo: input.memo,
      status: 'Cleared',
    });

    // Calculate new balance
    const newBalance = currentBalance - input.amount;

    // Determine new status
    let newStatus = charge.status;
    if (newBalance === 0) {
      newStatus = 'Paid';
    } else if (newBalance < chargeAmount) {
      newStatus = 'Partial';
    }

    // Update the charge with new balance and status
    const updatedCharge = await this.objectService.updateLeaseCharge(
      input.leaseChargeId,
      {
        balanceRemaining: {
          amountMicros: Math.round(newBalance * 1000000),
          currencyCode,
        },
        status: newStatus,
      },
    );

    this.logger.log(
      `Payment recorded: $${input.amount} for charge ${input.leaseChargeId}. New balance: $${newBalance}`,
    );

    return {
      payment,
      updatedCharge,
    };
  }

  // NEW: Get delinquency report
  async getDelinquencyReport(
    daysOverdue = 1,
  ): Promise<DelinquencyReportResponse> {
    // Fetch all charges that are not paid or waived
    const charges = await this.objectService.fetchLeaseCharges({
      status: { in: ['Billed', 'Partial', 'Overdue', 'Open', 'Partially Paid'] },
    });

    // Filter to only overdue charges and fetch payments
    const today = new Date();
    const delinquentCharges: RentChargeWithPayments[] = [];

    for (const charge of charges) {
      if (!charge.dueDate) continue;

      const dueDate = new Date(charge.dueDate);
      const diffTime = today.getTime() - dueDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= daysOverdue) {
        const payments = await this.objectService.fetchPayments({
          rentChargeId: { eq: charge.id },
        });

        delinquentCharges.push({
          ...charge,
          payments,
          daysOverdue: diffDays,
        });
      }
    }

    // Calculate delinquency summary
    const totalOverdue = delinquentCharges.reduce((sum, charge) => {
      return sum + extractCurrencyValue(charge.balanceRemaining || charge.amount);
    }, 0);

    const affectedTenants = new Set(
      delinquentCharges.map((c) => c.tenantId).filter(Boolean),
    ).size;

    const affectedProperties = new Set(
      delinquentCharges.map((c) => c.propertyId).filter(Boolean),
    ).size;

    return {
      delinquentCharges: delinquentCharges.sort((a, b) => {
        return (b.daysOverdue || 0) - (a.daysOverdue || 0); // Most overdue first
      }),
      totalOverdue,
      affectedTenants,
      affectedProperties,
    };
  }

  // Helper: Calculate rent roll summary
  private calculateRentRollSummary(
    charges: RentChargeWithPayments[],
  ): RentRollSummary {
    let totalCharges = 0;
    let totalPaid = 0;
    let paidCount = 0;
    let overdueCount = 0;

    for (const charge of charges) {
      const chargeAmount = extractCurrencyValue(charge.amount);
      totalCharges += chargeAmount;

      // Calculate total paid for this charge
      const chargePaid =
        charge.payments?.reduce((sum, payment) => {
          return sum + extractCurrencyValue(payment.amount);
        }, 0) || 0;

      totalPaid += chargePaid;

      // Count paid charges
      if (charge.status === 'Paid') {
        paidCount++;
      }

      // Count overdue charges
      if (
        charge.status === 'Overdue' ||
        (charge.daysOverdue && charge.daysOverdue > 0)
      ) {
        overdueCount++;
      }
    }

    return {
      totalCharges,
      totalPaid,
      totalOutstanding: totalCharges - totalPaid,
      chargesCount: charges.length,
      paidCount,
      overdueCount,
    };
  }
}
