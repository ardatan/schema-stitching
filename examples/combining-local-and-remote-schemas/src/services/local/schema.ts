import { createSchema } from 'graphql-yoga';

export const localSchema = createSchema({
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
