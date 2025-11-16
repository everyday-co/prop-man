import { Module } from '@nestjs/common';

import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';

import { PropertyPortfolioResolver } from './resolvers/property-portfolio.resolver';
import { RentRollResolver } from './resolvers/rent-roll.resolver';
import { PaymentResolver } from './resolvers/payment.resolver';
import { DelinquencyService } from './services/delinquency.service';
import { PropertyManagementObjectService } from './services/property-management-object.service';
import { RentRollService } from './services/rent-roll.service';

@Module({
  imports: [RecordCrudModule],
  providers: [
    ScopedWorkspaceContextFactory,
    PropertyManagementObjectService,
    RentRollService,
    DelinquencyService,
    PropertyPortfolioResolver,
    RentRollResolver,
    PaymentResolver,
  ],
  exports: [PropertyPortfolioResolver, RentRollResolver, PaymentResolver],
})
export class PropertyManagementModule {}
