import { Field, Float, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class LeasePaymentHistoryType {
  @Field(() => [GraphQLJSON])
  charges: Record<string, unknown>[];

  @Field(() => Float)
  totalCharged: number;

  @Field(() => Float)
  totalPaid: number;

  @Field(() => Float)
  currentBalance: number;
}
