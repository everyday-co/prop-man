import { Args, Float, ID, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

import { RentRollService } from '../services/rent-roll.service';
import { RecordPaymentResponseType } from '../dtos/record-payment.type';

@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
@Resolver()
export class PaymentResolver {
  constructor(private readonly rentRollService: RentRollService) {}

  @Mutation(() => RecordPaymentResponseType)
  async recordPayment(
    @Args('leaseChargeId', { type: () => ID }) leaseChargeId: string,
    @Args('leaseId', { type: () => ID }) leaseId: string,
    @Args('amount', { type: () => Float }) amount: number,
    @Args('paymentDate') paymentDate: string,
    @Args('referenceNumber', { nullable: true }) referenceNumber?: string,
    @Args('memo', { nullable: true }) memo?: string,
    @AuthWorkspace() workspace?: WorkspaceEntity,
  ): Promise<RecordPaymentResponseType> {
    if (!workspace) {
      throw new Error('Workspace context is required');
    }

    return await this.rentRollService.recordPayment(
      {
        leaseChargeId,
        leaseId,
        amount,
        paymentDate,
        referenceNumber,
        memo,
      },
      workspace.id,
    );
  }
}
