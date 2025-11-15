import { Module } from '@nestjs/common';

import { RecordCrudModule } from 'src/engine/core-modules/record-crud/record-crud.module';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';

import { PropertyPortfolioResolver } from './resolvers/property-portfolio.resolver';
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
  ],
  exports: [PropertyPortfolioResolver],
})
export class PropertyManagementModule {}
