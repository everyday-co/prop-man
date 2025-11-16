import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class DelinquencyReportType {
  @Field(() => [GraphQLJSON])
  delinquentCharges: Record<string, unknown>[];

  @Field(() => Float)
  totalOverdue: number;

  @Field(() => Int)
  affectedTenants: number;

  @Field(() => Int)
  affectedProperties: number;
}
