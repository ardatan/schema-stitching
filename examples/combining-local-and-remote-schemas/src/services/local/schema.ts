import { makeExecutableSchema } from '@graphql-tools/schema';

export const localSchema = makeExecutableSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      errorCodes: [String!]!
    }
  `,
  resolvers: {
    Query: {
      errorCodes: () => ['NOT_FOUND', 'GRAPHQL_PARSE_FAILED', 'GRAPHQL_VALIDATION_FAILED'],
    },
  },
});
