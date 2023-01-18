import { createSchema } from 'graphql-yoga';
import { GraphQLError } from 'graphql';

const products = [
  { upc: '1', name: 'Table', price: 899, weight: 100 },
  { upc: '2', name: 'Couch', price: 1299, weight: 1000 },
  { upc: '3', name: 'Chair', price: 54, weight: 50 },
];

export const catalogSchema = createSchema({
  typeDefs: /* GraphQL */ `
    type Product {
      upc: ID!
      msrp: Int!
      name: String
      weight: Int!
    }

    type Query {
      productsByUpc(upcs: [ID!]!): [Product]!
    }
  `,
  resolvers: {
    Query: {
      productsByUpc: (_root, { upcs }) =>
        upcs.map(
          (upc: string) =>
            products.find(product => product.upc === upc) ||
            new GraphQLError('Record not found', {
              extensions: {
                code: 'NOT_FOUND',
              },
            })
        ),
    },
  },
});
