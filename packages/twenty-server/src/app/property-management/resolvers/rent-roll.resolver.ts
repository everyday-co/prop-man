import {
  Logger,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { RentRollService } from 'src/app/property-management/services/rent-roll.service';
import { RentRollResponseType } from 'src/app/property-management/dtos/rent-roll-response.type';
import { LeasePaymentHistoryType } from 'src/app/property-management/dtos/lease-payment-history.type';
import { DelinquencyReportType } from 'src/app/property-management/dtos/delinquency-report.type';

@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
@Resolver()
export class RentRollResolver {
  private readonly logger = new Logger(RentRollResolver.name);

  constructor(private readonly rentRollService: RentRollService) {}

  @Query(() => RentRollResponseType, {
    description: 'Get rent roll with charges and payments for a date range',
  })
  async rentRoll(
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('endDate', { nullable: true }) endDate?: string,
    @Args('propertyId', { type: () => ID, nullable: true }) propertyId?: string,
    @Args('status', { type: () => [String], nullable: true }) status?: string[],
    @AuthWorkspace() _workspace?: WorkspaceEntity,
  ): Promise<RentRollResponseType> {
    this.logger.log(
      `Fetching rent roll: ${startDate || 'no start'} to ${endDate || 'no end'}, property: ${propertyId || 'all'}, status: ${status?.join(',') || 'all'}`,
    );

    const result = await this.rentRollService.getRentRoll({
      startDate,
      endDate,
      propertyId,
      status,
    });

    return {
      charges: result.charges,
      summary: result.summary,
    };
  }

  @Query(() => LeasePaymentHistoryType, {
    description: 'Get complete payment history for a specific lease',
  })
  async leasePaymentHistory(
    @Args('leaseId', { type: () => ID }) leaseId: string,
    @AuthWorkspace() _workspace?: WorkspaceEntity,
  ): Promise<LeasePaymentHistoryType> {
    this.logger.log(`Fetching payment history for lease: ${leaseId}`);

    const result = await this.rentRollService.getLeasePaymentHistory(leaseId);

    return {
      charges: result.charges,
      totalCharged: result.totalCharged,
      totalPaid: result.totalPaid,
      currentBalance: result.currentBalance,
    };
  }

  @Query(() => DelinquencyReportType, {
    description: 'Get delinquency report showing all overdue charges',
  })
  async delinquencyReport(
    @Args('daysOverdue', { defaultValue: 1 }) daysOverdue: number,
    @AuthWorkspace() _workspace?: WorkspaceEntity,
  ): Promise<DelinquencyReportType> {
    this.logger.log(`Fetching delinquency report: ${daysOverdue}+ days overdue`);

    const result = await this.rentRollService.getDelinquencyReport(daysOverdue);

    return {
      delinquentCharges: result.delinquentCharges,
      totalOverdue: result.totalOverdue,
      affectedTenants: result.affectedTenants,
      affectedProperties: result.affectedProperties,
    };
  }
}
