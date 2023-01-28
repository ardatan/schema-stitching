import { GraphQLError } from 'graphql';
import { createSchema } from 'graphql-yoga';

// data fixtures
const products = [
  { upc: '1', name: 'Cookbook', price: 15.99 },
  { upc: '2', name: 'Toothbrush', price: 3.99 },
];

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Product {
      name: String!
      price: Float!
      upc: ID!
    }

    type Query {
      product(upc: ID!): Product
    }
  `,
  resolvers: {
    Query: {
      product: (root, { upc }) =>
        products.find(p => p.upc === upc) ||
        new GraphQLError('Record not found', {
          extensions: {
            code: 'NOT_FOUND',
          },
        }),
    },
  },
});
