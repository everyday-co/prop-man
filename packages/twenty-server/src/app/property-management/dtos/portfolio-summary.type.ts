import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { PropertySummary } from './property-summary.type';

@ObjectType()
export class PortfolioSummary {
  @Field()
  month: string;

  @Field(() => Int)
  totalProperties: number;

  @Field(() => Int)
  totalUnits: number;

  @Field(() => Float)
  overallOccupancyPercent: number;

  @Field(() => Float)
  portfolioRentRoll: number;

  @Field(() => Float)
  portfolioCollected: number;

  @Field(() => Float)
  portfolioDelinquent: number;

  @Field(() => Int)
  totalOpenWorkOrders: number;

  @Field(() => [PropertySummary])
  properties: PropertySummary[];
}
