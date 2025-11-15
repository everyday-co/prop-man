import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PropertySummary {
  @Field(() => ID)
  propertyId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  address?: string;

  @Field(() => Int)
  totalUnits: number;

  @Field(() => Int)
  occupiedUnits: number;

  @Field(() => Float)
  occupancyPercent: number;

  @Field(() => Float)
  monthlyRentRoll: number;

  @Field(() => Float)
  monthlyCollected: number;

  @Field(() => Float)
  monthlyDelinquent: number;

  @Field(() => Int)
  openWorkOrderCount: number;
}
