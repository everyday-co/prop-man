import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class RecordPaymentResponseType {
  @Field(() => GraphQLJSON)
  payment: Record<string, unknown>;

  @Field(() => GraphQLJSON)
  updatedCharge: Record<string, unknown>;
}
