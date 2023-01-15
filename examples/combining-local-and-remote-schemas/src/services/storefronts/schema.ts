import { GraphQLError } from 'graphql';
import { createSchema } from 'graphql-yoga';

// data fixtures
const storefronts = [
  { id: '1', name: 'The Product Store' },
  { id: '2', name: 'eShoppe' },
];

const typeDefs = /* GraphQL */ `
  type Storefront {
    id: ID!
    name: String!
  }

  type Query {
    storefront(id: ID!): Storefront
    _sdl: String!
  }
`;

export const schema = createSchema({
  typeDefs,
  resolvers: {
    Query: {
      storefront: (root, { id }) =>
        storefronts.find(s => s.id === id) ||
        new GraphQLError('Record not found', {
          extensions: {
            code: 'NOT_FOUND',
          },
        }),
      _sdl: () => typeDefs,
    },
  },
});
