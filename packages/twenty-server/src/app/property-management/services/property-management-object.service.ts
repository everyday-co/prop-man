import {
  Injectable,
  InternalServerErrorException,
  Logger,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';

import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import {
  type LeaseChargeRecord,
  type LeaseRecord,
  type PaymentRecord,
  type PropertyRecord,
  type UnitRecord,
  type WorkOrderRecord,
} from 'src/app/property-management/types/property-management.types';

const DEFAULT_PAGE_SIZE = 200;
const PROPERTY_OBJECT_NAME = 'property';
const UNIT_OBJECT_NAME = 'unit';
const LEASE_OBJECT_NAME = 'lease';
const WORK_ORDER_OBJECT_NAME = 'workOrder';
const LEASE_CHARGE_OBJECT_NAME = 'leaseCharge';
const PAYMENT_OBJECT_NAME = 'payment';

@Injectable({ scope: Scope.REQUEST })
export class PropertyManagementObjectService {
  private readonly logger = new Logger(PropertyManagementObjectService.name);
  private readonly workspaceId: string | null;
  private readonly userWorkspaceId: string | null;

  constructor(
    private readonly findRecordsService: FindRecordsService,
    private readonly createRecordService: CreateRecordService,
    private readonly updateRecordService: UpdateRecordService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {
    const context = this.scopedWorkspaceContextFactory.create();

    this.workspaceId = context.workspaceId;
    this.userWorkspaceId = context.userWorkspaceId;
  }

  async fetchProperties(): Promise<PropertyRecord[]> {
    return this.fetchAllRecords<PropertyRecord>(PROPERTY_OBJECT_NAME);
  }

  async fetchPropertyById(propertyId: string): Promise<PropertyRecord | null> {
    const [record] = await this.fetchAllRecords<PropertyRecord>(
      PROPERTY_OBJECT_NAME,
      this.buildIdFilter('id', propertyId),
      1,
    );

    return record ?? null;
  }

  async fetchUnitsByProperty(propertyId: string): Promise<UnitRecord[]> {
    return this.fetchAllRecords<UnitRecord>(
      UNIT_OBJECT_NAME,
      this.buildRelationFilter('propertyId', propertyId),
    );
  }

  async fetchLeasesByProperty(
    propertyId: string,
    statusFilter?: string[],
  ): Promise<LeaseRecord[]> {
    const filter: Record<string, unknown> = {
      ...this.buildRelationFilter('propertyId', propertyId),
    };

    if (statusFilter && statusFilter.length > 0) {
      filter.leaseStatus = {
        in: statusFilter,
      };
    }

    return this.fetchAllRecords<LeaseRecord>(LEASE_OBJECT_NAME, filter);
  }

  async countOpenWorkOrders(
    propertyId: string,
    openStatuses: string[],
  ): Promise<number> {
    if (openStatuses.length === 0) {
      return 0;
    }

    const filter: Record<string, unknown> = {
      ...this.buildRelationFilter('propertyId', propertyId),
      status: {
        in: openStatuses,
      },
    };

    const records = await this.fetchAllRecords<WorkOrderRecord>(
      WORK_ORDER_OBJECT_NAME,
      filter,
    );

    return records.length;
  }

  async fetchLeaseCharges(
    filter: Record<string, unknown>,
  ): Promise<LeaseChargeRecord[]> {
    return this.fetchAllRecords<LeaseChargeRecord>(
      LEASE_CHARGE_OBJECT_NAME,
      filter,
    );
  }

  async fetchPayments(
    filter: Record<string, unknown>,
  ): Promise<PaymentRecord[]> {
    return this.fetchAllRecords<PaymentRecord>(PAYMENT_OBJECT_NAME, filter);
  }

  private buildRelationFilter(fieldName: string, id: string) {
    return {
      [fieldName]: {
        eq: id,
      },
    } satisfies Record<string, unknown>;
  }

  private buildIdFilter(fieldName: string, id: string) {
    return this.buildRelationFilter(fieldName, id);
  }

  private ensureContext(): { workspaceId: string; userWorkspaceId: string } {
    if (!this.workspaceId || !this.userWorkspaceId) {
      throw new UnauthorizedException(
        'Workspace context is required for property-management queries',
      );
    }

    return {
      workspaceId: this.workspaceId,
      userWorkspaceId: this.userWorkspaceId,
    };
  }

  private async fetchAllRecords<TRecord extends Record<string, unknown>>(
    objectName: string,
    filter?: Record<string, unknown>,
    pageSize = DEFAULT_PAGE_SIZE,
  ): Promise<TRecord[]> {
    const { workspaceId, userWorkspaceId } = this.ensureContext();
    const records: TRecord[] = [];
    let offset = 0;

    while (true) {
      const response = await this.findRecordsService.execute({
        objectName,
        workspaceId,
        userWorkspaceId,
        filter,
        limit: pageSize,
        offset,
      });

      if (!response.success || !response.result) {
        this.logger.error(
          `Failed to load ${objectName} records: ${response.error ?? response.message}`,
        );

        throw new InternalServerErrorException(
          `Unable to load ${objectName} records`,
        );
      }

      const batch = response.result.records as TRecord[];

      records.push(...batch);

      if (
        records.length >= response.result.totalCount ||
        batch.length < pageSize
      ) {
        break;
      }

      offset += pageSize;
    }

    return records;
  }

  async createPayment(
    paymentData: Partial<PaymentRecord>,
  ): Promise<PaymentRecord> {
    const { workspaceId, userWorkspaceId } = this.ensureContext();

    const response = await this.createRecordService.execute({
      objectName: PAYMENT_OBJECT_NAME,
      objectRecord: paymentData,
      workspaceId,
      userWorkspaceId,
    });

    if (!response.success || !response.result) {
      this.logger.error(
        `Failed to create payment: ${response.error ?? response.message}`,
      );
      throw new InternalServerErrorException('Unable to create payment');
    }

    return response.result as PaymentRecord;
  }

  async updateLeaseCharge(
    chargeId: string,
    updates: Partial<LeaseChargeRecord>,
  ): Promise<LeaseChargeRecord> {
    const { workspaceId, userWorkspaceId } = this.ensureContext();

    const response = await this.updateRecordService.execute({
      objectName: LEASE_CHARGE_OBJECT_NAME,
      objectRecordId: chargeId,
      objectRecord: updates,
      workspaceId,
      userWorkspaceId,
    });

    if (!response.success || !response.result) {
      this.logger.error(
        `Failed to update lease charge: ${response.error ?? response.message}`,
      );
      throw new InternalServerErrorException('Unable to update lease charge');
    }

    return response.result as LeaseChargeRecord;
  }
}
