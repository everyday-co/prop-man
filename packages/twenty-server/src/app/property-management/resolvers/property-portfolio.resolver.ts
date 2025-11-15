import {
  Logger,
  NotFoundException,
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
import { PortfolioSummary } from 'src/app/property-management/dtos/portfolio-summary.type';
import { PropertySummary } from 'src/app/property-management/dtos/property-summary.type';
import { DelinquencyService } from 'src/app/property-management/services/delinquency.service';
import { PropertyManagementObjectService } from 'src/app/property-management/services/property-management-object.service';
import { RentRollService } from 'src/app/property-management/services/rent-roll.service';
import {
  type LeaseRecord,
  type PropertyRecord,
} from 'src/app/property-management/types/property-management.types';
import {
  getMonthDateRange,
  normalizeMonthInput,
} from 'src/app/property-management/utils/month.utils';

const ACTIVE_LEASE_STATUSES = ['Active', 'Renewal Offered', 'Renewal Signed'];
const OPEN_WORK_ORDER_STATUSES = [
  'New',
  'In Review',
  'Scheduled',
  'In Progress',
  'Waiting on Resident',
];

@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
@Resolver(() => PropertySummary)
export class PropertyPortfolioResolver {
  private readonly logger = new Logger(PropertyPortfolioResolver.name);

  constructor(
    private readonly objectService: PropertyManagementObjectService,
    private readonly rentRollService: RentRollService,
    private readonly delinquencyService: DelinquencyService,
  ) {}

  @Query(() => PortfolioSummary)
  async portfolioSummary(
    @Args('month') month: string,
    @AuthWorkspace() _workspace: WorkspaceEntity,
  ): Promise<PortfolioSummary> {
    const normalizedMonth = normalizeMonthInput(month);
    const properties = await this.objectService.fetchProperties();

    const summaries = await Promise.all(
      properties.map((property) =>
        this.buildPropertySummary(property, normalizedMonth),
      ),
    );

    return this.buildPortfolioSummary(normalizedMonth, summaries);
  }

  @Query(() => PropertySummary)
  async propertyDashboard(
    @Args('propertyId', { type: () => ID }) propertyId: string,
    @Args('month') month: string,
    @AuthWorkspace() _workspace: WorkspaceEntity,
  ): Promise<PropertySummary> {
    const normalizedMonth = normalizeMonthInput(month);
    const property = await this.objectService.fetchPropertyById(propertyId);

    if (!property) {
      throw new NotFoundException(
        `Property ${propertyId} could not be located in this workspace`,
      );
    }

    return this.buildPropertySummary(property, normalizedMonth);
  }

  private async buildPropertySummary(
    property: PropertyRecord,
    month: string,
  ): Promise<PropertySummary> {
    const [units, leases, rentRoll, collected, delinquent, openWorkOrders] =
      await Promise.all([
        this.objectService.fetchUnitsByProperty(property.id),
        this.objectService.fetchLeasesByProperty(
          property.id,
          ACTIVE_LEASE_STATUSES,
        ),
        this.rentRollService.getPropertyRentRoll(property.id, month),
        this.rentRollService.getPropertyCollected(property.id, month),
        this.delinquencyService.getDelinquentByProperty(property.id, month),
        this.objectService.countOpenWorkOrders(
          property.id,
          OPEN_WORK_ORDER_STATUSES,
        ),
      ]);

    const monthRange = getMonthDateRange(month);
    const occupiedUnits = this.countOccupiedUnits(
      leases,
      monthRange.start,
      monthRange.end,
    );
    const totalUnits = this.resolveUnitCount(property, units.length);
    const occupancyPercent = this.computeOccupancyPercent(
      occupiedUnits,
      totalUnits,
    );

    return {
      propertyId: property.id,
      name: this.resolvePropertyName(property),
      address: this.buildAddress(property),
      totalUnits,
      occupiedUnits,
      occupancyPercent,
      monthlyRentRoll: this.roundCurrency(rentRoll),
      monthlyCollected: this.roundCurrency(collected),
      monthlyDelinquent: this.roundCurrency(delinquent),
      openWorkOrderCount: openWorkOrders,
    };
  }

  private buildPortfolioSummary(
    month: string,
    properties: PropertySummary[],
  ): PortfolioSummary {
    const totals = properties.reduce(
      (acc, property) => {
        acc.totalUnits += property.totalUnits;
        acc.occupiedUnits += property.occupiedUnits;
        acc.portfolioRentRoll += property.monthlyRentRoll;
        acc.portfolioCollected += property.monthlyCollected;
        acc.portfolioDelinquent += property.monthlyDelinquent;
        acc.totalOpenWorkOrders += property.openWorkOrderCount;

        return acc;
      },
      {
        totalUnits: 0,
        occupiedUnits: 0,
        portfolioRentRoll: 0,
        portfolioCollected: 0,
        portfolioDelinquent: 0,
        totalOpenWorkOrders: 0,
      },
    );

    const overallOccupancyPercent = this.computeOccupancyPercent(
      totals.occupiedUnits,
      totals.totalUnits,
    );

    return {
      month,
      totalProperties: properties.length,
      totalUnits: totals.totalUnits,
      overallOccupancyPercent,
      portfolioRentRoll: this.roundCurrency(totals.portfolioRentRoll),
      portfolioCollected: this.roundCurrency(totals.portfolioCollected),
      portfolioDelinquent: this.roundCurrency(totals.portfolioDelinquent),
      totalOpenWorkOrders: totals.totalOpenWorkOrders,
      properties,
    };
  }

  private countOccupiedUnits(
    leases: LeaseRecord[],
    periodStart: string,
    periodEnd: string,
  ): number {
    return leases.filter((lease) =>
      this.isLeaseActiveDuringPeriod(lease, periodStart, periodEnd),
    ).length;
  }

  private isLeaseActiveDuringPeriod(
    lease: LeaseRecord,
    periodStart: string,
    periodEnd: string,
  ): boolean {
    if (!lease.startDate) {
      return false;
    }

    const leaseStart = new Date(lease.startDate).getTime();
    const leaseEnd = lease.endDate
      ? new Date(lease.endDate).getTime()
      : Number.POSITIVE_INFINITY;
    const rangeStart = new Date(periodStart).getTime();
    const rangeEnd = new Date(periodEnd).getTime();

    return leaseStart < rangeEnd && leaseEnd >= rangeStart;
  }

  private resolveUnitCount(property: PropertyRecord, fallback: number): number {
    const value = Number(property.unitCount ?? fallback);

    return Number.isFinite(value) && value >= 0 ? Math.trunc(value) : 0;
  }

  private computeOccupancyPercent(
    occupiedUnits: number,
    totalUnits: number,
  ): number {
    if (!totalUnits || totalUnits <= 0) {
      return 0;
    }

    const percent = (occupiedUnits / totalUnits) * 100;

    return Number(percent.toFixed(2));
  }

  private resolvePropertyName(property: PropertyRecord): string {
    const name = property.name?.toString().trim();

    return name && name.length > 0 ? name : 'Untitled Property';
  }

  private buildAddress(property: PropertyRecord): string | undefined {
    const segments = [
      property.street?.toString().trim(),
      property.city?.toString().trim(),
      property.state?.toString().trim(),
      property.postalCode?.toString().trim(),
    ].filter((segment) => segment && segment.length > 0) as string[];

    return segments.length > 0 ? segments.join(', ') : undefined;
  }

  private roundCurrency(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Number(value.toFixed(2));
  }
}
