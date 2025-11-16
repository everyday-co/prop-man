import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

// Use GraphQLJSON for flexible, metadata-driven structures
@ObjectType()
export class RentRollSummary {
  @Field(() => Float)
  totalCharges: number;

  @Field(() => Float)
  totalPaid: number;

  @Field(() => Float)
  totalOutstanding: number;

  @Field(() => Int)
  chargesCount: number;

  @Field(() => Int)
  paidCount: number;

  @Field(() => Int)
  overdueCount: number;
}

@ObjectType()
export class RentRollResponseType {
  @Field(() => [GraphQLJSON])
  charges: Record<string, unknown>[];

  @Field(() => RentRollSummary)
  summary: RentRollSummary;
}
